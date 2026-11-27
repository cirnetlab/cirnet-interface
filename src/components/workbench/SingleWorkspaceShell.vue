<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useLabConnection } from '../../composables/lab/useLabConnection'
import { useLabNavigation } from '../../composables/workbench/useLabNavigation'
import { useProjectWorkspace } from '../../composables/workbench/useProjectWorkspace'
import { useCircuitStore } from '../../stores/documents/circuit'
import { useWorkspaceStore } from '../../stores/workbench/workspace'
import { useUiStore } from '../../stores/workbench/ui'
import { observeElementSize } from '../../composables/workbench/frameTasks'
import AppTitleBar from './chrome/AppTitleBar.vue'
import WorkbenchRibbon from './WorkbenchRibbon.vue'
import { provideExecutionCommands } from '../../composables/lab/useExecutionCommands'
import { useWorkspaceMessages } from '../../composables/workbench/useWorkspaceMessages'
import ToolRail from './chrome/ToolRail.vue'
import CircuitWorkspace3D from './CircuitWorkspace3D.vue'
import SimulationStatusBar from './execution/SimulationStatusBar.vue'
import FloatingWindowManager from '../windows/FloatingWindowManager.vue'
import ProjectExplorer from './chrome/ProjectExplorer.vue'
import WorkspaceViewBar from './chrome/WorkspaceViewBar.vue'
import SchematicWorkspace from './SchematicWorkspace.vue'
const circuit = useCircuitStore(), workspace = useWorkspaceStore()
const ui = useUiStore(), layout = ref<HTMLElement>()
const titleBar = ref<InstanceType<typeof AppTitleBar>>()
const hasOpenedSchematic = ref(false)
watch(() => ui.activeEditor, editor => {
  if (editor === 'schematic') hasOpenedSchematic.value = true
}, { immediate: true })
function dismissWorkspaceOverlays(event: PointerEvent) {
  if (!(event.target instanceof Element)) return
  if (ui.notificationsOpen && !event.target.closest('#system-message-details, [aria-controls="system-message-details"]')) {
    ui.notificationsOpen = false
  }
  if (ui.explorerOpen && !ui.pinnedDocks.explorer && !event.target.closest('#project-explorer, [data-dock-trigger="explorer"]')) {
    ui.explorerVisible = false
  }
  if (ui.propertiesOpen && !ui.pinnedDocks.properties && !event.target.closest('#property-manager, [data-dock-trigger="properties"]')) {
    ui.closeWindow('inspector')
  }
}
let layoutObserver: ReturnType<typeof observeElementSize> | undefined
onMounted(() => {
  if (layout.value) layoutObserver = observeElementSize(layout.value, ui.setWorkbenchSize)
})
onUnmounted(() => layoutObserver?.disconnect())
if (!circuit.current && !circuit.drafts.length) { circuit.createDraft('Untitled circuit'); circuit.past = [] }
watch(() => circuit.activeId, () => workspace.clearSelection())
provideExecutionCommands()
useWorkspaceMessages()
useLabConnection()
useProjectWorkspace()
useLabNavigation()
</script>
<template>
  <div class="single-workspace-shell" :class="{
    'explorer-open': ui.explorerOpen && ui.pinnedDocks.explorer,
    'properties-open': ui.propertiesOpen && ui.pinnedDocks.properties,
    'explorer-overlay': ui.explorerOpen && !ui.pinnedDocks.explorer,
    'properties-overlay': ui.propertiesOpen && !ui.pinnedDocks.properties,
    'schematic-editor-active': ui.activeEditor === 'schematic',
  }" @pointerdown.capture="dismissWorkspaceOverlays">
    <a class="skip-link" href="#workspace">Skip to workspace</a>
    <AppTitleBar ref="titleBar" />
    <div ref="layout" class="workbench-layout" :style="{
      '--drawer-top': ui.drawerInsets.top + 'px',
      '--drawer-left': ui.drawerInsets.left + 'px',
      '--ribbon-popup-space': Math.max(0, ui.workbenchSize.height - ui.drawerInsets.top) + 'px',
      '--cedl-left': ui.dockLayout('explorer').width + 'px',
      '--cedl-right': ui.dockLayout('properties').width + 'px',
    }">
      <WorkbenchRibbon :file-items="titleBar?.fileItems ?? []" @file-command="titleBar?.fileCommand($event)" />
      <div class="workbench-body">
        <ToolRail />
        <main id="workspace" class="workspace-stage" tabindex="-1" aria-label="Circuit workbench">
          <WorkspaceViewBar />
          <CircuitWorkspace3D id="workbench-view-3d" role="tabpanel" aria-labelledby="workbench-view-tab-3d"
            :inert="ui.activeEditor !== '3d'" :class="{ 'editor-inactive': ui.activeEditor !== '3d' }" />
          <SchematicWorkspace v-if="hasOpenedSchematic" />
          <FloatingWindowManager />
          <ProjectExplorer />
        </main>
      </div>
    </div>
    <SimulationStatusBar />
  </div>
</template>
