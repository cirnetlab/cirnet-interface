<script setup lang="ts">
import { nextTick,ref,watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import type { UserView } from '@cirnet/contracts/dto'
import WorkbenchIcon from '../workbench/chrome/WorkbenchIcon.vue'
const auth=useAuthStore(),open=ref(false),dialog=ref<HTMLDialogElement>(),opener=ref<HTMLButtonElement>()
const username=ref(''),password=ref(''),confirmed=ref(false)
const newUsername=ref(''),newPassword=ref(''),displayName=ref(''),newRole=ref<UserView['role']>('STUDENT')
function close() {
  dialog.value?.close?.()
  open.value = false
  password.value = ''
  newPassword.value = ''
  confirmed.value = false
  opener.value?.focus?.()
}
watch(open, async value => {
  if (!value) return
  await nextTick()
  const panel = dialog.value
  panel?.showModal?.()
  const initial = panel?.querySelector?.<HTMLElement>('[autocomplete="username"]') ?? panel?.querySelector?.<HTMLElement>('[aria-label="Close account"]')
  initial?.focus?.()
  await auth.bootstrap()
  if (open.value && dialog.value === panel && auth.canAdmin) void auth.loadUsers()
})
watch(()=>auth.connectionEpoch,()=>{password.value='';newPassword.value='';confirmed.value=false})
async function login(){const secret=password.value;password.value='';await auth.login(username.value,secret)}
async function createUser(){
  const secret=newPassword.value;newPassword.value=''
  if(await auth.createUser({username:newUsername.value,password:secret,display_name:displayName.value,role:newRole.value})) {
    newUsername.value='';displayName.value='';newRole.value='STUDENT'
  }
}
function changeRole(user:UserView,event:Event) {
  const role=(event.target as HTMLSelectElement).value
  if(role==='STUDENT'||role==='INSTRUCTOR'||role==='ADMIN') void auth.updateUser(user.principal_id,{role})
}
</script>
<template>
  <button ref="opener" class="account-toggle" aria-label="Open account" :aria-expanded="open" @click="open=true">{{ auth.principal?.display_name || (auth.principal?.kind==='GUEST'?'Guest':'Account') }}</button>
  <dialog v-if="open" ref="dialog" class="account-dialog overlay-modal overlay-surface overlay-controls" role="dialog" aria-modal="true"
    aria-labelledby="account-heading" data-workspace-text-input @pointerdown.self="close" @cancel.prevent="close">
    <header class="overlay-header">
      <WorkbenchIcon name="account" /><h1 id="account-heading">Account</h1>
      <button type="button" aria-label="Close account" @click="close"><WorkbenchIcon name="close" /></button>
    </header>
    <div class="overlay-body">
      <p class="account-note" v-if="auth.authenticated">{{ auth.principal?.display_name }} · {{ auth.principal?.role }}</p>
      <p class="account-note" v-else>{{ auth.principal?.kind==='GUEST'?'Guest session':'Sign in to access your laboratory account' }}</p>
      <p v-if="auth.error" role="alert" class="account-error">{{ auth.error }}</p>
      <p v-if="auth.loading" role="status">Loading session…</p>
      <button v-if="!auth.session&&!auth.loading" @click="auth.bootstrap(true)">Retry session</button>
      <form v-if="!auth.authenticated" class="account-form" aria-label="Sign in" @submit.prevent="login">
        <label>Username<input v-model="username" aria-label="Username" autocomplete="username" required minlength="3" maxlength="64" /></label>
        <label>Password<input v-model="password" aria-label="Password" type="password" autocomplete="current-password" required minlength="12" maxlength="1024" /></label>
        <button type="submit" :disabled="auth.pending||auth.loading||!auth.session">Sign in</button>
        <p class="account-note" v-if="auth.session?.guest_enabled">Guest work stays separate until you sign in and explicitly confirm its transfer.</p>
      </form>
      <template v-else>
        <button :disabled="auth.pending" @click="auth.logout()">Sign out</button>
        <section v-if="auth.session?.claim_available" class="account-claim" aria-label="Guest data transfer"><h2>Keep your guest work</h2><p>Transfer data owned by this guest session to your account.</p><label class="account-check"><input :checked="confirmed" type="checkbox" aria-label="Confirm guest data transfer" @change="confirmed=($event.target as HTMLInputElement).checked" />I confirm this guest work belongs to me.</label><button aria-label="Claim guest data" :disabled="!confirmed||auth.pending" @click="auth.claimGuest(confirmed)">Transfer guest data</button></section>
      </template>
      <section v-if="auth.canAdmin" aria-label="User administration" class="account-administration">
        <div class="account-heading"><h2>Users</h2><button :disabled="auth.usersLoading" @click="auth.loadUsers()">Refresh users</button></div>
        <div class="account-user-list"><table><thead><tr><th>Account</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody><tr v-for="user in auth.users" :key="user.principal_id"><td>{{ user.display_name }}<small>{{ user.username }}</small></td><td><select :aria-label="`Role for ${user.username}`" :value="user.role" :disabled="auth.usersLoading" @change="changeRole(user,$event)"><option>STUDENT</option><option>INSTRUCTOR</option><option>ADMIN</option></select></td><td>{{ user.active?'Active':'Disabled' }}</td><td><button :disabled="auth.usersLoading" :aria-label="`${user.active?'Disable':'Enable'} ${user.username}`" @click="auth.updateUser(user.principal_id,{active:!user.active})">{{ user.active?'Disable':'Enable' }}</button></td></tr></tbody></table></div>
        <form class="account-form account-create" aria-label="Create user" @submit.prevent="createUser"><h3>Create user</h3><label>Username<input v-model="newUsername" aria-label="New username" autocomplete="off" required minlength="3" maxlength="64" /></label><label>Display name<input v-model="displayName" aria-label="Display name" autocomplete="off" required maxlength="128" /></label><label>Initial password<input v-model="newPassword" aria-label="Initial password" type="password" autocomplete="new-password" required minlength="12" maxlength="1024" /></label><label>Role<select v-model="newRole" aria-label="New user role"><option>STUDENT</option><option>INSTRUCTOR</option><option>ADMIN</option></select></label><button type="submit" :disabled="auth.usersLoading||auth.pending">Create user</button></form>
      </section>
    </div>
  </dialog>
</template>
<style scoped>
.account-toggle { max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 5px 10px; flex-shrink: 0; }
.account-dialog { --overlay-width: 680px; }
.account-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--cedl-gap); }
.account-heading h2 { margin: 0; }
.account-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--overlay-space); margin-block: var(--overlay-space); }
.account-form > button { justify-self: start; }
.account-form h3, .account-form .account-note { grid-column: 1 / -1; margin: 0; }
.account-note { color: var(--cedl-muted); }
.account-claim, .account-administration { margin-top: var(--overlay-space); border-top: 1px solid var(--cedl-line); padding-top: var(--overlay-space); }
.account-check { display: flex; flex-direction: row; align-items: center; margin-block: var(--cedl-gap); }
.account-user-list { overflow-x: auto; margin-block: var(--cedl-gap); }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: var(--cedl-gap); border-bottom: 1px solid var(--cedl-line); }
td small { display: block; color: var(--cedl-muted); }
@media (max-width: 560px) {
  .account-form { grid-template-columns: 1fr; }
  .account-toggle { max-width: 80px; }
}
</style>
