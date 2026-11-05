import {defineConfig} from '@playwright/test'
import base from './playwright.config'

const origin = process.env.CIRNET_E2E_PLATFORM_ORIGIN
if (!origin || !/^http:\/\/127\.0\.0\.1:[1-9]\d*$/.test(origin)) {
  throw new Error('Run the native platform suite with npm run test:e2e:platform.')
}

// Inherit Chromium flags, workers, retries and evidence settings from Remote.
export default defineConfig({
  ...base,
  testMatch: ['**/depth-artifacts.spec.ts', '**/pending-observations-platform.ts'],
  use: {...base.use, baseURL: origin},
})
