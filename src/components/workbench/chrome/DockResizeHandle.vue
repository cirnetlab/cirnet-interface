<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { createFrameTask } from '../../../composables/workbench/frameTasks'
import { useUiStore, type WorkspaceDock } from '../../../stores/workbench/ui'

const props = defineProps<{ dock: WorkspaceDock; label: string; controls: string }>()
const ui = useUiStore()
const size = computed(() => ui.dockLayout(props.dock))
const direction = computed(() => props.dock === 'explorer' ? 1 : -1)
let drag: { pointer: number; start: number; width: number; preferred: number | null } | null = null
let pendingWidth = 0
const frame = createFrameTask(() => ui.setDockWidth(props.dock, pendingWidth), {
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: id => cancelAnimationFrame(id),
})

function start(event: PointerEvent) {
  if (event.button !== 0 || drag) return
  const handle = event.currentTarget as HTMLElement
  drag = { pointer: event.pointerId, start: event.clientX, width: size.value.width, preferred: ui.dockWidths[props.dock] }
  handle.setPointerCapture(event.pointerId)
  handle.focus()
  event.preventDefault()
}

function move(event: PointerEvent) {
  if (drag?.pointer !== event.pointerId) return
  pendingWidth = drag.width + (event.clientX - drag.start) * direction.value
  frame.schedule()
}

function finish(event: PointerEvent) {
  if (drag?.pointer !== event.pointerId) return
  frame.cancel()
  if (event.clientX !== drag.start || size.value.width !== drag.width) {
    ui.setDockWidth(props.dock, drag.width + (event.clientX - drag.start) * direction.value)
  }
  drag = null
}

function cancel() {
  if (!drag) return
  frame.cancel()
  ui.dockWidths[props.dock] = drag.preferred
  drag = null
}

function key(event: KeyboardEvent) {
  const step = event.shiftKey ? 48 : 16
  if (event.key === 'Escape' && drag) {
    const handle = event.currentTarget as HTMLElement
    const pointer = drag.pointer
    cancel()
    if (handle.hasPointerCapture(pointer)) handle.releasePointerCapture(pointer)
  } else if (event.key === 'Home') ui.setDockWidth(props.dock, size.value.min)
  else if (event.key === 'End') ui.setDockWidth(props.dock, size.value.max)
  else if (event.key === 'ArrowLeft') ui.setDockWidth(props.dock, size.value.width - direction.value * step)
  else if (event.key === 'ArrowRight') ui.setDockWidth(props.dock, size.value.width + direction.value * step)
  else return
  event.preventDefault()
  event.stopPropagation()
}

onBeforeUnmount(cancel)
</script>

<template>
  <div class="dock-resize-handle" :class="'resize-' + dock" role="separator" tabindex="0"
    aria-orientation="vertical" :aria-label="label" :aria-controls="controls"
    :aria-valuemin="size.min" :aria-valuemax="size.max" :aria-valuenow="size.width"
    :aria-valuetext="size.width + ' pixels'" :title="label + ' · Drag or use arrow keys. Double-click to reset.'"
    @keydown="key" @pointerdown="start" @pointermove="move" @pointerup="finish"
    @pointercancel="cancel" @lostpointercapture="cancel" @dblclick="ui.setDockWidth(dock, null)" />
</template>
