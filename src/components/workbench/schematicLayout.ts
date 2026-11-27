import type { CircuitGraph } from '../../types/circuit'
import { parseEndpoint } from '../../electrical/connectivity/endpoints'

const columnWidth = 248
const rowHeight = 114
export const schematicNodeWidth = 160
export const schematicNodeHeight = 54

/** Deterministic presentation coordinates for the logical links already declared in the graph. */
export function layoutSchematic(graph: CircuitGraph | null | undefined) {
  const modules = graph?.modules ?? []
  const columns = Math.min(3, Math.max(1, modules.length))
  const nodes = modules.map((module, index) => ({
    module, x: 54 + index % columns * columnWidth,
    y: 48 + Math.floor(index / columns) * rowHeight,
  }))
  const byId = new Map(nodes.map(node => [node.module.id, node]))
  const outputIndices = new Map<string, number>()
  const inputIndices = new Map<string, number>()
  const links = (graph?.connections ?? []).map((link, index) => {
    const source = byId.get(parseEndpoint(link.source)?.moduleId ?? '')
    const destination = byId.get(parseEndpoint(link.destination)?.moduleId ?? '')
    if (!source || !destination) return { link, path: null }
    const outputIndex = outputIndices.get(link.source) ?? outputIndices.size
    const inputIndex = inputIndices.get(link.destination) ?? inputIndices.size
    outputIndices.set(link.source, outputIndex)
    inputIndices.set(link.destination, inputIndex)
    const startX = source.x + schematicNodeWidth
    const startY = source.y + 14 + outputIndex % 5 * 6
    const endX = destination.x
    const endY = destination.y + 14 + inputIndex % 5 * 6
    const lane = destination.y - 13 - index % 4 * 6
    const outset = 12 + index % 5 * 5
    return { link, path: `M ${startX} ${startY} H ${startX + outset} V ${lane} H ${endX - outset} V ${endY} H ${endX}` }
  })
  return {
    nodes, links,
    width: columns * columnWidth + 20,
    height: Math.max(176, Math.ceil(nodes.length / columns) * rowHeight + 25),
  }
}
