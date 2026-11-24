import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'

export const BASELINE_REF='40a4cad80be76a5b08943fab51ee2218cb7d7012'
export const SOURCE_PATHS=['apps/web/src/data/componentSearch.ts','apps/web/src/three/PackageThumbnails.ts']
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')

/** Use the original benchmark source bytes recorded in the fixture manifest. */
export async function loadHistoricalSources(root,ref=BASELINE_REF,{read=readFile}={}) {
  assert.equal(ref,BASELINE_REF,`No verified source fixture for historical revision ${ref}`)
  const folder=resolve(root,'tests/fixtures/historical',BASELINE_REF)
  const manifest=JSON.parse(await read(resolve(folder,'manifest.json'),'utf8'))
  assert.equal(manifest.sourceRevision,BASELINE_REF)
  assert.deepEqual(manifest.files.map(entry=>entry.sourcePath),SOURCE_PATHS)
  const sources=new Map()
  for(const entry of manifest.files) {
    assert.equal(entry.file,entry.sourcePath.replace('apps/web/',''))
    const bytes=await read(resolve(folder,entry.file))
    assert.equal(digest(bytes),entry.sha256,`Historical source hash mismatch: ${entry.sourcePath}`)
    const source=Buffer.from(bytes).toString('utf8').trimEnd()
    assert.equal(digest(source),entry.trimmedSha256)
    sources.set(entry.sourcePath,source)
  }
  return {ref,origin:'verified source fixtures',sources}
}
