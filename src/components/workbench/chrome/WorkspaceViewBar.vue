<script setup lang="ts">
import { nextTick } from 'vue'
import { editorTabs, type WorkspaceEditor } from '../../../config/workbenchChrome'
import { useWorkspaceStore } from '../../../stores/workbench/workspace'
import { useUiStore } from '../../../stores/workbench/ui'
import WorkbenchIcon from './WorkbenchIcon.vue'
import { editingTools, focusWorkbenchCanvas, focusWorkbenchEditor, tabIndexForKey } from './workspaceCommands'

const workspace = useWorkspaceStore()
const ui = useUiStore()
function activate(editor: WorkspaceEditor) {
  ui.selectEditor(editor)
  void nextTick(() => focusWorkbenchEditor(editor))
}
function viewKey(event: KeyboardEvent, editor: WorkspaceEditor) {
  const index = editorTabs.findIndex(tab => tab.id === editor)
  const next = tabIndexForKey(event, index, editorTabs.length)
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusWorkbenchEditor(ui.activeEditor)
  } else if (next !== null) {
    event.preventDefault()
    const nextEditor = editorTabs[next].id
    ui.selectEditor(nextEditor)
    document.getElementById('workbench-view-tab-' + nextEditor)?.focus()
  }
}
</script>

<template>
  <div class="workspace-view-bar">
    <div class="workspace-view-tabs" role="tablist" aria-label="Workspace views">
      <button v-for="editor in editorTabs" :key="editor.id" type="button" :id="'workbench-view-tab-' + editor.id"
        role="tab" :aria-selected="ui.activeEditor === editor.id" :tabindex="ui.activeEditor === editor.id ? 0 : -1"
        :aria-controls="'workbench-view-' + editor.id" @click="activate(editor.id)" @keydown="viewKey($event, editor.id)">
        <WorkbenchIcon :name="editor.icon" /> <span>{{ editor.label }}</span>
      </button>
    </div>
    <div v-if="ui.activeEditor === '3d'" class="workspace-editing-tools" role="group" aria-label="Editing tools">
      <button v-for="tool in editingTools" :key="tool.id" type="button" :aria-label="tool.name"
        :aria-pressed="workspace.tool === tool.id && !workspace.marqueeActive && !workspace.zoomAreaActive"
        :title="tool.description" @click="workspace.setTool(tool.id); focusWorkbenchCanvas()">
        <WorkbenchIcon :name="tool.id" />
      </button>
    </div>
    <div v-else class="workspace-editing-tools schematic-tools" role="group" aria-label="Schematic tools">
      <button type="button" aria-label="Zoom Out Schematic" :disabled="ui.schematicZoom <= 50" @click="ui.setSchematicZoom(ui.schematicZoom - 10)"><WorkbenchIcon name="minus" /></button>
      <output aria-label="Schematic magnification">{{ ui.schematicZoom }}%</output>
      <button type="button" aria-label="Zoom In Schematic" :disabled="ui.schematicZoom >= 200" @click="ui.setSchematicZoom(ui.schematicZoom + 10)"><WorkbenchIcon name="plus" /></button>
      <button type="button" aria-label="Reset Schematic Zoom" title="Reset Schematic Zoom" @click="ui.setSchematicZoom(100)"><WorkbenchIcon name="reset" /></button>
      <span>Read-only graph view</span>
    </div>
  </div>
</template>
