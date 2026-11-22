import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {spawnSync,execFileSync} from 'node:child_process'
import {getArtifactDirectory} from './artifact-paths.mjs'
import {cachedSelection} from './contracts-artifacts.mjs'

const product=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const pages=['index.html','oscilloscope-preview.html','function-generator-preview.html']

function fixture({omitPage,productVersion='0.3.0-dev.1',inputVersion='0.3.0-dev.1',contractsVersion=inputVersion,sdkName='@cirnet/contracts',wrongNpmIntegrity=false}={}){
  const owned=mkdtempSync(resolve(getArtifactDirectory('interface-export-regression'),'case-')),source=resolve(owned,'source')
  const sdkRoot=resolve(owned,'sdk','package'),sdistName=`cirnet-contracts-native-${inputVersion}`,sdistRoot=resolve(owned,'sdist',sdistName)
  for(const directory of [resolve(source,'scripts'),resolve(source,'integration'),resolve(source,'dist'),sdkRoot,sdistRoot])mkdirSync(directory,{recursive:true})
  writeFileSync(resolve(sdkRoot,'package.json'),JSON.stringify({name:sdkName,version:inputVersion,type:'module',exports:'./index.mjs'}))
  writeFileSync(resolve(sdkRoot,'index.mjs'),`export const marker='reviewed SDK ${inputVersion}'\n`)
  writeFileSync(resolve(sdistRoot,'Cargo.toml'),`[package]\nname = "cirnet-contracts-native"\nversion = "${inputVersion}"\n`)
  const sdk=resolve(owned,'sdk.tgz'),sdist=resolve(owned,'sdist.tar.gz')
  execFileSync('tar',['-czf',sdk,'-C',dirname(sdkRoot),'package'],{windowsHide:true})
  execFileSync('tar',['-czf',sdist,'-C',dirname(sdistRoot),sdistName],{windowsHide:true})
  const lock=JSON.parse(readFileSync(resolve(product,'integration/contracts-artifacts.json'),'utf8'))
  lock.contractsVersion=contractsVersion
  lock.npm={...lock.npm,name:sdkName,version:inputVersion,filename:'fixture-contracts.tgz',sha256:createHash('sha256').update(readFileSync(sdk)).digest('hex')}
  const dev = cachedSelection().dev_npm
  const openapi = {path:resolve(owned,'openapi.json')}
  writeFileSync(openapi.path, JSON.stringify({openapi:'3.1.0',paths:{}}))
  openapi.sha256 = createHash('sha256').update(readFileSync(openapi.path)).digest('hex')
  lock.native_crate={...lock.native_crate,version:inputVersion,sha256:createHash('sha256').update(readFileSync(sdist)).digest('hex')}
  lock.remote_openapi.sha256=openapi.sha256
  lock.dev_npm.sha256=dev.sha256
  writeFileSync(resolve(source,'integration/contracts-artifacts.json'),JSON.stringify(lock))
  const compatibility=JSON.parse(readFileSync(resolve(product,'integration/compatibility.json'),'utf8'))
  Object.assign(compatibility.contracts,{npm:inputVersion,npmSha256:lock.npm.sha256})
  writeFileSync(resolve(source,'integration/compatibility.json'),JSON.stringify(compatibility))
  for(const name of ['bootstrap-contracts.mjs','contracts-artifacts.mjs','environment.mjs'])writeFileSync(resolve(source,'scripts',name),readFileSync(resolve(product,'scripts',name)))
  const dependency='file:.artifacts/fixture-contracts.tgz'
  const devDependency=`file:.artifacts/${lock.dev_npm.filename}`
  const integrity='sha512-'+createHash('sha512').update(wrongNpmIntegrity?'another SDK':readFileSync(sdk)).digest('base64')
  writeFileSync(resolve(source,'package.json'),JSON.stringify({name:'@cirnet/web',version:productVersion,scripts:{build:'node scripts/build.mjs'},dependencies:{'@cirnet/contracts':dependency},devDependencies:{'@cirnet/artifact-paths':devDependency}}))
  writeFileSync(resolve(source,'package-lock.json'),JSON.stringify({name:'@cirnet/web',version:productVersion,lockfileVersion:3,requires:true,packages:{
    '':{name:'@cirnet/web',version:productVersion,dependencies:{'@cirnet/contracts':dependency},devDependencies:{'@cirnet/artifact-paths':devDependency}},
    'node_modules/@cirnet/contracts':{name:sdkName,version:inputVersion,resolved:dependency,integrity},
    'node_modules/@cirnet/artifact-paths':{name:'@cirnet/artifact-paths',version:lock.dev_npm.version,resolved:devDependency,dev:true},
  }}))
  writeFileSync(resolve(source,'.gitignore'),'dist/\nnode_modules/\n.artifacts/\n')
  writeFileSync(resolve(source,'source.txt'),'committed source\n')
  writeFileSync(resolve(source,'scripts/build.mjs'),`
import {readFileSync,writeFileSync,mkdirSync,appendFileSync,existsSync} from 'node:fs'
import {marker} from '@cirnet/contracts'
const text=readFileSync('source.txt','utf8')
mkdirSync('dist',{recursive:true})
for(const page of ${JSON.stringify(pages.filter(page=>page!==omitPage))})writeFileSync('dist/'+page,'<title>'+page+'</title>\\n'+text+marker+'\\n')
appendFileSync(process.env.CIRNET_RELEASE_TEST_RECEIPT,JSON.stringify({cwd:process.cwd(),text,marker,git:existsSync('.git')})+'\\n')
`)
  for(const page of pages)writeFileSync(resolve(source,'dist',page),'stale ignored bundle')
  const manifest=resolve(owned,'inputs.json'),receipt=resolve(owned,'build-receipt.jsonl')
  writeFileSync(manifest,JSON.stringify({npm:{path:sdk,sha256:lock.npm.sha256},dev_npm:dev,
    native_crate:{path:sdist,sha256:lock.native_crate.sha256},remote_openapi:openapi}))
  const git=(...args)=>execFileSync('git',['-C',source,...args],{encoding:'utf8',windowsHide:true})
  git('init');git('config','core.autocrlf','true');git('config','user.email','release-test@example.invalid');git('config','user.name','Release fixture')
  git('remote','add','origin','https://github.com/example/fixture.git');git('add','.');git('commit','-m','Synthetic release fixture')
  const invoke=(directory,...args)=>spawnSync(process.execPath,[resolve(product,'scripts/build-release.mjs'),'--source-root',source,'--output-directory',directory,'--manifest',manifest,...args],{
    env:{...process.env,CIRNET_RELEASE_TEST_RECEIPT:receipt},encoding:'utf8',windowsHide:true,
  })
  return {owned,source,git,invoke,manifest,receipt,contractsSha256:lock.npm.sha256}
}

