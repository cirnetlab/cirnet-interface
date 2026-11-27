<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useUiStore } from '../../stores/workbench/ui'
import { windowDefinitions, type WindowKind, type WorkspaceWindow } from '../../types/windows'
import WorkbenchIcon from '../workbench/chrome/WorkbenchIcon.vue'

const ui = useUiStore()
const open = ref(false)
const trigger = ref<HTMLButtonElement>()
const list = ref<HTMLElement>()
const active = computed(() => ui.floatingWindows.reduce<WorkspaceWindow | undefined>((top, window) =>
  !top || window.z > top.z ? window : top, undefined))

function close(restoreFocus = false) {
  open.value = false
  if (restoreFocus) trigger.value?.focus()
}
async function toggle() {
  if (open.value) {
    close()
    return
  }
  ui.notificationsOpen = false
  open.value = true
  await nextTick()
  list.value?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus()
}
function activate(kind: WindowKind) {
  close(true)
  ui.openWindow(kind)
}
function leave(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) close()
}
watch(() => ui.notificationsOpen, visible => { if (visible) close() })
watch(() => ui.floatingWindows.length, count => { if (!count) close() })
</script>

<template>
  <div v-if="ui.floatingWindows.length" class="window-switcher" data-workspace-text-input
    @focusout="leave" @keydown.esc.stop.prevent="close(true)">
    <button ref="trigger" type="button" class="window-switcher-trigger" aria-label="Open windows" title="Switch between open windows"
      :aria-expanded="open" :aria-controls="open ? 'open-windows' : undefined" @click="toggle">
      <WorkbenchIcon name="windows" /><span>{{ ui.floatingWindows.length }}</span>
    </button>
    <section v-if="open" id="open-windows" ref="list" class="window-switcher-list overlay-surface overlay-controls" aria-label="Open windows">
      <header class="overlay-header"><strong>Open windows</strong></header>
      <ul>
        <li v-for="window in ui.floatingWindows" :key="window.kind">
          <button type="button" :aria-current="active?.kind === window.kind ? 'true' : undefined" @click="activate(window.kind)">
            {{ windowDefinitions[window.kind].title }}
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>