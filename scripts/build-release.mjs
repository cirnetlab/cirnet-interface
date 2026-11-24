/** Build the Interface source/static pair from exact source and locked SDK bytes. */
import {execFileSync, spawnSync} from 'node:child_process'
import {createHash, randomBytes} from 'node:crypto'
import {
  closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync,
  realpathSync, unlinkSync, writeFileSync,
} from 'node:fs'
import {basename, dirname, isAbsolute, relative, resolve, sep} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseArgs} from 'node:util'
import {gzipSync} from 'node:zlib'
import {getArtifactDirectory, validateArtifactDirectory} from './artifact-paths.mjs'

const product = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const excluded = new Set([
  '.git', '.superpowers', 'node_modules', '.artifacts', '.runtime', '.build',
  '.test-build', '.benchmark-build', 'dist',
])
const metadataName = 'interface-artifact.json'
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const sorted = files => [...files].sort(([a], [b]) => Buffer.compare(Buffer.from(a), Buffer.from(b)))

function archivePath(name) {
  if (!name || /[\x00-\x1f\\:]/u.test(name) || name.split('/').some(part => !part || part === '.' || part === '..')) {
    throw Error(`Unsafe release path: ${name}`)
  }
  return name
}

function included(name) {
  return name !== metadataName && !excluded.has(name.split('/')[0])
}

function collect(directory) {
  const files = new Map()
  function walk(current, prefix) {
    if (!lstatSync(current).isDirectory()) throw Error(`Release directory must be a regular directory: ${current}`)
    for (const entry of readdirSync(current, {withFileTypes: true})) {
      const name = archivePath(prefix + entry.name)
      const path = resolve(current, entry.name)
      if (entry.isDirectory()) walk(path, name + '/')
      else if (entry.isFile()) files.set(name, readFileSync(path))
      else throw Error(`Release files must be regular: ${name}`)
    }
  }
  if (existsSync(directory)) walk(directory, '')
  return files
}

function readWorkingFile(root, name) {
  const parts = archivePath(name).split('/')
  let current = root
  for (const directory of parts.slice(0, -1)) {
    current = resolve(current, directory)
    if (!existsSync(current)) return undefined
    if (!lstatSync(current).isDirectory()) throw Error(`Candidate directory must be regular: ${name}`)
  }
  const path = resolve(current, parts.at(-1))
  if (!existsSync(path)) return undefined
  if (!lstatSync(path).isFile()) throw Error(`Candidate file must be regular: ${name}`)
  return readFileSync(path)
}

function candidateSource(root, git, extraFiles) {
  const entries = git('ls-files', '--cached', '-z').toString('utf8').split('\0').filter(Boolean)
  const untracked = new Set(git('ls-files', '--others', '--exclude-standard', '-z').toString('utf8').split('\0'))
  for (const name of extraFiles) {
    if (!included(archivePath(name)) || !untracked.has(name)) {
      throw Error(`Candidate file must be an explicitly reviewed untracked input: ${name}`)
    }
    entries.push(name)
  }
  const files = new Map()
  for (const name of new Set(entries)) {
    if (!included(archivePath(name))) continue
    const bytes = readWorkingFile(root, name)
    if (bytes !== undefined) files.set(name, bytes)
  }
  return files
}

function committedSource(git, revision, exported) {
  for (const entry of git('ls-tree', '-rz', '--full-tree', revision).toString('utf8').split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t')
    if (!/^100(?:644|755) blob [0-9a-f]+$/.test(entry.slice(0, tab))) {
      throw Error(`Release source must contain only regular files: ${entry.slice(tab + 1)}`)
    }
    archivePath(entry.slice(tab + 1))
  }
  mkdirSync(exported)
  execFileSync('tar', ['-xf', '-', '-C', exported], {
    input: git('-c', 'core.autocrlf=false', 'archive', '--format=tar', revision), windowsHide: true,
  })
  return new Map([...collect(exported)].filter(([name]) => included(name)))
}

function exportSource(files, directory) {
  for (const [name, bytes] of files) {
    const path = resolve(directory, name)
    mkdirSync(dirname(path), {recursive: true})
    writeFileSync(path, bytes, {flag: 'wx'})
  }
}

