<script setup lang="ts">
import { useWorkspaceStore } from '../../../stores/workbench/workspace'
import WorkbenchIcon from './WorkbenchIcon.vue'
import { editingTools, focusWorkbenchCanvas } from './workspaceCommands'

const workspace = useWorkspaceStore()
</script>

<template>
  <div class="workspace-view-bar">
    <div class="workspace-view-tabs" role="tablist" aria-label="Workspace views">
      <button type="button" id="workbench-view-tab-3d" role="tab" aria-selected="true"
        aria-controls="workbench-view-3d" @click="focusWorkbenchCanvas" @keydown.down.prevent="focusWorkbenchCanvas">
        <WorkbenchIcon name="view-3d" /> <span>3D Workbench</span>
      </button>
    </div>
    <div class="workspace-editing-tools" role="group" aria-label="Editing tools">
      <button v-for="tool in editingTools" :key="tool.id" type="button" :aria-label="tool.name"
        :aria-pressed="workspace.tool === tool.id && !workspace.marqueeActive && !workspace.zoomAreaActive"
        :title="tool.description" @click="workspace.setTool(tool.id); focusWorkbenchCanvas()">
        <WorkbenchIcon :name="tool.id" />
      </button>
    </div>
  </div>
</template>
