<script setup lang="ts">
import { useUiStore } from '../../stores/workbench/ui'
import FloatingWindow from './FloatingWindow.vue'
import OscilloscopeWindow from '../instruments/OscilloscopeWindow.vue'
import GeneratorWindow from '../instruments/GeneratorWindow.vue'
import PowerSupplyWindow from '../instruments/PowerSupplyWindow.vue'
import SignalMonitorWindow from '../instruments/SignalMonitorWindow.vue'
import ComponentInfoWindow from '../editor/ComponentInfoWindow.vue'
import InspectorWindow from '../editor/InspectorWindow.vue'
import HexEditorWindow from '../editor/HexEditorWindow.vue'
import ProjectManagerWindow from '../lab/ProjectManagerWindow.vue'
import AssignmentWindow from '../lab/AssignmentWindow.vue'
import ExperimentHistoryWindow from '../lab/ExperimentHistoryWindow.vue'
const ui = useUiStore()
const bodies = { assignments:AssignmentWindow,history:ExperimentHistoryWindow,projects:ProjectManagerWindow,oscilloscope: OscilloscopeWindow, generator: GeneratorWindow, 'power-supply': PowerSupplyWindow, monitor: SignalMonitorWindow, inspector: InspectorWindow, 'hex-editor': HexEditorWindow }
</script>
<template>
  <div class="floating-window-manager" aria-label="Workspace windows">
    <ComponentInfoWindow />
    <template v-for="window in ui.windows" :key="window.kind">
      <FloatingWindow v-if="window.kind === 'inspector' || (window.open && window.kind !== 'component-info')"
        :hidden="window.kind === 'inspector' && !ui.propertiesOpen" :window="window" :docked="window.kind === 'inspector'">
        <component :is="bodies[window.kind]" />
      </FloatingWindow>
    </template>
  </div>
</template>
