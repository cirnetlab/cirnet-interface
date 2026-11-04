import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Bone, BoxGeometry, DoubleSide, Float32BufferAttribute, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Skeleton, SkinnedMesh, SphereGeometry, Uint16BufferAttribute, Vector3, type BufferGeometry, type Intersection } from 'three'
import { createDepthRaycast } from '../e2e/depth-raycast'

const material = () => new MeshBasicMaterial({ side: DoubleSide })
function prepare<T extends Mesh>(mesh: T): T { mesh.updateMatrixWorld(true); mesh.geometry.computeBoundingBox(); mesh.geometry.computeBoundingSphere(); return mesh }
function sameHit(actual: Intersection | undefined, expected: Intersection | undefined) {
  assert.equal(!!actual, !!expected)
  if (!actual || !expected) return
  assert.equal(actual.object, expected.object)
  assert.equal(actual.distance, expected.distance)
  assert.deepEqual(actual.point.toArray(), expected.point.toArray())
  assert.equal(actual.faceIndex, expected.faceIndex)
  assert.deepEqual(actual.uv?.toArray(), expected.uv?.toArray())
  assert.deepEqual(actual.normal?.toArray(), expected.normal?.toArray())
}
function compare(objects: Mesh[], rays = 31) {
  const firstHit = createDepthRaycast(objects)
  const ranges = objects.map(mesh => ({ range: mesh.geometry.drawRange, ...mesh.geometry.drawRange }))
  for (let i = 0; i < rays; i++) {
    const ray = new Raycaster(new Vector3((i % 7 - 3) * .24, (Math.floor(i / 7) % 5 - 2) * .19, 4), new Vector3(.01, -.02, -1).normalize(), i % 3 === 0 ? .1 : 0, i % 4 === 0 ? 3.5 : Infinity)
    sameHit(firstHit(ray), ray.intersectObjects(objects, false)[0])
    objects.forEach((mesh, index) => {
      assert.equal(mesh.geometry.drawRange, ranges[index]!.range)
      assert.equal(mesh.geometry.drawRange.start, ranges[index]!.start)
      assert.equal(mesh.geometry.drawRange.count, ranges[index]!.count)
    })
  }
}

test('depth observer preserves indexed and nonindexed native hits through transformed geometry and layers', () => {
  for (const nonindexed of [false, true]) {
    let geometry: BufferGeometry = new SphereGeometry(1, 24, 16)
    if (nonindexed) geometry = geometry.toNonIndexed()
    const mesh = new Mesh(geometry, material()); mesh.rotation.set(.17, .31, -.08); mesh.scale.set(-1.2, .8, .7)
    prepare(mesh); compare([mesh], 91)
    mesh.layers.set(1); compare([mesh])
  }
})

test('depth observer keeps original object and triangle tie ordering with shared geometry', () => {
  const geometry = new SphereGeometry(1, 24, 16)
  const first = prepare(new Mesh(geometry, material())), second = prepare(new Mesh(geometry, material()))
  compare([first, second], 77); compare([second, first], 77)
  second.position.x = 1.1; prepare(second); compare([first, second], 77)
})

test('depth observer private bounds preserve a shared custom fallback hit before any native bounding box exists', () => {
  const geometry = new BoxGeometry(1, 1, 1), ordinary = new Mesh(geometry, material()), shifted = new Mesh(geometry, material())
  shifted.getVertexPosition = function(index, target) { return Mesh.prototype.getVertexPosition.call(this, index, target).add(new Vector3(.2, 0, 0)) }
  ordinary.updateMatrixWorld(true); shifted.updateMatrixWorld(true)
  const ray = new Raycaster(new Vector3(.6, .1, 3), new Vector3(0, 0, -1)), objects = [ordinary, shifted]
  const reference = ray.intersectObjects(objects, false)[0]
  assert.equal(reference?.object, shifted); assert.equal(geometry.boundingBox, null)
  const firstHit = createDepthRaycast(objects)
  assert.equal(geometry.boundingBox, null, 'observer preparation cannot install a new bound on shared native geometry')
  sameHit(firstHit(ray), reference); assert.equal(geometry.boundingBox, null)
})

test('depth observer respects finite draw ranges and single materials ignore geometry groups', () => {
  const geometry = new SphereGeometry(1, 24, 16)
  geometry.setDrawRange(12, 600)
  geometry.clearGroups(); geometry.addGroup(42, 30, 0); geometry.addGroup(0, 12, 0)
  compare([prepare(new Mesh(geometry, material()))], 91)
  for (const [start, count] of [[1, 317], [0, 313], [NaN, 3], [Infinity, 3], [0, -1]] as const) {
    geometry.setDrawRange(start, count); compare([prepare(new Mesh(geometry, material()))], 7)
  }
})

test('depth observer retains material-array groups and custom native raycast behavior', () => {
  const geometry = new SphereGeometry(1, 24, 16)
  geometry.clearGroups(); geometry.addGroup(300, 300, 1); geometry.addGroup(0, 300, 0)
  compare([prepare(new Mesh(geometry, [material(), material()]))], 77)
  const custom = prepare(new Mesh(new SphereGeometry(1, 24, 16), material()))
  let calls = 0
  custom.raycast = function(raycaster, hits) { calls++; Mesh.prototype.raycast.call(this, raycaster, hits) }
  compare([custom], 31); assert.equal(calls, 62)
  const deformed = prepare(new Mesh(new SphereGeometry(1, 24, 16), material()))
  deformed.getVertexPosition = function(index, target) { return Mesh.prototype.getVertexPosition.call(this, index, target).add(new Vector3(.2, .1, 0)) }
  compare([deformed], 77)
})

