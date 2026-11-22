import { isStationDescriptor } from '../../types/station'
import { parseLab } from '../../contracts/validation'
import type { ServerEvent } from '@cirnet/contracts/dto'

export type { ServerEvent }

export function parseServerEvent(value: unknown): ServerEvent | null {
  try {
    const event = parseLab('ServerEvent', value)
    if (event.type === 'hello' && event.service !== 'cirnet-api') return null
    if (event.type === 'experiment.updated') {
      const experiment = parseLab('ExperimentRecord', event.experiment)
      if (event.aggregate_id !== experiment.experiment_id || event.aggregate_revision !== experiment.revision) return null
    }
    if (event.type === 'station.updated' && !isStationDescriptor(event.station)) return null
    return event
  } catch { return null }
}
