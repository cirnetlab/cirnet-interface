<script setup lang="ts">
import { computed,nextTick,ref,watch } from 'vue'
import { useUiStore } from '../../stores/workbench/ui'
import { ribbonTabs } from '../../config/workbenchChrome'
import { useDrawerMotion } from '../../composables/workbench/useDrawerMotion'
import ComponentRibbon from './palette/ComponentRibbon.vue'
import RunRibbonPanel from './execution/RunRibbonPanel.vue'
import WorkbenchIcon from './chrome/WorkbenchIcon.vue'
import RibbonCommands from './chrome/RibbonCommands.vue'
import type { FileCommand, FileMenuItem } from './chrome/fileCommands'
defineProps<{ fileItems: readonly FileMenuItem[] }>()
const emit = defineEmits<{ fileCommand: [id: FileCommand] }>()
const ui=useUiStore(),drawer=ref<HTMLElement>(),collapseToggle=ref<HTMLButtonElement>()
const motion=useDrawerMotion({collapsed:()=>ui.componentToolbarCollapsed,drawer:()=>drawer.value})
const collapseLabel=computed(()=>ui.componentToolbarCollapsed?'Expand Ribbon':'Collapse Ribbon')
watch(()=>ui.componentToolbarCollapsed,collapsed=>{
  if(collapsed&&drawer.value?.contains(document.activeElement))void nextTick(()=>collapseToggle.value?.focus())
})
watch(()=>ui.activeRibbonTab,tab=>{
  if(drawer.value?.contains(document.activeElement))void nextTick(()=>document.getElementById('workbench-tab-'+tab)?.focus())
})
</script>
<template>
  <div class="component-panel" data-workspace-text-input :class="{'is-collapsed':ui.componentToolbarCollapsed,'is-reduced-motion':motion.reducedMotion.value}" :data-drawer-occupied="motion.occupied.value" :style="{height:ui.componentOverlayHeight+'px','--ribbon-toggle-offset':ui.componentToolbarCollapsed?'0px':ui.workbenchSize.width/2-22+'px'}">
    <div id="workbench-ribbon" ref="drawer" class="component-drawer" :inert="ui.componentToolbarCollapsed" :aria-hidden="ui.componentToolbarCollapsed" @transitionend="motion.transitionEnd">
      <section v-for="tab in ribbonTabs" v-show="ui.activeRibbonTab === tab.id" :key="tab.id"
        :id="'workbench-panel-' + tab.id" class="ribbon-tab-panel" role="tabpanel"
        :aria-labelledby="'workbench-tab-' + tab.id" :inert="ui.activeRibbonTab !== tab.id">
        <ComponentRibbon v-if="tab.id === 'component'" />
        <RunRibbonPanel v-else-if="tab.id === 'run'" />
        <RibbonCommands v-else-if="ui.activeRibbonTab === tab.id" :tab="tab.id"
          :file-items="fileItems" @file-command="emit('fileCommand', $event)" />
      </section>
    </div>
    <button ref="collapseToggle" class="toolbar-collapse-toggle ribbon-collapse-toggle" :aria-label="collapseLabel" :title="collapseLabel" :aria-expanded="!ui.componentToolbarCollapsed" aria-controls="workbench-ribbon" @click="ui.toggleComponentToolbar()"><WorkbenchIcon name="chevron" /></button>
  </div>
</template>
