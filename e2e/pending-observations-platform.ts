import {test,expect} from '@playwright/test'
import {randomUUID} from 'node:crypto'
import {expectPendingObservationLocking} from './pending-observations-locks'

test('same-origin tabs serialize the browser ledger through native Web Locks', async ({page, context}) => {
  const fixture = '/e2e/pending-observations-platform.html'
  expect((await page.goto(fixture))?.ok()).toBe(true)
  const second = await context.newPage()
  expect((await second.goto(fixture))?.ok()).toBe(true)
  await expectPendingObservationLocking(page,second,randomUUID())
  await second.close()
})
