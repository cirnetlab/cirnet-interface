import { Box3, Mesh, Vector3, type Intersection, type Raycaster } from 'three'

interface Block { start: number; count: number; bounds: Box3 }
interface PreparedMesh { mesh: Mesh; bounds: Box3 | null; blocks: Block[] | null }
type NativeMesh = Mesh & { _computeIntersections?: unknown; isSkinnedMesh?: boolean; isInstancedMesh?: boolean }
const nativeKernel = (Mesh.prototype as NativeMesh)._computeIntersections
const nativeRaycast = Mesh.prototype.raycast, nativeVertexPosition = Mesh.prototype.getVertexPosition
const BLOCK_SIZE = 64 * 3

function prepare(mesh: Mesh): PreparedMesh {
  const fallback = { mesh, bounds: null, blocks: null }
  const native = mesh as NativeMesh, geometry = mesh.geometry, matrix = mesh.matrixWorld.elements
  if (!(mesh instanceof Mesh) || mesh.raycast !== nativeRaycast || native._computeIntersections !== nativeKernel || mesh.getVertexPosition !== nativeVertexPosition || native.isSkinnedMesh || native.isInstancedMesh || Array.isArray(mesh.material) || Object.values(geometry.morphAttributes).some(attributes => attributes?.length)) return fallback
  if (!matrix.every(Number.isFinite) || matrix[3] !== 0 || matrix[7] !== 0 || matrix[11] !== 0 || matrix[15] !== 1 || mesh.matrixWorld.determinant() === 0) return fallback
  const position = geometry.attributes.position, index = geometry.index, range = geometry.drawRange
  if (!position) return fallback
  const start = Math.max(0, range.start), end = Math.min(index?.count ?? position.count, range.start + range.count)
  if (!Number.isFinite(range.start) || !Number.isInteger(start) || start % 3 || !(range.count === Infinity || Number.isFinite(range.count) && range.count >= 0) || !Number.isInteger(end) || end % 3 || end < start) return fallback
  const worldBounds = (local: Box3) => {
    const bounds = local.clone().applyMatrix4(mesh.matrixWorld), coordinates = [...bounds.min.toArray(), ...bounds.max.toArray()]
    if (bounds.isEmpty() || !coordinates.every(Number.isFinite)) return null
    // Padding only retains extra work at numerical boundaries; it never trims a box.
    return bounds.expandByScalar(Math.max(1, ...coordinates.map(Math.abs)) * 1e-8)
  }
  // Never install a bound on shared geometry: a custom fallback may deform its vertices.
  const point = new Vector3(), localBounds = geometry.boundingBox ?? new Box3()
  if (!geometry.boundingBox) for (let vertex = 0; vertex < position.count; vertex++) localBounds.expandByPoint(point.fromBufferAttribute(position, vertex))
  const bounds = worldBounds(localBounds)
  if (!bounds) return fallback
  if (end - start <= BLOCK_SIZE) return { mesh, bounds, blocks: null }
  const blocks: Block[] = []
  for (let first = start; first < end; first += BLOCK_SIZE) {
    const last = Math.min(end, first + BLOCK_SIZE), local = new Box3()
    for (let offset = first; offset < last; offset++) {
      const vertex = index ? index.getX(offset) : offset
      if (!Number.isInteger(vertex) || vertex < 0 || vertex >= position.count) return fallback
      point.fromBufferAttribute(position, vertex)
      if (![point.x, point.y, point.z].every(Number.isFinite)) return fallback
      local.expandByPoint(point)
    }
    const blockBounds = worldBounds(local)
    if (!blockBounds) return fallback
    blocks.push({ start: first, count: last - first, bounds: blockBounds })
  }
  return { mesh, bounds, blocks }
}

/** Conservative bounds for one synchronous observer pass. Recreate after any
 * geometry/pose change. Triangle math, indices and face indices remain Three's. */
export function createDepthRaycast(objects: readonly Mesh[], verify?: (actual: Intersection | undefined, reference: Intersection | undefined) => void) {
  const meshes = [...objects]
  const prepared = meshes.map(prepare)
  return (raycaster: Raycaster) => {
    const hits: Intersection[] = []
    for (const { mesh, bounds, blocks } of prepared) {
      if (!mesh.layers.test(raycaster.layers) || bounds && !raycaster.ray.intersectsBox(bounds)) continue
      if (!blocks) { mesh.raycast(raycaster, hits); continue }
      const range = mesh.geometry.drawRange, start = range.start, count = range.count
      try {
        // Original triangle order preserves the native stable ordering of ties.
        for (const block of blocks) if (raycaster.ray.intersectsBox(block.bounds)) {
          range.start = block.start; range.count = block.count
          mesh.raycast(raycaster, hits)
        }
      } finally { range.start = start; range.count = count }
    }
    hits.sort((a, b) => a.distance - b.distance)
    const hit = hits[0]
    verify?.(hit, raycaster.intersectObjects(meshes, false)[0])
    return hit
  }
}
