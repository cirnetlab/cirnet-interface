import type { WorkspaceTool } from '../../../stores/workbench/workspace'
import type { WorkspaceEditor } from '../../../config/workbenchChrome'

export const editingTools: readonly { id: WorkspaceTool; name: string; description: string }[] = [
  { id: 'select', name: 'Select', description: 'Select a component or wire' },
  { id: 'wire', name: 'Wire', description: 'Connect holes and ports' },
  { id: 'move', name: 'Move', description: 'Move a component or selection' },
  { id: 'rotate', name: 'Rotate', description: 'Rotate a component' },
]

export function focusWorkbenchCanvas() {
  document.querySelector<HTMLCanvasElement>('#workbench-view-3d canvas')?.focus()
}

export function focusWorkbenchEditor(editor: WorkspaceEditor) {
  if (editor === '3d') focusWorkbenchCanvas()
  else document.getElementById('workbench-view-schematic')?.focus()
}

export function tabIndexForKey(event: KeyboardEvent, index: number, count: number) {
  if (event.key === 'Home') return 0
  if (event.key === 'End') return count - 1
  if (event.key === 'ArrowLeft') return (index + count - 1) % count
  if (event.key === 'ArrowRight') return (index + 1) % count
  return null
}
