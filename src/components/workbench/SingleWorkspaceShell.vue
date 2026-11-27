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
const circuit = useCircuitStore(), workspace = useWorkspaceStore()
const ui = useUiStore(), layout = ref<HTMLElement>()
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
    'explorer-open': ui.explorerVisible && !ui.focusRestore,
    'properties-open': !ui.focusRestore && ui.windows.some(window => window.kind === 'inspector' && window.open),
  }">
    <a class="skip-link" href="#workspace">Skip to workspace</a>
    <AppTitleBar />
    <div ref="layout" class="workbench-layout" :style="{
      '--drawer-top': ui.drawerInsets.top + 'px',
      '--drawer-left': ui.drawerInsets.left + 'px',
      '--cedl-left': ui.dockLayout('explorer').width + 'px',
      '--cedl-right': ui.dockLayout('properties').width + 'px',
    }">
      <WorkbenchRibbon />
      <div class="workbench-body">
        <ToolRail />
        <main id="workspace" class="workspace-stage" tabindex="-1" aria-label="Circuit workbench">
          <WorkspaceViewBar />
          <CircuitWorkspace3D id="workbench-view-3d" role="tabpanel" aria-labelledby="workbench-view-tab-3d" />
          <FloatingWindowManager />
          <ProjectExplorer />
        </main>
      </div>
    </div>
    <SimulationStatusBar />
  </div>
</template>
