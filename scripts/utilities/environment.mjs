/** Canonical environment names with synchronized aliases for pinned old tools. */
export function environmentValue(name, environment=process.env) {
  const canonical=name.replace(/^NETCIRCUIT_/, 'CIRNET_')
  return environment[canonical]??environment[canonical.replace(/^CIRNET_/, 'NETCIRCUIT_')]
}
export function synchronizeEnvironment(environment=process.env) {
  for(const name of Object.keys(environment)) {
    if(!/^(CIRNET|NETCIRCUIT)_/.test(name))continue
    const canonical=name.replace(/^NETCIRCUIT_/, 'CIRNET_')
    if(canonical==='CIRNET_LOCAL_STORAGE_ROOT'||canonical==='CIRNET_ARTIFACTS_TASK_KEY')continue
    const legacy=canonical.replace(/^CIRNET_/, 'NETCIRCUIT_')
    if(environment.CIRNET_LOCAL_STORAGE_ROOT!==undefined&&/^CIRNET_ARTIFACTS_(?:DIR|SESSION|CONTEXT)$/.test(canonical)
      &&environment[canonical]!==undefined&&environment[legacy]!==undefined&&environment[canonical]!==environment[legacy]){
      throw Error('Conflicting artifact configuration for '+canonical+'.')
    }
    const value=environmentValue(canonical,environment)
    if(value!==undefined)environment[canonical]=environment[canonical.replace(/^CIRNET_/, 'NETCIRCUIT_')]=value
  }
  return environment
}
synchronizeEnvironment()