test('verification builds the exact committed export with locked SDK installation reproducibly',()=>{
  const {owned,source,git,invoke,receipt,contractsSha256}=fixture()
  const a=invoke(resolve(owned,'one'),'--verification'),b=invoke(resolve(owned,'two'),'--verification')
  assert.equal(a.status,0,a.stderr);assert.equal(b.status,0,b.stderr)
  const first=JSON.parse(a.stdout),second=JSON.parse(b.stdout)
  for(const kind of ['source','static'])assert.equal(first.artifacts[kind].sha256,second.artifacts[kind].sha256)
  assert.equal(first.version,'0.3.0-dev.1');assert.equal(first.contractsVersion,'0.3.0-dev.1')
  assert.equal(first.artifactPurpose,'verification');assert.equal(first.contractsSha256,contractsSha256)
  const archive=first.artifacts.source.path
  const metadata=JSON.parse(execFileSync('tar',['-xzOf',archive,'interface-artifact.json'],{encoding:'utf8',windowsHide:true}))
  assert.equal(metadata.source.revision,git('rev-parse','HEAD').trim())
  assert.equal(metadata.source.uncommittedMigration,false)
  assert.equal(metadata.version,'0.3.0-dev.1');assert.equal(metadata.contractsVersion,'0.3.0-dev.1')
  assert.equal(metadata.artifactPurpose,'verification');assert.equal(metadata.contractsSha256,contractsSha256)
  const staticMetadata=JSON.parse(execFileSync('tar',['-xzOf',first.artifacts.static.path,'interface-artifact.json'],{encoding:'utf8',windowsHide:true}))
  assert.equal(staticMetadata.version,'0.3.0-dev.1');assert.equal(staticMetadata.contractsVersion,'0.3.0-dev.1')
  assert.equal(staticMetadata.artifactPurpose,'verification');assert.equal(staticMetadata.contractsSha256,contractsSha256)
  assert.equal(execFileSync('tar',['-xzOf',archive,'source.txt'],{encoding:'utf8',windowsHide:true}),'committed source\n')
  for(const page of pages)assert.equal(execFileSync('tar',['-xzOf',first.artifacts.static.path,page],{encoding:'utf8',windowsHide:true}),`<title>${page}</title>\ncommitted source\nreviewed SDK 0.3.0-dev.1\n`)
  const builds=readFileSync(receipt,'utf8').trim().split('\n').map(line=>JSON.parse(line))
  assert.equal(builds.length,2)
  assert.notEqual(builds[0].cwd,builds[1].cwd,'each build needs a fresh exported source tree')
  for(const build of builds){assert.notEqual(resolve(build.cwd),source);assert.equal(build.git,false);assert.equal(build.text,'committed source\n');assert.equal(build.marker,'reviewed SDK 0.3.0-dev.1')}
  assert.equal(readFileSync(resolve(source,'dist/index.html'),'utf8'),'stale ignored bundle')
  assert.equal(existsSync(resolve(source,'node_modules')),false)
  writeFileSync(resolve(source,'source.txt'),'dirty source\n')
  const dirty=invoke(resolve(owned,'dirty'))
  assert.notEqual(dirty.status,0);assert.match(dirty.stderr,/clean committed/)
})