test('depth observer keeps instancing, skinning and morph deformation on native fallback paths', () => {
  const instanced = new InstancedMesh(new SphereGeometry(1, 12, 8), material(), 2)
  instanced.setMatrixAt(0, new Matrix4()); instanced.setMatrixAt(1, new Matrix4().makeTranslation(1.5, 0, 0)); prepare(instanced)
  compare([instanced], 35)
  const morph = new SphereGeometry(1, 12, 8), displaced = morph.attributes.position!.clone()
  for (let i = 0; i < displaced.count; i++) displaced.setX(i, displaced.getX(i) + .3)
  morph.morphAttributes.position = [displaced]
  const morphed = new Mesh(morph, material()); morphed.morphTargetInfluences![0] = .5; prepare(morphed); compare([morphed], 35)
  const skin = new SphereGeometry(1, 12, 8), count = skin.attributes.position!.count
  skin.setAttribute('skinIndex', new Uint16BufferAttribute(new Uint16Array(count * 4), 4))
  const weights = new Float32BufferAttribute(new Float32Array(count * 4), 4)
  for (let i = 0; i < count; i++) weights.setX(i, 1)
  skin.setAttribute('skinWeight', weights)
  const bone = new Bone(), skinned = new SkinnedMesh(skin, material()); skinned.add(bone); skinned.bind(new Skeleton([bone])); prepare(skinned); skinned.skeleton.update()
  compare([skinned], 35)
})

test('depth observer retains a custom intersection kernel and unsafe bounds on native fallback paths', () => {
  const custom = prepare(new Mesh(new SphereGeometry(1, 24, 16), material())) as unknown as Mesh & { _computeIntersections: (...args: any[]) => void }
  const kernel = custom._computeIntersections; let calls = 0
  custom._computeIntersections = function(...args) { calls++; kernel.apply(this, args) }
  const ray = new Raycaster(new Vector3(.23, .17, 3), new Vector3(0, 0, -1)), firstHit = createDepthRaycast([custom])
  sameHit(firstHit(ray), ray.intersectObjects([custom], false)[0]); assert.equal(calls, 2)
  const unsafe = prepare(new Mesh(new SphereGeometry(1, 24, 16), material()))
  unsafe.geometry.boundingBox!.min.x = NaN; compare([unsafe], 7)
  prepare(unsafe); unsafe.matrixWorld.elements[3] = .02; compare([unsafe], 7)
})

test('depth observer keeps later global native-method overrides on the original fallback path', () => {
  const ray = new Raycaster(new Vector3(.23, .17, 3), new Vector3(0, 0, -1)), raycast = Mesh.prototype.raycast, vertexPosition = Mesh.prototype.getVertexPosition
  let calls = 0
  try {
    Mesh.prototype.raycast = function(...args) { calls++; return raycast.apply(this, args) }
    const mesh = prepare(new Mesh(new SphereGeometry(1, 24, 16), material())), firstHit = createDepthRaycast([mesh])
    sameHit(firstHit(ray), ray.intersectObjects([mesh], false)[0]); assert.equal(calls, 2)
  } finally { Mesh.prototype.raycast = raycast }
  try {
    calls = 0
    Mesh.prototype.getVertexPosition = function(index, target) { calls++; return vertexPosition.call(this, index, target).add(new Vector3(.2, .1, 0)) }
    const mesh = prepare(new Mesh(new SphereGeometry(1, 24, 16), material())), reference = ray.intersectObjects([mesh], false)[0], fullCalls = calls
    const firstHit = createDepthRaycast([mesh]); calls = 0
    sameHit(firstHit(ray), reference); assert.equal(calls, fullCalls)
  } finally { Mesh.prototype.getVertexPosition = vertexPosition }
})

test('depth observer reduces actual native triangle reads without changing the first hit', () => {
  const geometry = new SphereGeometry(1, 48, 32), mesh = prepare(new Mesh(geometry, material()))
  const ray = new Raycaster(new Vector3(.23, .17, 3), new Vector3(0, 0, -1)), position = geometry.attributes.position!
  const getX = position.getX.bind(position); let reads = 0
  position.getX = index => { reads++; return getX(index) }
  const expected = ray.intersectObjects([mesh], false)[0], fullReads = reads
  const firstHit = createDepthRaycast([mesh]); reads = 0
  sameHit(firstHit(ray), expected)
  assert.ok(reads < fullReads * .7, `native vertex reads ${reads} must be below 70% of the original ${fullReads}`)
})

test('depth observer restores a shared geometry draw range when the native kernel throws', () => {
  const geometry = new SphereGeometry(1, 48, 32); geometry.setDrawRange(12, 3000)
  const first = prepare(new Mesh(geometry, material())), second = prepare(new Mesh(geometry, material())), range = geometry.drawRange
  const firstHit = createDepthRaycast([first, second]), position = geometry.attributes.position!, getX = position.getX.bind(position)
  position.getX = () => { throw Error('native triangle failure') }
  assert.throws(() => firstHit(new Raycaster(new Vector3(.1, .8, 3), new Vector3(0, 0, -1))), /native triangle failure/)
  assert.equal(geometry.drawRange, range); assert.deepEqual(range, { start: 12, count: 3000 })
  position.getX = getX
  compare([first, second], 31)
})

test('depth observer optional oracle compares each native first hit after restoring ranges', () => {
  const mesh = prepare(new Mesh(new BoxGeometry(1, 1, 1, 8, 8, 8), material())), range = mesh.geometry.drawRange
  let checked = 0
  const firstHit = createDepthRaycast([mesh], (actual, reference) => { sameHit(actual, reference); checked++; assert.equal(range.count, Infinity) })
  for (let i = 0; i < 11; i++) firstHit(new Raycaster(new Vector3(i * .1 - .5, 0, 3), new Vector3(0, 0, -1)))
  assert.equal(checked, 11)
})
