import {test,expect} from '@playwright/test'
import {expectEventConnection} from './workbench-ui'
import {expectPendingObservationLocking} from './pending-observations-locks'

test('two same-origin tabs serialize pending observations through real Web Locks without losing or resurrecting identities',async({page,context})=>{
 await page.goto('/');await expectEventConnection(page)
 const second=await context.newPage();await second.goto('/');await expectEventConnection(second)
 const session=await(await context.request.get('/api/auth/session')).json(),principalId=session.principal.principal_id
 expect(typeof principalId).toBe('string')
 await expectPendingObservationLocking(page,second,principalId)
 await second.close()
})
