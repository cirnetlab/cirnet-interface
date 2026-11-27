<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCircuitStore } from '../../../stores/documents/circuit'
import { useUiStore } from '../../../stores/workbench/ui'
import { useWorkspaceStore } from '../../../stores/workbench/workspace'
import { useInstrumentStore } from '../../../stores/lab/instrument'
import { MAX_CIRCUIT_FILE_BYTES, parseCircuitFile } from '../../../services/files/circuitFile'
import { iconUrl } from '../../../data/ribbon'
import WorkbenchIcon from './WorkbenchIcon.vue'
import AccountMenu from '../../account/AccountMenu.vue'
import { useProjectStore } from '../../../stores/documents/projects'
import { useWorkspaceMessageStore } from '../../../stores/workbench/workspaceMessages'
import { executeFileCommand, type FileCommand, type FileMenuItem } from './fileCommands'
import { editingTools, focusWorkbenchCanvas, tabIndexForKey } from './workspaceCommands'
import { ribbonTabs, type RibbonTab } from '../../../config/workbenchChrome'
const circuit = useCircuitStore()
const ui = useUiStore()
const workspace = useWorkspaceStore()
const instrument = useInstrumentStore()
const projects=useProjectStore()
const messages = useWorkspaceMessageStore()
const fileInput = ref<HTMLInputElement>()
const error = ref('')
const commandInput = ref<HTMLInputElement>()
const commandDialog = ref<HTMLDialogElement>()
const commandTrigger = ref<HTMLButtonElement>()
const showCommands = ref(false)
const commandQuery = ref('')
const isFullscreen = ref(false)
const supportsFullscreen = ref(false)
type SearchCommand = Pick<FileMenuItem, 'label' | 'disabled' | 'shortcut' | 'restoreFocus'> & {
  id: string
  activate: () => void
}
const visibleCommands = computed(() => {
  const entries: SearchCommand[] = [
    ...fileItems.value.map(item => ({ ...item, activate: () => fileCommand(item.id) })),
    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', disabled: !circuit.canUndo, activate: () => circuit.undo() },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', disabled: !circuit.canRedo, activate: () => circuit.redo() },
    ...editingTools.map(tool => ({
      id: tool.id, label: tool.name + ' tool', disabled: false, restoreFocus: false,
      activate: () => { ui.selectEditor('3d'); workspace.setTool(tool.id); void nextTick(focusWorkbenchCanvas) },
    })),
    { id: 'fit', label: 'Fit entire circuit', disabled: !circuit.graph?.modules.length, activate: () => { ui.selectEditor('3d'); void nextTick(() => workspace.fitEntireCircuit()) } },
    { id: 'explorer', label: 'Toggle Project Explorer', disabled: false, activate: () => ui.toggleExplorer() },
    { id: '3d-view', label: 'Show 3D Simulation', disabled: false, activate: () => ui.selectEditor('3d') },
    { id: 'schematic-view', label: 'Show Schematic', disabled: false, activate: () => ui.selectEditor('schematic') },
    { id: 'notifications', label: 'Show Notifications', disabled: false, activate: () => { ui.notificationsOpen = true } },
    { id: 'inspector', label: 'Open PropertyManager', disabled: false, restoreFocus: false, activate: () => ui.openWindow('inspector') },
    { id: 'focus', label: ui.focusRestore ? 'Exit Focus Mode' : 'Enter Focus Mode', disabled: false, activate: () => ui.toggleWorkspaceFocus() },
    { id: 'ribbon', label: ui.componentToolbarCollapsed ? 'Expand Ribbon' : 'Collapse Ribbon', disabled: false, activate: () => ui.toggleComponentToolbar() },
  ]
  entries.push(...ribbonTabs.map(tab => ({
    id: 'ribbon-' + tab.id, label: 'Open ' + tab.label + ' Ribbon', disabled: false,
    activate: () => ui.selectRibbonTab(tab.id),
  })))
  const terms = commandQuery.value.trim().toLowerCase().split(/\s+/)
  return entries.filter(item => terms.every(term => item.label.toLowerCase().includes(term)))
})
function openCommands() {
  if (showCommands.value) {
    commandInput.value?.focus()
    return
  }
  commandQuery.value = ''
  showCommands.value = true
  void nextTick(() => {
    commandDialog.value?.showModal()
    commandInput.value?.focus()
  })
}
function closeCommands(restore = true) {
  commandDialog.value?.close()
  showCommands.value = false
  if (restore) commandTrigger.value?.focus()
}
function runSearchCommand(item: SearchCommand) {
  if (item.disabled) return
  closeCommands(item.restoreFocus !== false)
  item.activate()
}
function runFirstCommand() {
  const first = visibleCommands.value.find(item => !item.disabled)
  if (first) runSearchCommand(first)
}
let readVersion = 0, disposed = false
let errorCommand: 'import' | 'export' | null = null
function clearError() { error.value = ''; errorCommand = null; messages.clearSource('file') }
function fileError(reason: unknown, fallback: string, command: 'import' | 'export') {
  errorCommand = command
  error.value = reason instanceof Error ? reason.message : fallback
  messages.setHint('file', error.value, { level: 'error', scope: 'draft' })
  instrument.log(error.value, 'error', { source: 'file', scope: 'draft' })
}
watch(()=>projects.saveState.principalId,()=>{readVersion++;clearError();if(fileInput.value)fileInput.value.value=''}, {flush:'sync'})
const newFile = () => { readVersion++; if (fileInput.value) fileInput.value.value = ''; circuit.createDraft(); clearError() }
async function openFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const version = ++readVersion
  try {
    if (file.size > MAX_CIRCUIT_FILE_BYTES) throw new Error('Circuit file is too large (maximum 2 MB).')
    const contents = await file.text()
    if (disposed || version !== readVersion) return
    circuit.importGraph(parseCircuitFile(contents))
    clearError()
    messages.publish('file', `Opened ${file.name} locally.`, { scope: 'draft' })
    instrument.log(`Opened ${file.name} locally.`, 'info', { source: 'file', scope: 'draft' })
  } catch (reason) { if (!disposed && version === readVersion) fileError(reason, 'Cannot open circuit file.', 'import') }
  finally { if (version === readVersion) input.value = '' }
}
function saveFile() {
  if (!circuit.current || projects.navigationPending) return
  try {
    const url = URL.createObjectURL(new Blob([circuit.exportGraph()], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${circuit.current.name.replace(/[^\p{L}\p{N}_.-]/gu, '_').slice(0, 80) || 'circuit'}.json`
    document.body.append(link)
    try { link.click() } finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0) }
    // Export does not resolve a failed Import. Keep that actionable error until
    // another import succeeds, New is chosen, or the user dismisses it.
    if (errorCommand === 'export') clearError()
    messages.publish('file', 'Circuit JSON export requested.', { scope: 'draft' })
    instrument.log('Circuit JSON export requested.', 'info', { source: 'file', scope: 'draft' })
  } catch (reason) { fileError(reason, 'Cannot save circuit file.', 'export') }
}
const fileItems = computed<FileMenuItem[]>(() => [
  { id: 'new', label: 'New', disabled: false, shortcut: 'Ctrl+N' },
  { id: 'open', label: 'Open Project', disabled: false, shortcut: 'Ctrl+O', restoreFocus: false },
  { id: 'save', label: 'Save', disabled: !circuit.current || projects.navigationPending || projects.saveState.phase === 'saving', shortcut: 'Ctrl+S', restoreFocus: !!projects.saveState.binding },
  { id: 'saveAs', label: 'Save As', disabled: !circuit.current || projects.navigationPending, restoreFocus: false },
  { id: 'import', label: 'Import', disabled: false, restoreFocus: false },
  { id: 'export', label: 'Export', disabled: !circuit.current || projects.navigationPending },
  { id: 'history', label: 'History', disabled: false, restoreFocus: false },
  { id: 'assignment', label: 'Assignment', disabled: false, restoreFocus: false },
])
function fileCommand(id: FileCommand) {
  executeFileCommand(fileItems.value, id, command => {
    if (command === 'new') newFile()
    if (command === 'open' || command === 'saveAs') ui.openWindow('projects')
    if (command === 'save') { if (projects.saveState.binding) void projects.saveCurrent(); else ui.openWindow('projects') }
    if (command === 'import') fileInput.value?.click()
    if (command === 'export') saveFile()
    if (command === 'history') ui.openWindow('history')
    if (command === 'assignment') ui.openWindow('assignments')
  })
}
function saveServer() { fileCommand('save') }
defineExpose({ fileItems, fileCommand })
const focusedTab = ref<RibbonTab>(ui.activeRibbonTab)
watch(() => ui.activeRibbonTab, tab => { focusedTab.value = tab })
function selectTab(tab: RibbonTab) { focusedTab.value = tab; ui.selectRibbonTab(tab) }
function tabKey(event: KeyboardEvent) {
  const next = tabIndexForKey(event, ribbonTabs.findIndex(tab => tab.id === focusedTab.value), ribbonTabs.length)
  if (next === null) return
  event.preventDefault()
  event.stopPropagation()
  focusedTab.value = ribbonTabs[next].id
  const tablist = (event.currentTarget as HTMLElement).parentElement
  void nextTick(() => tablist?.querySelector<HTMLButtonElement>(`#workbench-tab-${focusedTab.value}`)?.focus())
}
function fullscreenChanged() { isFullscreen.value = !!document.fullscreenElement }
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    messages.publish('workspace', 'The browser could not change full screen mode.', { level: 'warning', scope: 'session' })
  }
}
function shortcuts(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey)) return
  const key = event.key.toLowerCase()
  if (key === 'q') { event.preventDefault(); openCommands(); return }
  const target = event.target as HTMLElement | null
  if (target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return
  if (!['n', 'o', 's', 'z', 'y'].includes(key)) return
  event.preventDefault()
  if (key === 'n') fileCommand('new')
  if (key === 'o') fileCommand('open')
  if (key === 's') saveServer()
  if (key === 'z') { if (event.shiftKey ? circuit.canRedo : circuit.canUndo) event.shiftKey ? circuit.redo() : circuit.undo() }
  if (key === 'y' && circuit.canRedo) circuit.redo()
}
onMounted(() => {
  window.addEventListener('keydown', shortcuts)
  if (typeof document === 'undefined' || !document.fullscreenEnabled || !document.documentElement?.requestFullscreen) return
  supportsFullscreen.value = true
  fullscreenChanged()
  document.addEventListener('fullscreenchange', fullscreenChanged)
})
onUnmounted(() => {
  disposed = true
  readVersion++
  window.removeEventListener('keydown', shortcuts)
  if (supportsFullscreen.value) document.removeEventListener('fullscreenchange', fullscreenChanged)
})
</script>
<template>
  <header class="app-titlebar">
    <div class="brand" aria-label="CIRNET LAB"><span class="brand-mark"><img :src="iconUrl('favicon')" alt="" width="38" height="38" /></span><strong><span class="brand-circuit">CIRNET</span> <span class="brand-remote">LAB</span></strong></div>
    <div class="header-command-strip">
      <div class="quick-actions" role="group" aria-label="Edit history">
      <button class="quick-file-action" aria-label="New circuit" title="New circuit (Ctrl+N)" @click="fileCommand('new')"><WorkbenchIcon name="new" /></button>
      <button class="quick-file-action" aria-label="Browse project files" title="Open project (Ctrl+O)" @click="fileCommand('open')"><WorkbenchIcon name="open" /></button>
      <button class="quick-file-action" aria-label="Save current circuit" title="Save (Ctrl+S)" :disabled="fileItems.find(item => item.id === 'save')?.disabled" @click="fileCommand('save')"><WorkbenchIcon name="save" /></button>
      <button aria-label="Undo" title="Undo (Ctrl+Z)" :disabled="!circuit.canUndo" @click="circuit.undo()"><WorkbenchIcon name="undo" /></button>
      <button aria-label="Redo" title="Redo (Ctrl+Shift+Z)" :disabled="!circuit.canRedo" @click="circuit.redo()"><WorkbenchIcon name="redo" /></button>
      </div>
    </div>
    <div class="project-title" :title="circuit.current?.name || 'No circuit'"><span class="dirty-dot" v-if="projects.saveState.dirty" aria-label="Unsaved changes" /><span class="project-name">{{ circuit.current?.name || 'No circuit open' }}</span><small>{{ projects.saveState.binding ? 'SERVER · '+projects.saveState.phase : 'LOCAL DRAFT' }}</small></div>
    <button ref="commandTrigger" type="button" class="command-trigger" :aria-expanded="showCommands"
      aria-label="Search commands" title="Search commands (Ctrl+Q)" @click="showCommands ? closeCommands() : openCommands()">
      <WorkbenchIcon name="search" /><span>Search commands</span><kbd>Ctrl+Q</kbd>
    </button>
    <dialog v-if="showCommands" ref="commandDialog" class="command-palette" aria-label="Search commands"
      data-workspace-text-input @pointerdown.self="closeCommands()" @keydown.esc.stop.prevent="closeCommands()"
      @cancel.prevent="closeCommands()">
      <div class="command-palette-content">
        <input ref="commandInput" v-model="commandQuery" type="search" aria-label="Filter commands"
          placeholder="Type a command" @keydown.enter.prevent="runFirstCommand" />
        <p v-if="!visibleCommands.length">No matching commands</p>
        <ul v-else>
          <li v-for="item in visibleCommands" :key="item.id">
            <button type="button" :disabled="item.disabled" @click="runSearchCommand(item)">
              {{ item.label }} <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
            </button>
          </li>
        </ul>
        <button type="button" @click="closeCommands()">Close search</button>
      </div>
    </dialog>
    <AccountMenu />
    <button type="button" class="header-icon-button" aria-label="Notifications" title="Notifications"
      :aria-expanded="ui.notificationsOpen" aria-controls="system-message-details"
      @click="ui.notificationsOpen = !ui.notificationsOpen"><WorkbenchIcon name="notification" /></button>
    <button type="button" id="toggle-project-explorer" class="header-icon-button" aria-label="Project Explorer"
      :aria-pressed="ui.explorerOpen" aria-controls="project-explorer" data-dock-trigger="explorer"
      title="Toggle Project Explorer" @click="ui.toggleExplorer()"><WorkbenchIcon name="explorer" /></button>
    <button type="button" class="header-icon-button" aria-label="Focus Mode"
      :aria-pressed="!!ui.focusRestore" :title="ui.focusRestore ? 'Exit Focus Mode' : 'Focus Mode'"
      @click="ui.toggleWorkspaceFocus()"><WorkbenchIcon name="reset" /></button>
    <button v-if="supportsFullscreen" type="button" class="header-icon-button fullscreen-toggle"
      :aria-label="isFullscreen ? 'Exit full screen' : 'Full screen'" :title="isFullscreen ? 'Exit full screen' : 'Full screen'"
      @click="toggleFullscreen"><WorkbenchIcon :name="isFullscreen ? 'restore-window' : 'full-window'" /></button>
    <button class="inspector-toggle" title="Open Inspector" aria-label="Open Inspector"
      aria-controls="property-manager" :aria-expanded="ui.propertiesOpen" data-dock-trigger="properties"
      @click="ui.openWindow('inspector')"><WorkbenchIcon name="inspector" /><span>Inspector</span></button>
    <input ref="fileInput" class="visually-hidden" type="file" accept=".json,application/json" aria-label="Open circuit file" @change="openFile" />
  </header>
  <div class="ribbon-tabs" :class="{ 'is-collapsed': ui.componentToolbarCollapsed }" role="tablist" aria-label="Workbench ribbon" data-workspace-text-input>
    <button v-for="tab in ribbonTabs" :id="'workbench-tab-' + tab.id" :key="tab.id" type="button" role="tab"
      :aria-selected="ui.activeRibbonTab === tab.id" :aria-controls="'workbench-panel-' + tab.id"
      :tabindex="focusedTab === tab.id ? 0 : -1" @focus="focusedTab = tab.id"
      @click="selectTab(tab.id)" @keydown="tabKey">{{ tab.label }}</button>
  </div>
</template>
