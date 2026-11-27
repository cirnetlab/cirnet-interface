import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import { getArtifactDirectory } from '../../scripts/utilities/artifact-paths.mjs'
import { exportedNativeGraph, nativeShellEvidence, observeNativeScene, sceneReady, workspaceCanvas } from '../helpers/native-scene'

const evidence = getArtifactDirectory('workbench-light')
const graph = {
  schema_version: '1.2',
  circuit_id: 'light-workbench',
  modules: [
    { id: 'BB1', type: 'BREADBOARD', position: { x: 0, y: 0, z: 0 } },
    { id: 'LED1', type: 'LED', position: { x: 3, y: 0, z: 1 } },
    { id: 'R1', type: 'GENERIC_RESISTOR', position: { x: -4, y: 0, z: 2 } },
    { id: 'SCOPE1', type: 'OSCILLOSCOPE', position: { x: -8, y: 0, z: -5 } },
    { id: 'GEN1', type: 'GENERATOR', position: { x: 8, y: 0, z: -5 } },
  ],
  connections: [],
  metadata: { name: 'Breadboard lab circuit' },
}

test('Light Workbench panels and Focus Mode preserve camera, selection and the draft', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await observeNativeScene(page)
  await page.goto('/')
  await sceneReady(page)
  const canvas = workspaceCanvas(page)
  await canvas.evaluate(element => element.setAttribute('data-light-scene', 'original'))
  await page.getByLabel('Open circuit file', { exact: true }).setInputFiles({
    name: 'light-workbench.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(graph)),
  })
  const explorer = page.locator('#project-explorer')
  const properties = page.locator('#property-manager')
  const toggleExplorer = page.getByRole('button', { name: 'Project Explorer', exact: true })
  const toggleFocus = page.getByRole('button', { name: 'Focus Mode', exact: true })
  const open = page.getByRole('button', { name: 'Open Inspector', exact: true })
  const close = page.getByRole('button', { name: 'Close Inspector', exact: true })
  await expect(explorer.getByRole('button', { name: /LED1/ })).toBeVisible()
  await explorer.getByRole('button', { name: /LED1/ }).click()
  await open.click()
  await expect(properties.getByLabel('Select component')).toHaveValue('LED1')
  const x = properties.getByLabel('Component X', { exact: true })
  await x.fill('4')
  await x.press('Tab')
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(x).toHaveValue('3')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(x).toHaveValue('4')
  await page.getByRole('button', { name: 'Zoom To View Entire Circuit', exact: true }).click()
  const before = await nativeShellEvidence(page)
  const projected = await exportedNativeGraph(page)
  const snap = page.getByRole('checkbox', { name: 'Workspace Object Snap', exact: true })
  const wasSnapped = await snap.isChecked()
  const capture = (name: string) => page.screenshot({ path: resolve(evidence, name + '.png'), animations: 'disabled' })
  await capture('3d-both-panels-1920x1080')

  await toggleExplorer.click()
  await expect(explorer).toBeHidden()
  await expect(properties).toBeVisible()
  await capture('3d-explorer-hidden')
  await toggleExplorer.click()
  await close.click()
  await expect(explorer).toBeVisible()
  await expect(properties).toBeHidden()
  await capture('3d-properties-hidden')
  await toggleExplorer.click()
  await capture('3d-expanded')
  await toggleExplorer.click()
  await open.click()
  await toggleFocus.click()
  await expect(explorer).toBeHidden()
  await expect(properties).toBeHidden()
  await expect(page.getByRole('button', { name: 'Expand Ribbon', exact: true })).toBeVisible()
  await capture('3d-focus')
  await toggleFocus.click()
  await expect(explorer).toBeVisible()
  await expect(x).toHaveValue('4')
  await expect(canvas).toHaveAttribute('data-light-scene', 'original')
  const after = await nativeShellEvidence(page)
  expect(after.position).toEqual(before.position)
  expect(after.quaternion).toEqual(before.quaternion)
  expect(await exportedNativeGraph(page)).toEqual(projected)
  await snap.setChecked(!wasSnapped)
  await expect(snap).toBeChecked({ checked: !wasSnapped })
  await snap.setChecked(wasSnapped)
  await page.keyboard.press('Control+q')
  const filter = page.getByRole('searchbox', { name: 'Filter commands' })
  await expect(filter).toBeFocused()
  await filter.press('Tab')
  await expect(page.getByRole('dialog', { name: 'Search commands' }).getByRole('button', { name: /^New\b/ })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(filter).toBeFocused()
  await filter.fill('no such command')
  await expect(page.getByText('No matching commands')).toBeVisible()
  await filter.press('Escape')
  await expect(page.getByRole('button', { name: 'Search commands' })).toBeFocused()
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.getByRole('button', { name: 'Zoom To View Entire Circuit', exact: true }).click()
  await expect(x).toHaveValue('4')
  const contextPanel = page.getByRole('complementary', { name: 'Component Info' })
  await expect(contextPanel).toBeVisible()
  const [infoBox, dockBox] = await Promise.all([contextPanel.boundingBox(), properties.boundingBox()])
  expect(infoBox!.x + infoBox!.width).toBeLessThanOrEqual(dockBox!.x)
  await contextPanel.getByRole('button', { name: 'Close Component Info' }).click()
  await capture('3d-both-panels-1280x720')
  await explorer.getByText('Libraries', { exact: true }).click()
  await explorer.getByRole('button', { name: 'Logic ICs', exact: true }).click()
  await expect(page.getByRole('searchbox', { name: 'Search components', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await explorer.getByText('Results', { exact: true }).click()
  await explorer.getByRole('button', { name: 'Experiment history', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Experiment history and queue', exact: true })).toBeVisible()
})
