import { expect, test } from '@playwright/test'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { getArtifactDirectory } from '../../scripts/utilities/artifact-paths.mjs'
import { exportedNativeGraph, nativeShellEvidence, observeNativeScene, sceneReady, workspaceCanvas } from '../helpers/native-scene'

const graph = {
  schema_version: '1.0', circuit_id: 'desktop-foundation',
  metadata: { name: 'Digital test bench' },
  modules: [
    { id: 'X', type: 'DIGITAL_SWITCH', position: { x: -2, y: 0, z: 1 }, properties: { state: false } },
    { id: 'L', type: 'LED', position: { x: 2, y: 0, z: 1 } },
    { id: 'BB', type: 'BREADBOARD', position: { x: 0, y: 0, z: 1 } },
    { id: 'SCOPE', type: 'OSCILLOSCOPE', position: { x: 4, y: 0, z: -4 } },
    { id: 'PS', type: 'POWER_SUPPLY', position: { x: -5, y: 0, z: -4 } },
  ],
  connections: [{ source: 'X.OUT', destination: 'L.IN' }],
}

test('desktop Ribbon, pinned docks and live Schematic keep the circuit and 3D scene', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1672, height: 941 })
  await observeNativeScene(page)
  await page.goto('/')
  await sceneReady(page)
  const ribbon = page.getByRole('tablist', { name: 'Workbench ribbon' })
  const tabs = ['File', 'View', 'Component', 'Simulate', 'Library', 'Window', 'Help']
  await expect(ribbon.getByRole('tab')).toHaveText(tabs)
  for (const name of tabs) {
    await ribbon.getByRole('tab', { name, exact: true }).click()
    await expect(ribbon.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true')
    const id = await ribbon.getByRole('tab', { name, exact: true }).getAttribute('aria-controls')
    await expect(page.locator('#' + id)).toBeVisible()
  }
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  await expect(page.getByRole('region', { name: 'System message details' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Notifications', exact: true })).toBeFocused()
  const fullscreen = page.getByRole('button', { name: 'Full screen', exact: true })
  if (await fullscreen.isVisible()) {
    await fullscreen.click()
    await page.getByRole('button', { name: 'Exit full screen', exact: true }).click()
    await expect(fullscreen).toBeVisible()
  }
  await page.getByLabel('Open circuit file', { exact: true }).setInputFiles({
    name: 'desktop-foundation.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(graph)),
  })
  const activity = page.getByRole('navigation', { name: 'Workspace activity' })
  await activity.getByRole('button', { name: 'Component library', exact: true }).click()
  await expect(ribbon.getByRole('tab', { name: 'Library', exact: true })).toHaveAttribute('aria-selected', 'true')
  await ribbon.getByRole('tab', { name: 'Component', exact: true }).click()
  const explorer = page.locator('#project-explorer')
  const properties = page.locator('#property-manager')
  const openProperties = page.getByRole('button', { name: 'Open Inspector', exact: true })
  const openExplorer = page.locator('#toggle-project-explorer')
  const canvas = workspaceCanvas(page)
  const view = page.locator('.workspace-view-bar')
  const width = () => view.evaluate(node => node.getBoundingClientRect().width)
  const capture = (name: string) => page.screenshot({ path: resolve(getArtifactDirectory('desktop-workspace'), name + '.png'), animations: 'disabled' })
  await expect(explorer.getByRole('button', { name: /^L\b/ })).toBeVisible()
  await explorer.getByRole('button', { name: /^L\b/ }).click()
  await openProperties.click()
  await expect(properties.getByLabel('Select component')).toHaveValue('L')
  await page.getByRole('button', { name: 'Close Component Info', exact: true }).click()
  await page.getByRole('button', { name: 'Zoom To View Entire Circuit', exact: true }).click()
  await canvas.evaluate(node => node.setAttribute('data-desktop-test', 'original'))
  const before = await nativeShellEvidence(page)
  const both = await width()
  const aperture = page.locator('.workspace-3d-aperture')
  const opening = (await aperture.boundingBox())!
  const footer = (await page.getByRole('contentinfo', { name: 'Workspace status' }).boundingBox())!
  expect(footer.y - opening.y - opening.height).toBe(6)
  const pinnedImage = await capture('01-both-pinned')
  // The scene must still paint near the bottom edge with the Ribbon expanded.
  const { data, info: pixels } = await sharp(pinnedImage).removeAlpha().extract({
    left: Math.round(opening.x + opening.width / 2 - 100), top: Math.round(footer.y - 30), width: 200, height: 6,
  }).raw().toBuffer({ resolveWithObject: true })
  const colors = new Set<string>()
  for (let i = 0; i < data.length; i += pixels.channels) colors.add(data.subarray(i, i + pixels.channels).toString('hex'))
  expect(colors.size).toBeGreaterThan(1)
  await explorer.getByRole('button', { name: 'Unpin Project Explorer' }).click()
  await expect.poll(width).toBeGreaterThan(both)
  await expect(explorer).toBeVisible()
  await ribbon.getByRole('tab', { name: 'Component', exact: true }).click()
  await expect(explorer).toBeHidden()
  await capture('02-property-manager-only')
  await openExplorer.click()
  await explorer.getByRole('button', { name: 'Pin Project Explorer' }).click()
  await properties.getByRole('button', { name: 'Unpin PropertyManager' }).click()
  await expect(properties).toBeVisible()
  await ribbon.getByRole('tab', { name: 'Component', exact: true }).click()
  await expect(properties).toBeHidden()
  await capture('03-project-explorer-only')
  await openProperties.click()
  await properties.getByRole('button', { name: 'Pin PropertyManager' }).click()
  const left = page.getByRole('separator', { name: 'Resize Project Explorer' })
  const right = page.getByRole('separator', { name: 'Resize PropertyManager' })
  await left.press('ArrowRight')
  await right.press('ArrowLeft')
  await expect.poll(width).toBeLessThan(both)
  await explorer.getByRole('button', { name: 'Close Project Explorer' }).click()
  await properties.getByRole('button', { name: 'Close Inspector' }).click()
  await capture('04-editor-expanded')
  await page.getByRole('button', { name: 'Collapse Ribbon', exact: true }).click()
  await capture('05-ribbon-collapsed')
  await page.getByRole('button', { name: 'Expand Ribbon', exact: true }).click()
  await openExplorer.click()
  await openProperties.click()
  const views = page.getByRole('tablist', { name: 'Workspace views' })
  await views.getByRole('tab', { name: 'Schematic' }).click()
  const schematic = page.getByRole('tabpanel', { name: 'Schematic' })
  await expect(schematic.getByRole('button', { name: 'X.OUT → L.IN' })).toBeVisible()
  await schematic.getByRole('button', { name: 'X.OUT → L.IN' }).click()
  await expect(schematic.getByRole('button', { name: 'X.OUT → L.IN' })).toHaveAttribute('aria-pressed', 'true')
  const selectedConnection = properties.getByRole('region', { name: 'Selected connection' })
  await expect(selectedConnection).toContainText('X.OUT')
  await selectedConnection.getByRole('button', { name: 'Disconnect selected link' }).click()
  await expect(schematic.getByRole('button', { name: 'X.OUT → L.IN' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(schematic.getByRole('button', { name: 'X.OUT → L.IN' })).toBeVisible()
  await schematic.getByRole('button', { name: /^X ·/ }).click()
  await expect(properties.getByLabel('Select component')).toHaveValue('X')
  await page.getByRole('button', { name: 'Zoom In Schematic' }).click()
  await expect(page.getByLabel('Schematic magnification')).toHaveText('110%')
  await expect(canvas).toBeHidden()
  await capture('06-live-schematic')
  await views.getByRole('tab', { name: '3D Simulation' }).click()
  await expect(canvas).toHaveAttribute('data-desktop-test', 'original')
  await expect(properties.getByLabel('Select component')).toHaveValue('X')
  const after = await nativeShellEvidence(page)
  expect(after.scene).toEqual(before.scene)
  expect(after.position).toEqual(before.position)
  expect(after.quaternion).toEqual(before.quaternion)
  expect((await exportedNativeGraph(page)).connections).toEqual(graph.connections)
  await views.getByRole('tab', { name: 'Schematic' }).click()
  await expect(page.getByLabel('Schematic magnification')).toHaveText('110%')
  await views.getByRole('tab', { name: '3D Simulation' }).click()
  await page.getByRole('toolbar', { name: 'Component families' }).getByRole('button', { name: 'Passive', exact: true }).click()
  await page.locator('#ribbon-palette [data-component-type="GENERIC_RESISTOR"]').click()
  const info = page.getByRole('complementary', { name: 'Component Info' })
  await expect(info).toBeVisible()
  await views.getByRole('tab', { name: '3D Simulation' }).press('ArrowRight')
  await expect(schematic).toBeVisible()
  await page.keyboard.press('Escape')
  await views.getByRole('tab', { name: '3D Simulation' }).click()
  await expect(info).toBeVisible()
  await expect(info.getByRole('button', { name: 'Add Resistor', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 720, height: 720 })
  await left.press('End')
  await right.press('End')
  const schematicTab = views.getByRole('tab', { name: 'Schematic', exact: true })
  const [tabBox, rowBox] = await Promise.all([schematicTab.boundingBox(), views.boundingBox()])
  expect(tabBox!.x + tabBox!.width).toBeLessThanOrEqual(rowBox!.x + rowBox!.width)
})
