import { expect, test, type Locator } from '@playwright/test'
import { resolve } from 'node:path'
import { getArtifactDirectory } from '../../scripts/utilities/artifact-paths.mjs'
import { observeNativeScene, sceneReady } from '../helpers/native-scene'

const evidence = getArtifactDirectory('workbench-overlays')
const fill = (locator: Locator) => locator.evaluate(element => getComputedStyle(element).backgroundColor)
const depth = (locator: Locator) => locator.evaluate(element => Number(getComputedStyle(element).zIndex))

test('workspace overlays share light chrome and leave visible windows accessible', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await observeNativeScene(page)
  await page.goto('/')
  await sceneReady(page)
  const status = page.getByRole('contentinfo', { name: 'Workspace status' })
  const themeSurface = await fill(status)

  await page.getByRole('tab', { name: 'File', exact: true }).click()
  await page.getByRole('button', { name: 'Open Project', exact: true }).click()
  const projects = page.getByRole('dialog', { name: 'Project Manager', exact: true })
  await projects.getByRole('textbox', { name: 'New project name' }).fill('Window placement draft')
  await page.getByRole('button', { name: 'Assignment', exact: true }).click()
  const assignments = page.getByRole('dialog', { name: 'Assignments', exact: true })
  const first = (await projects.boundingBox())!
  const second = (await assignments.boundingBox())!
  expect(first.x + first.width <= second.x || second.x + second.width <= first.x
    || first.y + first.height <= second.y || second.y + second.height <= first.y).toBe(true)

  await page.getByRole('button', { name: 'History', exact: true }).click()
  const history = page.getByRole('dialog', { name: 'History & Queue', exact: true })
  for (const dialog of [projects, assignments, history]) await expect.poll(() => fill(dialog)).toBe(themeSurface)
  await expect(projects.getByRole('textbox', { name: 'New project name' })).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.screenshot({ path: resolve(evidence, 'lab-windows-desktop.png'), animations: 'disabled' })

  await page.getByRole('button', { name: 'Open account', exact: true }).click()
  const account = page.getByRole('dialog', { name: 'Account', exact: true })
  await expect.poll(() => fill(account)).toBe(themeSurface)
  await expect(account).toHaveJSProperty('open', true)
  await page.keyboard.press('Control+q')
  await expect(page.getByRole('dialog', { name: 'Search commands', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open account', exact: true })).toBeFocused()

  await page.keyboard.press('Control+q')
  const search = page.getByRole('dialog', { name: 'Search commands', exact: true })
  await expect.poll(() => fill(search)).toBe(themeSurface)
  await expect(search.getByRole('searchbox')).toBeFocused()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  const notifications = page.getByRole('region', { name: 'System message details' })
  await expect.poll(() => fill(notifications)).toBe(themeSurface)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Notifications', exact: true })).toBeFocused()

  await page.setViewportSize({ width: 460, height: 640 })
  const stage = page.getByRole('main', { name: 'Circuit workbench' })
  await expect.poll(async () => {
    const bounds = (await stage.boundingBox())!
    const window = (await history.boundingBox())!
    const railToggle = (await page.getByRole('button', { name: 'Collapse Tools', exact: true }).boundingBox())!
    return window.x >= railToggle.x + railToggle.width && window.y >= bounds.y
      && window.x + window.width <= bounds.x + bounds.width && window.y + window.height <= bounds.y + bounds.height
  }).toBe(true)
  const switcher = page.getByRole('button', { name: 'Open windows', exact: true })
  await switcher.click()
  const windows = page.getByRole('region', { name: 'Open windows' })
  await expect(windows.getByRole('button', { name: 'History & Queue' })).toBeFocused()
  await page.screenshot({ path: resolve(evidence, 'window-switcher-narrow.png'), animations: 'disabled' })
  await windows.getByRole('button', { name: 'Project Manager' }).click()
  await expect(projects.locator('header')).toBeFocused()
  expect(await depth(projects)).toBeGreaterThan(await depth(history))
  await expect(projects.getByRole('textbox', { name: 'New project name' })).toHaveValue('Window placement draft')
  await page.keyboard.press('Escape')
  await expect(projects).toHaveCount(0)
  await expect(switcher).toBeFocused()
})

test('workspace popups use the same surface above the circuit canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 640 })
  await observeNativeScene(page)
  await page.goto('/')
  await sceneReady(page)
  const themeSurface = await fill(page.getByRole('contentinfo', { name: 'Workspace status' }))
  await page.getByRole('tab', { name: 'Component', exact: true }).click()
  await page.locator('[data-group="passive"]').click()
  const library = page.locator('#ribbon-palette')
  await expect.poll(() => fill(library)).toBe(themeSurface)
  await page.keyboard.press('Escape')
  await expect(library).toHaveCount(0)

  await page.locator('[data-group="passive"]').click()
  await library.locator('[data-component-type="GENERIC_RESISTOR"]').click()
  const component = page.getByRole('complementary', { name: 'Component Info' })
  await expect.poll(() => fill(component)).toBe(themeSurface)
  await page.getByRole('button', { name: 'Browse projects', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Project Manager', exact: true }).locator('header')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(component).toBeVisible()
  await component.getByRole('button', { name: 'Close Component Info' }).click()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Wire', exact: true }).first().click()
  const wire = page.getByRole('region', { name: 'Jumper wire options' })
  await expect.poll(() => fill(wire)).toBe(themeSurface)
  await expect(wire.getByRole('button', { name: 'Manual route mode' })).toBeVisible()
  await page.locator('[data-group="notation"]').click()
  await library.locator('[data-component-type="LABEL"]').click()
  await expect(component.getByRole('textbox', { name: 'Label text', exact: true })).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})