function tarHeader(path, size) {
  const header = Buffer.alloc(512)
  const octal = (value, offset, width) => header.write(value.toString(8).padStart(width - 1, '0') + '\0', offset, width, 'ascii')
  let name = path
  if (Buffer.byteLength(path) > 100) {
    const split = path.lastIndexOf('/')
    if (split < 1 || Buffer.byteLength(path.slice(0, split)) > 155 || Buffer.byteLength(path.slice(split + 1)) > 100) {
      throw Error(`Release path exceeds portable tar limits: ${path}`)
    }
    header.write(path.slice(0, split), 345, 155, 'utf8')
    name = path.slice(split + 1)
  }
  header.write(name, 0, 100, 'utf8')
  octal(0o644, 100, 8)
  octal(0, 108, 8)
  octal(0, 116, 8)
  octal(size, 124, 12)
  octal(0, 136, 12)
  header.fill(32, 148, 156)
  header.write('0', 156, 1, 'ascii')
  header.write('ustar\0' + '00', 257, 8, 'ascii')
  const checksum = header.reduce((sum, value) => sum + value, 0)
  header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii')
  return header
}

function archiveBytes(files) {
  const chunks = []
  for (const [path, bytes] of sorted(files)) {
    chunks.push(tarHeader(path, bytes.length), bytes, Buffer.alloc((512 - bytes.length % 512) % 512))
  }
  chunks.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(chunks), {level: 9})
}

function runStep(name, program, args, cwd, env, diagnostics, shell = false) {
  const stdout = resolve(diagnostics, name + '.stdout.log')
  const stderr = resolve(diagnostics, name + '.stderr.log')
  const output = openSync(stdout, 'wx')
  try {
    const errors = openSync(stderr, 'wx')
    try {
      const result = spawnSync(program, args, {cwd, env, windowsHide: true, shell, stdio: ['ignore', output, errors]})
      if (result.error || result.status !== 0) {
        throw Error(`Interface ${name} failed (${result.error?.message ?? result.status}); inspect ${stdout} and ${stderr}.`)
      }
    } finally { closeSync(errors) }
  } finally { closeSync(output) }
  return readFileSync(stdout, 'utf8')
}

function runNpm(name, args, cwd, env, diagnostics) {
  // npm is a cmd shim on Windows. Its command and flags are fixed by the builder.
  if (process.platform === 'win32') runStep(name, 'npm ' + args.join(' '), [], cwd, env, diagnostics, true)
  else runStep(name, 'npm', args, cwd, env, diagnostics)
}

function writePair(output, source, staticFiles, metadata) {
  const artifacts = {}
  const outputs = new Map()
  for (const [kind, files] of [['source', source], ['static', staticFiles]]) {
    files.set(metadataName, Buffer.from(JSON.stringify({...metadata, kind}, null, 2) + '\n'))
    const filename = `cirnet-interface-next-${metadata.version}-${kind}.tar.gz`
    const path = resolve(output, filename)
    const bytes = archiveBytes(files)
    outputs.set(path, bytes)
    artifacts[kind] = {filename, path, size: bytes.length, sha256: sha256(bytes)}
  }
  const manifest = {...metadata, artifacts}
  outputs.set(resolve(output, 'artifacts.json'), Buffer.from(JSON.stringify(manifest, null, 2) + '\n'))
  for (const path of outputs.keys()) {
    if (existsSync(path)) throw Error(`Release output already exists: ${path}`)
  }
  mkdirSync(output, {recursive: true})
  const written = []
  try {
    for (const [path, bytes] of outputs) {
      const fd = openSync(path, 'wx')
      written.push(path)
      try { writeFileSync(fd, bytes) } finally { closeSync(fd) }
    }
  } catch (error) {
    for (const path of written) unlinkSync(path)
    throw error
  }
  return manifest
}

