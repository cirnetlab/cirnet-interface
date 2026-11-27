<script setup lang="ts">
import type { WireRouteMode } from '../../../types/circuit'
import { JUMPER_COLORS } from '../../../wires/presentation/wireVisual'
import WorkbenchIcon from '../chrome/WorkbenchIcon.vue'

withDefaults(defineProps<{
  color?: string
  routeMode?: WireRouteMode
  canAdd?: boolean
  canRemove?: boolean
  hint?: string
  layer?: number
  canStack?: boolean
  canLowerStack?: boolean
  canRaiseStack?: boolean
}>(), {
  color: '#d8493f',
  routeMode: 'FREE',
  canAdd: false,
  canRemove: false,
  hint: '',
  layer: 0,
  canStack: false,
  canLowerStack: false,
  canRaiseStack: true,
})

const descriptions: Record<WireRouteMode, string> = {
  FREE: 'Manual path: straight or diagonal runs through your anchors.',
  ORTHOGONAL: 'Right angles: X/Z runs; plugged endpoints stay fixed when editing.',
  AUTO: 'Convenient route: board jumpers use automatic right angles.',
}

const emit = defineEmits<{
  color: [value: string]
  mode: [value: WireRouteMode]
  add: []
  remove: []
  routeKey: [event: KeyboardEvent]
  stack: [action: 'up' | 'down' | 'top']
}>()

function routeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' || (['Backspace', 'Delete'].includes(event.key) && (event.target as HTMLElement)?.tagName !== 'SELECT' && (event.target as HTMLElement)?.tagName !== 'INPUT' && (event.target as HTMLElement)?.tagName !== 'TEXTAREA')) {
    emit('routeKey', event)
  }
}
</script>

<template>
  <section class="wire-options contextual-panel overlay-surface overlay-controls" aria-label="Jumper wire options" data-workspace-text-input @pointerdown.stop @keydown.stop="routeKey">
    <header class="overlay-header"><WorkbenchIcon name="wire" /><strong>Wire options</strong></header>
    <div class="overlay-body">
    <div class="wire-palette" role="group" aria-label="Wire colors">
      <button
        v-for="swatch in JUMPER_COLORS"
        :key="swatch.name"
        type="button"
        :aria-label="swatch.name + ' wire'"
        :title="swatch.name"
        :aria-pressed="color === swatch.value"
        :style="{ '--swatch': swatch.value }"
        @click="emit('color', swatch.value)"
      />
    </div>

    <div class="wire-instructions">
      <p id="wire-route-description" class="wire-instruction-line">{{ descriptions[routeMode] || descriptions.FREE }}</p>
      <p class="wire-instruction-line">Parallel: lane order · Crossing: over/under</p>
      <p class="wire-instruction-line">{{ hint || 'Drag a user bend or segment · Double-click: add an anchor · Alt: no snap' }}</p>
    </div>

    <hr class="wire-divider" />

    <div class="wire-tool-section">
      <div class="wire-tool-heading">
        <strong>Tool</strong>
        <span class="wire-priority" role="status">Priority {{ layer }}</span>
      </div>

      <div class="wire-route-buttons" role="group" aria-label="Wire route mode">
        <button
          type="button"
          class="wire-mode-btn"
          :class="{ active: routeMode === 'FREE' }"
          :aria-pressed="routeMode === 'FREE'"
          aria-label="Manual route mode"
          title="Manual: straight or diagonal runs through your anchors"
          @click="emit('mode', 'FREE')"
        >
          Manual
        </button>
        <button
          type="button"
          class="wire-mode-btn"
          :class="{ active: routeMode === 'ORTHOGONAL' }"
          :aria-pressed="routeMode === 'ORTHOGONAL'"
          aria-label="Orthogonal 90° route mode"
          title="Orthogonal 90°: right angles along X/Z axes"
          @click="emit('mode', 'ORTHOGONAL')"
        >
          Orthogonal 90°
        </button>
      </div>

      <div class="wire-action-buttons" role="group" aria-label="Wire edit tools">
        <button
          type="button"
          class="wire-icon-btn"
          aria-label="Add bend to selected segment"
          title="Add bend"
          :disabled="!canAdd"
          @click="emit('add')"
        >
          <WorkbenchIcon name="bend-add" />
        </button>
        <button
          type="button"
          class="wire-icon-btn"
          aria-label="Remove selected bend"
          title="Remove bend"
          :disabled="!canRemove"
          @click="emit('remove')"
        >
          <WorkbenchIcon name="bend-remove" />
        </button>
        <button
          type="button"
          class="wire-icon-btn"
          aria-label="Lower wire priority"
          title="Down"
          :disabled="!canStack || !canLowerStack"
          @click="emit('stack', 'down')"
        >
          <WorkbenchIcon name="down" />
        </button>
        <button
          type="button"
          class="wire-icon-btn"
          aria-label="Raise wire priority"
          title="Up"
          :disabled="!canStack || !canRaiseStack"
          @click="emit('stack', 'up')"
        >
          <WorkbenchIcon name="up" />
        </button>
        <button
          type="button"
          class="wire-icon-btn"
          aria-label="Move wire above overlapping wires"
          title="Top"
          :disabled="!canStack || !canRaiseStack"
          @click="emit('stack', 'top')"
        >
          <WorkbenchIcon name="top" />
        </button>
      </div>

    </div>
    </div>
  </section>
</template>

<style scoped>
.wire-options { z-index: var(--cedl-layer-context); display: flex; flex-direction: column; pointer-events: auto; font-size: 11px; }
.wire-palette { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); justify-items: center; gap: var(--cedl-gap); }
.wire-palette button { aspect-ratio: 1; width: min(100%, var(--cedl-control)); min-height: 0; padding: 0; border-radius: 50%; background: var(--swatch); }
.wire-palette button:hover:not(:disabled), .wire-palette button[aria-pressed=true] { background: var(--swatch); border-color: var(--cedl-focus); }
.wire-palette button[aria-pressed=true] { outline: 2px solid var(--cedl-focus); outline-offset: 2px; }
.wire-instructions { display: grid; gap: var(--cedl-gap); margin-block: var(--overlay-space); }
.wire-instruction-line { margin: 0; color: var(--cedl-muted); }
.wire-divider { border: 0; border-top: 1px solid var(--cedl-line); margin: 0 0 var(--cedl-gap); }
.wire-tool-heading { display: flex; justify-content: space-between; gap: var(--cedl-gap); margin-bottom: var(--cedl-gap); }
.wire-tool-heading strong { font-size: 12px; }
.wire-priority { color: var(--cedl-muted); }
.wire-route-buttons, .wire-action-buttons { display: flex; flex-wrap: wrap; gap: var(--cedl-gap); }
.wire-action-buttons { margin-top: var(--cedl-gap); }
.wire-mode-btn { flex: 1; }
.wire-icon-btn { display: grid; place-items: center; width: var(--cedl-control); padding: 0; }
.wire-icon-btn :deep(.workbench-icon) { width: var(--cedl-icon); height: var(--cedl-icon); }
</style>
