import { isBuiltin, registerHooks } from 'node:module'
import { isAbsolute, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const output = process.env.CIRNET_INTERFACE_TEST_OUTPUT
if (output) {
  const checkout = new URL('../test.mjs', import.meta.url).href
  registerHooks({
    resolve(specifier, context, next) {
      // Keep the checkout's locked packages and singletons for external test bundles.
      if (context.parentURL?.startsWith('file:') && !isBuiltin(specifier) &&
          !specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.includes(':')) {
        const location = relative(output, fileURLToPath(context.parentURL))
        if (!isAbsolute(location) && location !== '..' && !location.startsWith('..' + sep)) {
          return next(specifier, { ...context, parentURL: checkout })
        }
      }
      return next(specifier, context)
    },
  })
}
