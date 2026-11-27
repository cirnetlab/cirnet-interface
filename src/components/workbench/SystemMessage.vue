<script setup lang="ts">
import { computed,ref,watch } from 'vue'
import { useWorkspaceMessageStore } from '../../stores/workbench/workspaceMessages'
import { useUiStore } from '../../stores/workbench/ui'
import WorkbenchIcon from './chrome/WorkbenchIcon.vue'
const messages=useWorkspaceMessageStore(),ui=useUiStore()
const current=computed(()=>messages.current),details=ref<HTMLElement>(),toggle=ref<HTMLButtonElement>()
let opener: HTMLElement | null = null
const prefix=computed(()=>current.value?.level==='error'?'Error: ':current.value?.level==='warning'?'Notice: ':'')
watch(() => ui.notificationsOpen, open => {
  if (!open) return
  opener = typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null
  details.value?.focus?.()
}, { flush: 'post' })
function readDetails() {
  if (ui.notificationsOpen) closeDetails()
  else ui.notificationsOpen = true
}
function closeDetails() {
  ui.notificationsOpen = false
  ;(opener?.isConnected ? opener : toggle.value)?.focus?.()
  opener = null
}
function dismiss(){if(current.value)messages.dismiss(current.value.id)}
</script>
<template>
  <div class="system-message" data-workspace-text-input>
    <span class="system-message-text" role="status" aria-live="polite" aria-atomic="true" :title="current?.level==='error'?'':prefix+(current?.text??'Ready.')">{{ current?.level==='error'?'':prefix+(current?.text??'Ready.') }}</span>
    <span class="system-message-text" role="alert" aria-live="assertive" aria-atomic="true" :title="current?.level==='error'?prefix+current.text:''">{{ current?.level==='error'?prefix+current.text:'' }}</span>
    <button ref="toggle" aria-label="Read full system message" :aria-expanded="ui.notificationsOpen" aria-controls="system-message-details" title="Read full system message and recent messages" @click="readDetails"><WorkbenchIcon name="inspector" /></button>
    <button v-if="current?.window" :aria-label="'Open '+current.window+' for system message'" title="Open related window" @click="ui.openWindow(current.window)"><WorkbenchIcon name="open" /></button>
    <button v-if="current" aria-label="Dismiss system message" title="Dismiss this message" @click="dismiss"><WorkbenchIcon name="close" /></button>
    <section v-if="ui.notificationsOpen" id="system-message-details" ref="details" class="system-message-details overlay-surface overlay-controls" tabindex="-1" aria-label="System message details" @keydown.esc.stop.prevent="closeDetails">
      <header class="overlay-header"><WorkbenchIcon name="notification" /><strong>System messages</strong><button aria-label="Close system message details" @click="closeDetails"><WorkbenchIcon name="close" /></button></header>
      <div class="overlay-body">
        <p>{{ prefix }}{{ current?.text??'Ready.' }}</p>
        <ol aria-label="Recent system messages"><li v-for="message in [...messages.events].reverse()" :key="message.id">{{ message.level==='error'?'Error: ':message.level==='warning'?'Notice: ':'' }}{{ message.text }}</li></ol>
      </div>
    </section>
  </div>
</template>
<style scoped>
.system-message { position: relative; flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 4px; }
.system-message-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.system-message-text:empty { flex: 0 0 0; }
.system-message > button { flex: 0 0 22px; width: 22px; min-height: 24px; display: grid; place-items: center; padding: 3px; background: transparent; border-color: transparent; }
.system-message > button svg { width: 13px; height: 13px; }
.system-message-details { position: absolute; bottom: calc(100% + var(--cedl-gap)); left: 0; z-index: var(--cedl-layer-status-popup); width: min(600px, calc(100vw - 2 * var(--overlay-space))); max-height: 60dvh; display: flex; flex-direction: column; }
.system-message-details :is(p, li) { overflow-wrap: anywhere; white-space: pre-wrap; }
.system-message-details li { margin-block: var(--cedl-gap); }
.system-message-details ol { padding-inline-start: var(--cedl-icon); }
</style>
