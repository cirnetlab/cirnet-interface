import type { WorkspaceTool } from '../../../stores/workbench/workspace'

export const editingTools: readonly { id: WorkspaceTool; name: string; description: string }[] = [
  { id: 'select', name: 'Select', description: 'Select a component or wire' },
  { id: 'wire', name: 'Wire', description: 'Connect holes and ports' },
  { id: 'move', name: 'Move', description: 'Move a component or selection' },
  { id: 'rotate', name: 'Rotate', description: 'Rotate a component' },
]

export function focusWorkbenchCanvas() {
  document.querySelector<HTMLCanvasElement>('#workbench-view-3d canvas')?.focus()
}
