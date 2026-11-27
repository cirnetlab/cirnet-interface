<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useDrawerMotion } from '../../../composables/workbench/useDrawerMotion'
import { useUiStore } from '../../../stores/workbench/ui'
import { focusWorkbenchEditor } from './workspaceCommands'
import type { WindowKind } from '../../../types/windows'
import WorkbenchIcon from './WorkbenchIcon.vue'
const ui = useUiStore()
const root = ref<HTMLElement>()
const drawer = ref<HTMLElement>()
const collapseToggle = ref<HTMLButtonElement>()
const collapseLabel = computed(() => ui.toolsSidebarCollapsed ? 'Expand Tools' : 'Collapse Tools')
const expandedWidth = computed(() => ui.toolsOverlayWidth)
const motion = useDrawerMotion({ collapsed: () => ui.toolsSidebarCollapsed, drawer: () => drawer.value })
watch(() => ui.toolsSidebarCollapsed, (collapsed) => {
  if (collapsed && root.value?.contains(document.activeElement) && document.activeElement !== collapseToggle.value) void nextTick(() => collapseToggle.value?.focus())
})
const launchers: { name: string; icon: string; window: WindowKind }[] = [
  { name: 'Power Supply', icon: 'power-supply', window: 'power-supply' },
  { name: 'Probe', icon: 'probe', window: 'monitor' },
  { name: 'Scope', icon: 'scope', window: 'oscilloscope' },
  { name: 'Function Generator', icon: 'generator', window: 'generator' },
]
function edit() {
  ui.selectEditor('3d')
  void nextTick(() => focusWorkbenchEditor('3d'))
}
</script>
<template>
  <div ref="root" class="tools-panel" :class="{ 'is-collapsed': ui.toolsSidebarCollapsed, 'is-reduced-motion': motion.reducedMotion.value }" :data-drawer-occupied="motion.occupied.value" :style="{ width: expandedWidth + 'px', '--tools-offset': ui.toolsSidebarCollapsed ? '-' + expandedWidth + 'px' : '0px' }">
  <div ref="drawer" class="tools-drawer" :inert="ui.toolsSidebarCollapsed" :aria-hidden="ui.toolsSidebarCollapsed" @transitionend="motion.transitionEnd">
  <aside id="tools-sidebar" class="tool-rail" aria-label="Workspace tools">
    <nav class="activity-destinations" aria-label="Workspace activity">
      <button type="button" aria-label="Projects and navigation" title="Project Explorer" data-dock-trigger="explorer"
        :aria-pressed="ui.explorerOpen" aria-controls="project-explorer" @click="ui.toggleExplorer()"><WorkbenchIcon name="explorer" /></button>
      <button type="button" aria-label="Circuit editing" title="3D circuit editing" :aria-pressed="ui.activeEditor === '3d'" @click="edit"><WorkbenchIcon name="select" /></button>
      <button type="button" aria-label="Component library" title="Component library"
        :aria-pressed="ui.activeRibbonTab === 'library' && !ui.componentToolbarCollapsed" @click="ui.selectRibbonTab('library')"><WorkbenchIcon name="library" /></button>
      <button type="button" aria-label="Lab results" title="Experiment history" @click="ui.openWindow('history')"><WorkbenchIcon name="history" /></button>
      <button type="button" aria-label="Lab execution" title="Simulation controls"
        :aria-pressed="ui.activeRibbonTab === 'run' && !ui.componentToolbarCollapsed" @click="ui.selectRibbonTab('run')"><WorkbenchIcon name="play" /></button>
    </nav>
    <div role="toolbar" aria-label="Instrument tools" aria-orientation="vertical">
      <button v-for="launcher in launchers" :key="launcher.window" class="instrument-launcher" :aria-label="launcher.name" :title="'Open ' + launcher.name" @click="ui.openWindow(launcher.window)"><WorkbenchIcon :name="launcher.icon" /></button>
    </div>
  </aside>
  </div>
    <button ref="collapseToggle" class="toolbar-collapse-toggle rail-collapse-toggle" :aria-label="collapseLabel" :title="collapseLabel" :aria-expanded="!ui.toolsSidebarCollapsed" aria-controls="tools-sidebar" @click="ui.toggleToolsSidebar()"><WorkbenchIcon name="chevron" /></button>
  </div>
</template>
<style scoped>
.tool-rail button.instrument-launcher { height: 34px; padding: 4px; }
</style>
