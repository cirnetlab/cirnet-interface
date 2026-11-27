<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { ribbonGroups, iconUrl } from '../../../data/ribbon'
import type { RibbonTab } from '../../../config/workbenchChrome'
import { useCircuitStore } from '../../../stores/documents/circuit'
import { useUiStore } from '../../../stores/workbench/ui'
import { useWorkspaceStore } from '../../../stores/workbench/workspace'
import type { FileCommand, FileMenuItem } from './fileCommands'
import { focusWorkbenchEditor } from './workspaceCommands'
import WorkbenchIcon from './WorkbenchIcon.vue'

interface Command {
  label: string
  icon: string
  run: () => void
  disabled?: boolean
  pressed?: boolean
  asset?: string
  shortcut?: string
}
interface Group { label: string; actions: Command[] }

const props = defineProps<{ tab: Exclude<RibbonTab, 'component' | 'run'>; fileItems: readonly FileMenuItem[] }>()
const emit = defineEmits<{ fileCommand: [id: FileCommand] }>()
const ui = useUiStore()
const workspace = useWorkspaceStore()
const circuit = useCircuitStore()
const fileIcons: Record<FileCommand, string> = {
  new: 'new', open: 'open', save: 'save', saveAs: 'save', import: 'import', export: 'export',
  history: 'history', assignment: 'assignment',
}
function fromFile(ids: FileCommand[]) {
  return props.fileItems.filter(item => ids.includes(item.id)).map(item => ({
    label: item.label, icon: fileIcons[item.id], disabled: item.disabled, shortcut: item.shortcut,
    run: () => emit('fileCommand', item.id),
  }))
}
function open3D() {
  ui.selectEditor('3d')
  void nextTick(() => workspace.fitEntireCircuit())
}
const groups = computed<Group[]>(() => {
  switch (props.tab) {
    case 'file':
      return [
        { label: 'Project', actions: fromFile(['new', 'open', 'save', 'saveAs']) },
        { label: 'Circuit JSON', actions: fromFile(['import', 'export']) },
        { label: 'Lab records', actions: fromFile(['history', 'assignment']) },
      ]
    case 'view':
      return [
        { label: 'Editor', actions: [
          { label: 'Show 3D Simulation', icon: 'view-3d', pressed: ui.activeEditor === '3d', run: () => ui.selectEditor('3d') },
          { label: 'Show Schematic', icon: 'schematic', pressed: ui.activeEditor === 'schematic', run: () => ui.selectEditor('schematic') },
          { label: 'Fit 3D circuit', icon: 'reset', disabled: !circuit.graph?.modules.length, run: open3D },
        ] },
        { label: 'Layout', actions: [
          { label: 'Toggle Project Explorer', icon: 'explorer', pressed: ui.explorerOpen, run: () => ui.toggleExplorer() },
          { label: 'Toggle PropertyManager', icon: 'inspector', pressed: ui.propertiesOpen, run: () => ui.toggleProperties() },
          { label: 'Toggle Focus Mode', icon: 'full-window', pressed: !!ui.focusRestore, run: () => ui.toggleWorkspaceFocus() },
        ] },
      ]
    case 'library':
      return [{ label: 'Component families', actions: ribbonGroups.map(group => ({
        label: group.label, icon: group.glyph ?? 'chip', asset: group.icon ? iconUrl(group.icon) : undefined,
        run: () => ui.openLibrary(group.id),
      })) }]
    case 'window':
      return [
        { label: 'Workbench', actions: [
          { label: 'Project Manager', icon: 'open', run: () => ui.openWindow('projects') },
          { label: 'Experiment history', icon: 'history', run: () => ui.openWindow('history') },
          { label: 'Assignments', icon: 'assignment', run: () => ui.openWindow('assignments') },
        ] },
        { label: 'Instruments', actions: [
          { label: 'Open Power Supply window', icon: 'power-supply', asset: iconUrl('power_supply_upright'), run: () => ui.openWindow('power-supply') },
          { label: 'Open Oscilloscope window', icon: 'scope', asset: iconUrl('oscilloscope_2ch'), run: () => ui.openWindow('oscilloscope') },
          { label: 'Open Function Generator window', icon: 'generator', asset: iconUrl('function_generator_2ch'), run: () => ui.openWindow('generator') },
          { label: 'Open Signal Monitor window', icon: 'monitor', run: () => ui.openWindow('monitor') },
        ] },
      ]
    case 'help':
      return [{ label: 'Workbench help', actions: [
        { label: 'Search workbench commands', icon: 'search', shortcut: 'Ctrl+Q', run: () => document.querySelector<HTMLButtonElement>('.command-trigger')?.click() },
        { label: 'Show recent system messages', icon: 'notification', run: () => { ui.notificationsOpen = true } },
        { label: 'Focus active editor', icon: 'select', run: () => focusWorkbenchEditor(ui.activeEditor) },
      ] }]
  }
})
</script>

<template>
  <div class="ribbon-command-groups">
    <section v-for="group in groups" :key="group.label" class="ribbon-command-group" :aria-label="group.label">
      <div class="ribbon-command-buttons">
        <button v-for="item in group.actions" :key="item.label" type="button" :disabled="item.disabled"
          :aria-pressed="item.pressed" :title="item.shortcut ? item.label + ' (' + item.shortcut + ')' : item.label"
          :data-dock-trigger="item.icon === 'explorer' ? 'explorer' : item.icon === 'inspector' ? 'properties' : undefined"
          @click="item.run">
          <img v-if="item.asset" :src="item.asset" alt="" width="30" height="26" />
          <WorkbenchIcon v-else :name="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </div>
      <small>{{ group.label }}</small>
    </section>
    <section v-if="tab === 'help'" class="ribbon-command-group ribbon-keyboard" aria-label="Keyboard shortcuts">
      <span><kbd>Ctrl+N</kbd> New circuit</span><span><kbd>Ctrl+O</kbd> Open project</span>
      <span><kbd>Ctrl+S</kbd> Save</span><span><kbd>Ctrl+Z</kbd> Undo</span>
    </section>
  </div>
</template>
