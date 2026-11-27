import { defineStore } from 'pinia'
import type { ConnectionState } from '../../services/websocket/client'
import { windowDefinitions, type WindowKind, type WorkspaceWindow } from '../../types/windows'
import type { RibbonTab, WorkspaceEditor } from '../../config/workbenchChrome'

export type WorkspaceDock = 'explorer' | 'properties'

function dockLimits(dock: WorkspaceDock, viewport: number) {
  const explorer = dock === 'explorer'
  const max = Math.floor(Math.min(explorer ? 420 : 500, viewport * (explorer ? .28 : .37)))
  const min = Math.min(explorer ? 144 : 210, max)
  const preferred = viewport * (explorer ? .16 : .22)
  const width = Math.min(max, Math.max(min, Math.round(Math.min(preferred, explorer ? 258 : 348))))
  return { min, max, width }
}

function bound(window: WorkspaceWindow, width: number, height: number, insets: { left: number; top: number }) {
  const left = Math.min(insets.left, width), top = Math.min(insets.top, height)
  window.width = Math.min(windowDefinitions[window.kind].width, width - left)
  window.height = Math.min(windowDefinitions[window.kind].height, height - top)
  window.x = Math.max(left, Math.min(window.x, width - window.width))
  window.y = Math.max(top, Math.min(window.y, height - window.height))
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeRibbonTab: 'component' as RibbonTab,
    activeRibbonGroup: null as string | null,
    activeEditor: '3d' as WorkspaceEditor,
    schematicZoom: 100,
    componentToolbarCollapsed: false,
    toolsSidebarCollapsed: false,
    explorerVisible: true,
    notificationsOpen: false,
    focusRestore: null as { ribbon: boolean; tools: boolean } | null,
    dockWidths: { explorer: null, properties: null } as Record<WorkspaceDock, number | null>,
    pinnedDocks: { explorer: true, properties: true } as Record<WorkspaceDock, boolean>,
    workbenchSize: { width: 900, height: 600 },
    windows: [] as WorkspaceWindow[],
    viewport: { width: 900, height: 500 },
    connectionState: 'idle' as ConnectionState,
  }),
  getters: {
    componentOverlayHeight: () => 96,
    toolsOverlayWidth: (state) => state.workbenchSize.width <= 560 ? 54 : 66,
    explorerOpen: state => state.explorerVisible && !state.focusRestore,
    propertiesOpen: state => !state.focusRestore && state.windows.some(window => window.kind === 'inspector' && window.open),
    dockLayout: (state) => (dock: WorkspaceDock) => {
      const limits = dockLimits(dock, state.workbenchSize.width)
      const width = state.dockWidths[dock] ?? limits.width
      return { ...limits, width: Math.min(limits.max, Math.max(limits.min, width)) }
    },
    drawerInsets(): { left: number; top: number } {
      return { left: this.toolsSidebarCollapsed ? 0 : this.toolsOverlayWidth, top: this.componentToolbarCollapsed ? 0 : this.componentOverlayHeight }
    },
  },
  actions: {
    toggleExplorer() {
      if (this.focusRestore) {
        this.toggleWorkspaceFocus()
        this.explorerVisible = true
      } else this.explorerVisible = !this.explorerVisible
    },
    toggleProperties() {
      if (this.propertiesOpen) this.closeWindow('inspector')
      else this.openWindow('inspector')
    },
    toggleDockPin(dock: WorkspaceDock) {
      this.pinnedDocks[dock] = !this.pinnedDocks[dock]
    },
    selectEditor(editor: WorkspaceEditor) {
      this.activeEditor = editor
    },
    setSchematicZoom(value: number) {
      if (Number.isFinite(value)) this.schematicZoom = Math.max(50, Math.min(200, value))
    },
    openLibrary(group: string) {
      this.selectRibbonTab('component')
      this.activeRibbonGroup = group
    },
    setDockWidth(dock: WorkspaceDock, width: number | null) {
      if (width === null) { this.dockWidths[dock] = null; return }
      if (!Number.isFinite(width)) return
      const { min, max } = this.dockLayout(dock)
      this.dockWidths[dock] = Math.min(max, Math.max(min, Math.round(width)))
    },
    toggleWorkspaceFocus() {
      if (this.focusRestore) {
        this.componentToolbarCollapsed = this.focusRestore.ribbon
        this.toolsSidebarCollapsed = this.focusRestore.tools
        this.focusRestore = null
        this.boundWindows()
      } else {
        this.focusRestore = { ribbon: this.componentToolbarCollapsed, tools: this.toolsSidebarCollapsed }
        this.componentToolbarCollapsed = true
        this.toolsSidebarCollapsed = true
        this.activeRibbonGroup = null
      }
    },
    selectRibbonTab(tab: RibbonTab) {
      if (this.focusRestore) this.toggleWorkspaceFocus()
      if(this.activeRibbonTab!==tab)this.activeRibbonGroup=null
      this.activeRibbonTab=tab
      if(this.componentToolbarCollapsed){this.componentToolbarCollapsed=false;this.boundWindows()}
    },
    toggleRibbon(id: string) { if (!this.componentToolbarCollapsed && this.activeRibbonTab==='component') this.activeRibbonGroup = this.activeRibbonGroup === id ? null : id },
    toggleComponentToolbar() {
      if (this.focusRestore) {
        this.toggleWorkspaceFocus()
        if (!this.componentToolbarCollapsed) return
      }
      this.componentToolbarCollapsed = !this.componentToolbarCollapsed
      this.activeRibbonGroup = null
      if (!this.componentToolbarCollapsed) this.boundWindows()
    },
    toggleToolsSidebar() {
      if (this.focusRestore) {
        this.toggleWorkspaceFocus()
        if (!this.toolsSidebarCollapsed) return
      }
      this.toolsSidebarCollapsed = !this.toolsSidebarCollapsed
      if (!this.toolsSidebarCollapsed) this.boundWindows()
    },
    boundWindows() { for (const window of this.windows) bound(window, this.viewport.width, this.viewport.height, this.drawerInsets) },
    setWorkbenchSize(width: number, height: number) {
      if (!Number.isFinite(width) || !Number.isFinite(height)) return
      width = Math.max(0, width); height = Math.max(0, height)
      if (this.workbenchSize.width === width && this.workbenchSize.height === height) return
      this.workbenchSize = { width, height }
      this.boundWindows()
    },
    setViewport(width: number, height: number) {
      if (!Number.isFinite(width) || !Number.isFinite(height)) return
      width = Math.max(0, width); height = Math.max(0, height)
      if (this.viewport.width === width && this.viewport.height === height) return
      this.viewport = { width, height }
      this.boundWindows()
    },
    openWindow(kind: WindowKind, options: { activate?: boolean } = {}) {
      if (kind === 'inspector' && this.focusRestore) this.toggleWorkspaceFocus()
      let window = this.windows.find((entry) => entry.kind === kind)
      if (!window) {
        const index = this.windows.length
        window = { kind, open: true, x: 32 + index * 26, y: 36 + index * 22, width: windowDefinitions[kind].width, height: windowDefinitions[kind].height, z: 0, activation: 0 }
        this.windows.push(window)
      }
      window.open = true
      bound(window, this.viewport.width, this.viewport.height, this.drawerInsets)
      this.focusWindow(kind)
      if (options.activate !== false) window.activation++
    },
    closeWindow(kind: WindowKind) { const window = this.windows.find((entry) => entry.kind === kind); if (window) window.open = false },
    focusWindow(kind: WindowKind) {
      const ordered = [...this.windows].sort((a, b) => a.z - b.z)
      const active = ordered.find((entry) => entry.kind === kind)
      if (!active) return
      const rest = ordered.filter((entry) => entry !== active)
      rest.push(active)
      rest.forEach((entry, index) => { entry.z = index + 1 })
    },
    moveWindow(kind: WindowKind, x: number, y: number) {
      const window = this.windows.find((entry) => entry.kind === kind)
      if (!window || !Number.isFinite(x) || !Number.isFinite(y)) return
      window.x = x; window.y = y
      bound(window, this.viewport.width, this.viewport.height, this.drawerInsets)
    },
  },
})