test('an altered native input is rejected before a build starts',()=>{
  const {owned,invoke,manifest,receipt}=fixture()
  const inputs=JSON.parse(readFileSync(manifest,'utf8'))
  inputs.remote_openapi.sha256='0'.repeat(64)
  writeFileSync(manifest,JSON.stringify(inputs))
  const result=invoke(resolve(owned,'rejected'))
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/Native producer input SHA-256 mismatch: remote_openapi/)
  assert.equal(existsSync(receipt),false)
})

test('release input records the exact target SDK digest in its receipt and static metadata',()=>{
  const {owned,invoke,contractsSha256}=fixture({inputVersion:'0.3.0-dev.1'})
  const result=invoke(resolve(owned,'release'))
  assert.equal(result.status,0,result.stderr)
  const manifest=JSON.parse(result.stdout)
  assert.equal(manifest.artifactPurpose,'release-input')
  assert.equal(manifest.contractsVersion,'0.3.0-dev.1')
  assert.equal(manifest.contractsSha256,contractsSha256)
  const metadata=JSON.parse(execFileSync('tar',['-xzOf',manifest.artifacts.static.path,'interface-artifact.json'],{encoding:'utf8',windowsHide:true}))
  assert.equal(metadata.artifactPurpose,manifest.artifactPurpose)
  assert.equal(metadata.contractsSha256,contractsSha256)
  assert.deepEqual(metadata.source,manifest.source)
})

test('a target SDK whose bytes disagree with the npm lock cannot become release input',()=>{
  const {owned,invoke,receipt}=fixture({inputVersion:'0.3.0-dev.1',wrongNpmIntegrity:true})
  const result=invoke(resolve(owned,'release'))
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/disagrees with npm lock integrity/)
  assert.equal(existsSync(receipt),false)
})

test('release rejects arbitrary caller-provided static roots rather than stamping them with HEAD',()=>{
  const {owned,invoke}=fixture(),arbitrary=resolve(owned,'arbitrary')
  mkdirSync(arbitrary)
  for(const page of pages)writeFileSync(resolve(arbitrary,page),'unrelated static input')
  const result=invoke(resolve(owned,'output'),'--static-root',arbitrary)
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/Unknown option.*--static-root/)
})

test('the freshly executed build must still produce all three production entrypoints',()=>{
  const {owned,invoke}=fixture({omitPage:'function-generator-preview.html'})
  const result=invoke(resolve(owned,'output'),'--verification')
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/Missing production entrypoint.*function-generator-preview\.html/)
})

test('release rejects a stale Interface product without advancing its Contracts version',()=>{
  const {owned,invoke}=fixture({productVersion:'0.1.4'})
  const result=invoke(resolve(owned,'output'))
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/Committed Interface product metadata must be @cirnet\/web==0\.3\.0-dev\.1/)
})

test('release rejects a bootstrap that reports the Interface patch as its Contracts version',()=>{
  const {owned,invoke}=fixture({contractsVersion:'0.3.0-dev.2'})
  const result=invoke(resolve(owned,'output'))
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/Committed Contracts lock must select canonical packages|input disagrees with npm lock integrity/)
})

test('new releases reject alternate SDK package identities before bootstrap or build',()=>{
  const {owned,invoke,receipt}=fixture({sdkName:'@other/contracts'})
  const result=invoke(resolve(owned,'legacy-sdk'))
  assert.notEqual(result.status,0)
  assert.match(result.stderr,/Committed Contracts lock must select canonical packages|input disagrees with npm lock integrity/)
  assert.equal(existsSync(receipt),false)
})

test('an explicit candidate uses the requested working-tree files and cannot masquerade as committed',()=>{
  const {owned,source,git,invoke}=fixture()
  writeFileSync(resolve(source,'source.txt'),'candidate source\n')
  writeFileSync(resolve(source,'extra.txt'),'reviewed candidate input\n')
  writeFileSync(resolve(source,'unselected.txt'),'do not package this\n')
  const result=invoke(resolve(owned,'candidate'),'--candidate','--candidate-file','extra.txt')
  assert.equal(result.status,0,result.stderr)
  const output=JSON.parse(result.stdout)
  assert.equal(output.source.revision,git('rev-parse','HEAD').trim())
  assert.equal(output.source.uncommittedMigration,true)
  assert.equal(output.artifactPurpose,'verification')
  const archive=output.artifacts.source.path
  const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8',windowsHide:true}).trim().split(/\r?\n/)
  assert.ok(names.includes('extra.txt'))
  assert.ok(!names.includes('unselected.txt'))
  assert.equal(execFileSync('tar',['-xzOf',archive,'source.txt'],{encoding:'utf8',windowsHide:true}),'candidate source\n')
})