function lockCandidateInputs(source, manifestPath) {
  if (!isAbsolute(manifestPath ?? '')) throw Error('Select an absolute --manifest for the native producer artifacts.')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const lock = JSON.parse(source.get('integration/contracts-artifacts.json').toString('utf8'))
  const compatibility = JSON.parse(source.get('integration/compatibility.json').toString('utf8'))
  const npmLock = JSON.parse(source.get('package-lock.json').toString('utf8'))
  for (const key of ['npm', 'native_crate', 'dev_npm', 'remote_openapi']) {
    const entry = lock[key]
    const selected = manifest[key]
    if (!entry || !isAbsolute(selected?.path ?? '') || !/^[0-9a-f]{64}$/.test(selected.sha256 ?? '') ||
        !lstatSync(selected.path).isFile()) throw Error(`Missing exact native producer input: ${key}`)
    const bytes = readFileSync(selected.path)
    if (sha256(bytes) !== selected.sha256 || (entry.sha256 && entry.sha256 !== selected.sha256)) {
      throw Error(`Native producer input SHA-256 mismatch: ${key}`)
    }
    entry.sha256 = selected.sha256
    const dependency = npmLock.packages[`node_modules/${entry.name}`]
    if (key === 'npm' || key === 'dev_npm') {
      const integrity = 'sha512-' + createHash('sha512').update(bytes).digest('base64')
      if (!dependency || (dependency.integrity && dependency.integrity !== integrity)) {
        throw Error(`Native producer input disagrees with npm lock integrity: ${key}`)
      }
      dependency.integrity = integrity
    }
  }
  compatibility.contracts.npmSha256 = lock.npm.sha256
  for (const [name, content] of [
    ['integration/contracts-artifacts.json', lock], ['integration/compatibility.json', compatibility],
    ['package-lock.json', npmLock],
  ]) source.set(name, Buffer.from(JSON.stringify(content, null, 2) + '\n'))
}

