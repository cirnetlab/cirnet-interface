<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useUiStore } from '../../stores/workbench/ui'
import { windowDefinitions, type WorkspaceWindow } from '../../types/windows'
import WorkbenchIcon from '../workbench/chrome/WorkbenchIcon.vue'
import DockResizeHandle from '../workbench/chrome/DockResizeHandle.vue'
const props = defineProps<{ window: WorkspaceWindow; docked?: boolean }>()
const ui = useUiStore()
const root = ref<HTMLElement>()
const header = ref<HTMLElement>()
let opener: HTMLElement | null = null
let drag: { x: number; y: number; left: number; top: number; pointer: number } | null = null
function start(event: PointerEvent) {
  if (props.docked || event.button !== 0 || (event.target as HTMLElement).closest('button')) return
  event.preventDefault()
  header.value?.focus()
  header.value?.setPointerCapture(event.pointerId)
  drag = { x: event.clientX, y: event.clientY, left: props.window.x, top: props.window.y, pointer: event.pointerId }
}
function move(event: PointerEvent) { if (drag && drag.pointer === event.pointerId) ui.moveWindow(props.window.kind, drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y) }
function end() { drag = null }
function key(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); ui.closeWindow(props.window.kind) }
  if (props.docked || event.target !== header.value) return
  const offset = event.shiftKey ? 30 : 10
  const directions: Record<string, [number, number]> = { ArrowLeft: [-offset, 0], ArrowRight: [offset, 0], ArrowUp: [0, -offset], ArrowDown: [0, offset] }
  const delta = directions[event.key]
  if (delta) { event.preventDefault(); ui.moveWindow(props.window.kind, props.window.x + delta[0], props.window.y + delta[1]) }
}
function activate() {
  const focused = document.activeElement
  if (focused instanceof HTMLElement && !root.value?.contains(focused)) opener = focused
  void nextTick(() => header.value?.focus())
}
onMounted(activate)
watch(() => props.window.activation, activate)
function restoreOpener() {
  if (root.value?.contains(document.activeElement) && opener?.isConnected) {
    // A toolbar can be collapsed while its instrument window is still open.
    const target = !opener.closest('[inert]') && opener.getClientRects().length ? opener : opener.closest('.component-panel, .tools-panel')?.querySelector<HTMLButtonElement>('.toolbar-collapse-toggle')
    target?.focus()
  }
}
watch(() => props.window.open, open => {
  if (!open) restoreOpener()
}, { flush: 'sync' })
onBeforeUnmount(() => {
  end()
  restoreOpener()
})
</script>
<template>
  <section ref="root" class="floating-window" :class="{ 'property-manager': docked }" :id="docked ? 'property-manager' : undefined" role="dialog" :aria-labelledby="'window-title-' + window.kind" :style="docked ? { zIndex: window.z } : { left: window.x + 'px', top: window.y + 'px', width: window.width + 'px', height: window.height + 'px', zIndex: window.z }" @pointerdown="ui.focusWindow(window.kind)" @focusin="ui.focusWindow(window.kind)" @keydown="key">
    <header ref="header" class="floating-header" tabindex="0"
      :aria-label="docked ? 'PropertyManager. Escape to close.' : windowDefinitions[window.kind].title + ' window. Drag or use arrow keys to move; Escape to close.'"
      @pointerdown="start" @pointermove="move" @pointerup="end" @pointercancel="end" @lostpointercapture="end">
      <WorkbenchIcon v-if="docked" name="inspector" />
      <span v-else class="window-grip" aria-hidden="true">⠿</span>
      <strong :id="'window-title-' + window.kind">{{ docked ? 'PropertyManager' : windowDefinitions[window.kind].title }}</strong>
      <button v-if="docked" type="button" :aria-label="ui.pinnedDocks.properties ? 'Unpin PropertyManager' : 'Pin PropertyManager'"
        :title="ui.pinnedDocks.properties ? 'Unpin PropertyManager' : 'Pin PropertyManager'"
        :aria-pressed="ui.pinnedDocks.properties" @click="ui.toggleDockPin('properties')">
        <WorkbenchIcon :name="ui.pinnedDocks.properties ? 'pin' : 'unpin'" />
      </button>
      <button :aria-label="'Close ' + windowDefinitions[window.kind].title" @click="ui.closeWindow(window.kind)"><WorkbenchIcon name="close" /></button>
    </header>
    <div class="floating-body"><slot /></div>
    <DockResizeHandle v-if="docked" dock="properties" label="Resize PropertyManager" controls="property-manager" />
  </section>
</template>
