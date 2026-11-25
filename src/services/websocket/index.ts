import { createEventClient, eventSocketUrl } from './client'
import type { ServerEvent } from './events'
export { createEventClient, eventSocketUrl } from './client'
export type { EventClient, ConnectionState } from './client'
export function openEventSocket(onMessage: (data: ServerEvent) => void) {
  const client = createEventClient({ url: eventSocketUrl(window.location), onEvent: onMessage })
  client.connect()
  return client
}
