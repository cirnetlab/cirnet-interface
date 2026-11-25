/** Canonical environment names with synchronized aliases for pinned old tools. */
export function environmentValue(name, environment=process.env) {
  const canonical=name.replace(/^NETCIRCUIT_/, 'CIRNET_')
  return environment[canonical]??environment[canonical.replace(/^CIRNET_/, 'NETCIRCUIT_')]
}
export function synchronizeEnvironment(environment=process.env) {
  for(const name of Object.keys(environment)) {
    if(!/^(CIRNET|NETCIRCUIT)_/.test(name))continue
    const canonical=name.replace(/^NETCIRCUIT_/, 'CIRNET_'),value=environmentValue(canonical,environment)
    if(value!==undefined)environment[canonical]=environment[canonical.replace(/^CIRNET_/, 'NETCIRCUIT_')]=value
  }
  return environment
}
synchronizeEnvironment()