function build({outputDirectory, sourceRoot, manifestPath, candidate, verification, extraFiles}) {
  const root = realpathSync(sourceRoot)
  const git = (...args) => execFileSync('git', ['-C', root, ...args], {windowsHide: true, maxBuffer: 256 * 1024 * 1024})
  if (root !== realpathSync(git('rev-parse', '--show-toplevel').toString('utf8').trim())) {
    throw Error('Interface export requires the root of a Git checkout.')
  }
  if (!candidate && git('status', '--porcelain=v1').length) throw Error('Interface releases require a clean committed Git checkout.')
  if (extraFiles.length && !candidate) throw Error('--candidate-file requires --candidate.')
  if (manifestPath && !isAbsolute(manifestPath)) throw Error('The release manifest path must be absolute.')
  const revision = git('rev-parse', 'HEAD').toString('utf8').trim()
  const repository = git('remote', 'get-url', 'origin').toString('utf8').trim()
  if (!repository.startsWith('https://') || repository.includes('@')) {
    throw Error('Release provenance requires an HTTPS origin without embedded credentials.')
  }
  const session = getArtifactDirectory()
  const output = validateArtifactDirectory(outputDirectory)
  const position = relative(session, output)
  if (!position || isAbsolute(position) || position === '..' || position.startsWith('..' + sep)) {
    throw Error('Release output must be a child of the current owned artifact session.')
  }
  const diagnostics = getArtifactDirectory('interface-build-' + randomBytes(4).toString('hex'))
  const exported = resolve(diagnostics, 'source')
  mkdirSync(exported)
  const source = candidate
    ? candidateSource(root, git, extraFiles)
    : committedSource(git, revision, resolve(diagnostics, 'committed'))
  lockCandidateInputs(source, manifestPath)
  exportSource(source, exported)
  const metadata = JSON.parse(source.get('package.json').toString('utf8'))
  const compatibility = JSON.parse(source.get('integration/compatibility.json').toString('utf8'))
  const version = compatibility.interface?.version
  if (compatibility.interface?.name !== '@cirnet/web' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
    throw Error('Committed compatibility descriptor must identify the Interface package.')
  }
  if (metadata.name !== '@cirnet/web' || metadata.version !== version) {
    throw Error(`Committed Interface product metadata must be @cirnet/web==${version}`)
  }
  const lock = JSON.parse(source.get('integration/contracts-artifacts.json').toString('utf8'))
  const {contractsVersion} = lock
  if (lock.status !== 'PINNED_ARTIFACT_INPUTS' || !contractsVersion || lock.npm?.name !== '@cirnet/contracts' ||
      lock.npm?.version !== contractsVersion || !/^[a-zA-Z0-9_.-]+\.tgz$/.test(lock.npm?.filename ?? '') ||
      !/^[0-9a-f]{64}$/.test(lock.npm?.sha256 ?? '') || lock.dev_npm?.name !== '@cirnet/artifact-paths' ||
      lock.dev_npm?.version !== contractsVersion) {
    throw Error('Committed Contracts lock must select canonical packages at the reviewed versions.')
  }
  const selected = compatibility.contracts
  if (!selected?.targetVersion || selected.npm !== contractsVersion || selected.npmSha256 !== lock.npm.sha256) {
    throw Error('Committed compatibility descriptor differs from the Contracts SDK lock.')
  }
  const artifactPurpose = verification || candidate ? 'verification' : 'release-input'
  if (artifactPurpose === 'release-input' && selected.targetVersion !== contractsVersion) {
    throw Error(`Release input requires Contracts ${selected.targetVersion}. The checked-in SDK is ${contractsVersion}. Use --verification for local checks.`)
  }
  const dependency = `file:.artifacts/${lock.npm.filename}`
  const npmLock = JSON.parse(source.get('package-lock.json').toString('utf8'))
  const sdk = npmLock.packages?.['node_modules/@cirnet/contracts']
  if (metadata.dependencies?.['@cirnet/contracts'] !== dependency || sdk?.resolved !== dependency ||
      sdk?.version !== contractsVersion) {
    throw Error('Committed npm metadata must select the reviewed Contracts SDK archive.')
  }
  const fingerprint = createHash('sha256')
  for (const [name, bytes] of sorted(source)) {
    fingerprint.update(sha256(bytes) + '  ' + name + '\n')
  }
  const environment = {...process.env, CIRNET_ARTIFACTS_SESSION: session, NETCIRCUIT_ARTIFACTS_SESSION: session}
  const bootstrapArgs = ['scripts/bootstrap-contracts.mjs', '--product']
  if (manifestPath) bootstrapArgs.push('--manifest', manifestPath)
  const bootstrap = JSON.parse(runStep('bootstrap', process.execPath, bootstrapArgs, exported, environment, diagnostics))
  if (bootstrap.contractsVersion !== contractsVersion || bootstrap.artifactSession !== session) {
    throw Error('Committed bootstrap must select the exact Contracts version and inherited owned session.')
  }
  const sdkBytes = readFileSync(resolve(exported, '.artifacts', lock.npm.filename))
  const contractsSha256 = sha256(sdkBytes)
  if (contractsSha256 !== lock.npm.sha256 || sdk.integrity !== 'sha512-' + createHash('sha512').update(sdkBytes).digest('base64')) {
    throw Error('Bootstrapped Contracts SDK must match both reviewed digests.')
  }
  Object.assign(environment, bootstrap.environment)
  runNpm('npm-ci', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], exported, environment, diagnostics)
  runNpm('npm-build', ['run', 'build'], exported, environment, diagnostics)
  const staticFiles = collect(resolve(exported, 'dist'))
  for (const page of ['index.html', 'oscilloscope-preview.html', 'function-generator-preview.html']) {
    if (!staticFiles.has(page)) throw Error(`Missing production entrypoint in static bundle: ${page}`)
  }
  return writePair(output, source, staticFiles, {
    schema: 1, name: 'cirnet-interface-next', version, contractsVersion, contractsSha256, artifactPurpose,
    contractsCrateSha256: lock.native_crate.sha256, remoteOpenapiSha256: lock.remote_openapi.sha256,
    source: {repository, revision, uncommittedMigration: candidate},
    sourceFingerprint: fingerprint.digest('hex'), sourceFingerprintAlgorithm: 'sha256-path-lines-v1',
  })
}

try {
  const {values} = parseArgs({options: {
    'output-directory': {type: 'string'},
    'source-root': {type: 'string', default: product},
    manifest: {type: 'string', default: process.env.CIRNET_CONTRACTS_ARTIFACT_MANIFEST},
    candidate: {type: 'boolean', default: false},
    verification: {type: 'boolean', default: false},
    'candidate-file': {type: 'string', multiple: true, default: []},
  }})
  if (!isAbsolute(values['output-directory'] ?? '')) throw Error('--output-directory must be absolute.')
  console.log(JSON.stringify(build({
    outputDirectory: values['output-directory'], sourceRoot: values['source-root'],
    manifestPath: values.manifest, candidate: values.candidate, verification: values.verification,
    extraFiles: values['candidate-file'],
  }), null, 2))
} catch (error) {
  console.error(`interface-release: ${error.message}`)
  process.exitCode = 1
}
