export const ribbonTabs = [
  { id: 'file', label: 'File' },
  { id: 'view', label: 'View' },
  { id: 'component', label: 'Component' },
  { id: 'run', label: 'Simulate' },
  { id: 'library', label: 'Library' },
  { id: 'window', label: 'Window' },
  { id: 'help', label: 'Help' },
] as const

export type RibbonTab = typeof ribbonTabs[number]['id']

export const editorTabs = [
  { id: '3d', label: '3D Simulation', icon: 'view-3d' },
  { id: 'schematic', label: 'Schematic', icon: 'schematic' },
] as const

export type WorkspaceEditor = typeof editorTabs[number]['id']
