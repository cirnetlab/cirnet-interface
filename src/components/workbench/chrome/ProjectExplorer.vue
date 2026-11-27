<script setup lang="ts">
import { nextTick } from 'vue'
import { useCircuitStore } from '../../../stores/documents/circuit'
import { useWorkspaceStore } from '../../../stores/workbench/workspace'
import { useUiStore } from '../../../stores/workbench/ui'
import { getDefinition } from '../../../data/editorCatalog'
import { ribbonGroups } from '../../../data/ribbon'
import WorkbenchIcon from './WorkbenchIcon.vue'
import DockResizeHandle from './DockResizeHandle.vue'

const circuit = useCircuitStore()
const workspace = useWorkspaceStore()
const ui = useUiStore()

function closeExplorer() {
  ui.explorerVisible = false
  void nextTick(() => document.getElementById('toggle-project-explorer')?.focus())
}
function escapeExplorer(event: KeyboardEvent) {
  if (ui.pinnedDocks.explorer || ui.activeRibbonGroup) return
  event.preventDefault()
  event.stopPropagation()
  closeExplorer()
}
</script>

<template>
  <aside v-show="ui.explorerOpen" id="project-explorer"
    class="project-explorer" aria-labelledby="project-explorer-title" data-workspace-text-input
    @keydown.esc="escapeExplorer">
    <header class="dock-heading"><WorkbenchIcon name="explorer" />
      <h2 id="project-explorer-title">Project Explorer</h2>
      <button type="button" :aria-label="ui.pinnedDocks.explorer ? 'Unpin Project Explorer' : 'Pin Project Explorer'"
        :title="ui.pinnedDocks.explorer ? 'Unpin Project Explorer' : 'Pin Project Explorer'"
        :aria-pressed="ui.pinnedDocks.explorer" @click="ui.toggleDockPin('explorer')">
        <WorkbenchIcon :name="ui.pinnedDocks.explorer ? 'pin' : 'unpin'" />
      </button>
      <button type="button" aria-label="Close Project Explorer" title="Close Project Explorer"
        @click="closeExplorer"><WorkbenchIcon name="close" /></button>
    </header>
    <div class="explorer-content">
      <details open>
        <summary>{{ circuit.current?.name || 'No circuit' }}</summary>
        <details open>
          <summary>Components <small>{{ circuit.graph?.modules.length ?? 0 }}</small></summary>
          <ul v-if="circuit.graph?.modules.length" class="explorer-components">
            <li v-for="module in circuit.graph.modules" :key="module.id">
              <button type="button" :aria-pressed="workspace.selectedModuleId === module.id"
                :title="module.id + ' · ' + (getDefinition(module.type)?.name ?? module.type)"
                @click="workspace.selectModule(module.id)">
                <WorkbenchIcon name="component" />
                <span>{{ module.id }} <small>{{ getDefinition(module.type)?.name ?? module.type }}</small></span>
              </button>
            </li>
          </ul>
          <p v-else class="explorer-empty">Add a component from the Ribbon.</p>
        </details>
        <details>
          <summary>Views</summary>
          <ul class="explorer-components">
            <li><button type="button" :aria-pressed="ui.activeEditor === '3d'" @click="ui.selectEditor('3d')"><WorkbenchIcon name="view-3d" /> 3D Simulation</button></li>
            <li><button type="button" :aria-pressed="ui.activeEditor === 'schematic'" @click="ui.selectEditor('schematic')"><WorkbenchIcon name="schematic" /> Schematic</button></li>
          </ul>
        </details>
        <details v-if="circuit.drafts.length > 1">
          <summary>Session drafts</summary>
          <ul class="explorer-components">
            <li v-for="draft in circuit.drafts" :key="draft.id">
              <button type="button" :aria-pressed="circuit.activeId === draft.id" @click="circuit.openDraft(draft.id)">{{ draft.name }}</button>
            </li>
          </ul>
        </details>
        <details>
          <summary>Libraries</summary>
          <ul class="explorer-components">
            <li v-for="group in ribbonGroups" :key="group.id">
              <button type="button" @click="ui.openLibrary(group.id)">{{ group.label }}</button>
            </li>
          </ul>
        </details>
        <details>
          <summary>Results</summary>
          <ul class="explorer-components">
            <li><button type="button" @click="ui.openWindow('history')">Experiment history</button></li>
          </ul>
        </details>
      </details>
      <button type="button" class="explorer-projects" @click="ui.openWindow('projects')">
        <WorkbenchIcon name="open" /> Browse projects
      </button>
    </div>
    <DockResizeHandle dock="explorer" label="Resize Project Explorer" controls="project-explorer" />
  </aside>
</template>
