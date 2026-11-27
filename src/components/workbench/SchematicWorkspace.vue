<script setup lang="ts">
import { computed } from 'vue'
import { getDefinition } from '../../data/editorCatalog'
import { useCircuitStore } from '../../stores/documents/circuit'
import { useUiStore } from '../../stores/workbench/ui'
import { useWorkspaceStore } from '../../stores/workbench/workspace'
import type { WireIdentity } from '../../types/circuit'
import WorkbenchIcon from './chrome/WorkbenchIcon.vue'
import { layoutSchematic, schematicNodeHeight, schematicNodeWidth } from './schematicLayout'

const circuit = useCircuitStore()
const ui = useUiStore()
const workspace = useWorkspaceStore()
const layout = computed(() => layoutSchematic(circuit.graph))
const active = computed(() => ui.activeEditor === 'schematic')
const nameFor = (type: string) => getDefinition(type)?.name ?? type
const linkKey = (link: WireIdentity) => JSON.stringify([link.source, link.destination])
const selectedLinks = computed(() => new Set(workspace.selection.wires.map(linkKey)))
const selectedModules = computed(() => new Set(workspace.selection.moduleIds))
const selected = (link: WireIdentity) => selectedLinks.value.has(linkKey(link))
const linkName = (link: WireIdentity) => link.source + ' → ' + link.destination

function glyph(type: string) {
  if (type.startsWith('BREADBOARD')) return 'breadboard'
  if (type.includes('RESISTOR')) return 'resistor'
  if (type.includes('CAPACITOR')) return 'capacitor'
  if (type.includes('DIODE') || type.endsWith('LED')) return 'led'
  if (type.includes('SWITCH')) return 'switch'
  if (type.includes('SUPPLY')) return 'power-supply'
  if (type === 'OSCILLOSCOPE') return 'scope'
  return 'component'
}
</script>

<template>
  <section id="workbench-view-schematic" class="schematic-workspace" :class="{ 'editor-inactive': !active }"
    role="tabpanel" aria-labelledby="workbench-view-tab-schematic" tabindex="0"
    :inert="!active" data-workspace-text-input>
    <p v-if="!layout.nodes.length" class="schematic-empty">Place or import components in 3D Simulation to see their schematic connections.</p>
    <template v-else>
      <header class="schematic-heading">
        <strong>{{ circuit.current?.name }}</strong>
        <span>{{ layout.nodes.length }} components · {{ layout.links.length }} declared links</span>
      </header>
      <div class="schematic-sheet" :style="{ width: layout.width + 'px', height: layout.height + 'px', zoom: ui.schematicZoom / 100 }">
        <svg class="schematic-links" :viewBox="'0 0 ' + layout.width + ' ' + layout.height" aria-hidden="true">
          <g v-for="({ link, path }, index) in layout.links" :key="index">
            <path v-if="path" :d="path" class="schematic-link" :class="{ selected: selected(link) }"
              @click="workspace.selectWire(link.source, link.destination)">
              <title>{{ linkName(link) }}</title>
            </path>
          </g>
        </svg>
        <button v-for="{ module, x, y } in layout.nodes" :key="module.id" type="button" class="schematic-node"
          :style="{ left: x + 'px', top: y + 'px', width: schematicNodeWidth + 'px', height: schematicNodeHeight + 'px' }"
          :aria-label="module.id + ' · ' + nameFor(module.type)" :aria-pressed="selectedModules.has(module.id)"
          @click="workspace.selectModule(module.id)">
          <WorkbenchIcon :name="glyph(module.type)" />
          <span><strong>{{ module.id }}</strong><small>{{ nameFor(module.type) }}</small></span>
        </button>
      </div>
      <details v-if="layout.links.length" open class="schematic-connection-list">
        <summary>Declared connections</summary>
        <ul>
          <li v-for="({ link, path }, index) in layout.links" :key="index">
            <button type="button" :aria-pressed="selected(link)" @click="workspace.selectWire(link.source, link.destination)">
              {{ linkName(link) }}
            </button>
            <small v-if="!path">Endpoint outside component view</small>
          </li>
        </ul>
      </details>
      <p class="schematic-note">Breadboard topology and physical pin mappings are inspected in 3D Simulation.</p>
    </template>
  </section>
</template>
