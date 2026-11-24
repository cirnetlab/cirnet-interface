import {test,expect,type Page} from '@playwright/test'
import {mkdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getArtifactDirectory} from '../scripts/artifact-paths.mjs'
test.setTimeout(360000)
const directory=process.env.CIRNET_DEPTH_OUTPUT?getArtifactDirectory('',{directory:process.env.CIRNET_DEPTH_OUTPUT}):getArtifactDirectory('depth-artifacts/final'),matrixSubject=process.env.CIRNET_DEPTH_SUBJECT
async function open(page:Page,before=false){await mkdir(directory,{recursive:true});await page.route('**/@vite/client',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('transport.connect(createHMRHandler(handleMessage));','')})});const errors:string[]=[];page.on('pageerror',e=>{errors.push(e.message);console.log(e.message)});await page.goto(`/e2e/depth-harness.html${before?'?before':''}`);await expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:45000});expect(errors).toEqual([])}
async function measure(page:Page,id:string,distance:number,azimuth=20,elevation=35){return page.evaluate(async({id,distance,azimuth,elevation})=>{const h=(window as any).depthHarness;h.pose(id,distance,azimuth,elevation);await h.frame();return{metadata:h.metadata(),leaks:await h.leaks(id)}},{id,distance,azimuth,elevation})}
async function measureMatrixPose(page:Page,id:string,zoom:number){
 return page.evaluate(async({id,zoom})=>{
  const h=(window as any).depthHarness,started=performance.now()
  h.pose(id,30*100/zoom,20,id==='BOARD'?90:35)
  await h.frame()
  const frameMs=performance.now()-started
  const metadata=h.metadata(),observed=await h.profileLeaks(id)
  return {metadata,...observed,frameMs}
 },{id,zoom})
}
async function measureGlyphPose(page:Page,id:string,distance:number){
 return page.evaluate(async({id,distance})=>{
  const h=(window as any).depthHarness
  h.pose(id,distance,20,35)
  await h.frame()
  return {metadata:h.metadata(),...await h.profileLeaks(id,true)}
 },{id,distance})
}
test('retained pre-fix native WebGL evidence',async({page})=>{
 test.skip(!process.env.CIRNET_DEPTH_BASELINE,'Optional retained-source capture; clean checkout regression uses current source below')
 await open(page,true);await mkdir(directory,{recursive:true});const results=[]
 for(const id of ['DISPLAY','SCOPE','GEN']){const before=await measure(page,id,30);await page.screenshot({path:resolve(directory,`before-${id}.png`)});await page.evaluate(()=>{(window as any).depthHarness.setNear(.1)});const reference=await page.evaluate(async()=>{const h=(window as any).depthHarness;return{metadata:h.metadata(),leaks:await h.leaks()}});await page.screenshot({path:resolve(directory,`reference-near-${id}.png`)});results.push({id,before,reference});console.log(JSON.stringify({id,before:before.leaks,reference:reference.leaks}));expect.soft(before.leaks.changed).toBeGreaterThan(0);expect.soft(reference.leaks.changed).toBe(0)}
 await writeFile(resolve(directory,'before.json'),JSON.stringify(results,null,2))
})
const displays=['DISPLAY','DOUBLE','QUAD']
for(const dpr of [1,2])for(const historical of [false,true]){
 const matrix=historical?'historical':'current'
 const subjects=historical?displays:[...displays,'SCOPE','GEN','BOARD','PSU']
 for(const id of subjects.filter(id=>!matrixSubject||id===matrixSubject)){
  test(`native WebGL hidden-layer regression DPR ${dpr} (${matrix}) ${id}`,async({browser})=>{
   const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:dpr})
   const jsonPath=resolve(directory,`after-dpr${dpr}-${matrix}-${id}.json`),results=[]
   try{
    const page=await context.newPage()
    await open(page)
    await page.evaluate(async historical=>{const h=(window as any).depthHarness;h.fixture(historical);await h.frame()},historical)
    for(const zoom of [50,100,1000]){
     const started=performance.now(),result=await measureMatrixPose(page,id,zoom)
     const screenshotStarted=performance.now()
     if(!historical&&zoom===100)await page.screenshot({path:resolve(directory,`after-${id}-dpr${dpr}.png`)})
     const timing={...result.profile,frameMs:result.frameMs,screenshotMs:performance.now()-screenshotStarted,totalMs:performance.now()-started}
     results.push({id,historical,zoom,...result,timing})
     console.log(JSON.stringify({id,historical,zoom,dpr,drawingBuffer:result.metadata.drawingBuffer,...result.leaks,timing}))
     expect.soft(result.leaks.tested,`${id} ${zoom}% has a visible interior`).toBeGreaterThan(10)
     expect.soft(result.leaks.changed,`${id} ${matrix} ${zoom}% DPR${dpr} underlayer leaks`).toBe(0)
    }
   }finally{
    await context.close()
    const started=performance.now()
    await writeFile(jsonPath,JSON.stringify(results,null,2))
    console.log(JSON.stringify({matrix,dpr,id,poses:results.length,receiptWriteMs:performance.now()-started}))
   }
  })
 }
}

test('technical grid remains visible with tight scene clipping and behind opaque faces',async({page})=>{
 await open(page);await measure(page,'DISPLAY',30);const result=await page.evaluate(()=>((window as any).depthHarness.compareGrid()));console.log(JSON.stringify({grid:result}));await page.screenshot({path:resolve(directory,'grid-after.png')});await writeFile(resolve(directory,'grid-clip-invariance.json'),JSON.stringify(result,null,2));expect(result.ink).toBeGreaterThan(100);expect(result.different).toBe(0);expect(result.foregroundSamples).toBeGreaterThan(10);expect(result.foregroundChanged).toBe(0)
})

test('real workspace inspect pose keeps remote panels and LED faces stable',async({page})=>{
 await page.setViewportSize({width:1440,height:909});await open(page)
 await page.evaluate(async()=>{const h=(window as any).depthHarness;h.setGraph({schema_version:'1.2',circuit_id:'inspect-crossing',modules:[{id:'BOARD',type:'BREADBOARD',position:{x:0,y:0,z:0}},{id:'SCOPE',type:'OSCILLOSCOPE',position:{x:-6,y:0,z:-4}},{id:'GEN',type:'GENERATOR',position:{x:1,y:0,z:-4}},{id:'PSU',type:'DC_SUPPLY',position:{x:6,y:0,z:-4}},{id:'DISPLAY',type:'SEGMENT_SC5611EWA',position:{x:0,y:.33,z:0},physicalDescriptor:{version:1,partId:'KINGBRIGHT-SC56-11EWA',partRevision:2,packageId:'SC56-11EWA-TH-BBI3',packageRevision:2}}],connections:[]});h.manager.camera.position.fromArray([-2.173544500972541,4.562339592436375,-1.7450388611525094]);h.manager.camera.quaternion.fromArray([-.4280412766868401,-.4953533625364472,-.3069399962796487,.6907919732886192]);h.manager.camera.updateMatrixWorld();await h.frame()})
 const evidence=await page.evaluate(async()=>{const h=(window as any).depthHarness;return{metadata:h.metadata(),display:await h.leaks('DISPLAY'),scope:await h.leaks('SCOPE'),generator:await h.leaks('GEN')}})
 await page.screenshot({path:resolve(directory,'after-workspace-inspect-pose.png')});await writeFile(resolve(directory,'inspect-pose.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));expect(evidence.display.tested).toBeGreaterThan(100);expect(evidence.display.changed).toBe(0);expect(evidence.generator.changed).toBe(0);expect(evidence.scope.changed).toBe(0)
})

test('grid ignores model add move delete and remains visible in an empty workspace at every zoom',async({page})=>{
 await open(page);await measure(page,'DISPLAY',30);const stages=await page.evaluate(async()=>((window as any).depthHarness.gridInvariant()));console.log(JSON.stringify({gridSceneStages:stages}));for(const stage of stages)expect(stage.changed,stage.stage).toBe(0)
 const zooms=[];for(const zoom of [50,100,1000]){const result=await page.evaluate(async zoom=>{const h=(window as any).depthHarness;h.setGraph({schema_version:'1.0',circuit_id:'empty-grid',modules:[],connections:[]});h.manager.setZoom(zoom);await h.frame();return{zoom,ink:h.gridInk(),metadata:h.metadata()}},zoom);expect(result.ink,`empty grid ${zoom}%`).toBeGreaterThan(100);zooms.push(result);await page.screenshot({path:resolve(directory,`empty-grid-${zoom}.png`)})}await writeFile(resolve(directory,'grid-scene-invariance.json'),JSON.stringify({stages,zooms},null,2))
})
test('current and historical LED illumination and complete orbit preserve dark faces',async({page})=>{
 await open(page);const results=[]
 for(const historical of [false,true]){await page.evaluate(async historical=>{const h=(window as any).depthHarness;h.fixture(historical);await h.frame()},historical)
 for(const on of [false,true]){const lit=await page.evaluate(async on=>{const h=(window as any).depthHarness;const lit=h.setOn(on);await h.frame();return lit},on);if(on)expect(lit).toBeGreaterThan(0);else expect(lit).toBe(0)
 for(const azimuth of [0,90,180,270,360]){const result=await measure(page,'DISPLAY',30,azimuth,azimuth===90?8:azimuth===180?90:35);console.log(JSON.stringify({historical,on,lit,azimuth,leaks:result.leaks}));expect(result.leaks.tested).toBeGreaterThan(10);expect(result.leaks.changed).toBe(0);results.push({historical,on,lit,azimuth,...result})}
 await page.screenshot({path:resolve(directory,`led-${historical?'historical':'current'}-${on?'on':'off'}.png`)})
 }}await writeFile(resolve(directory,'led-orbit-illumination.json'),JSON.stringify(results,null,2))
})

for(const historical of [false,true])for(const on of [false,true])for(const id of displays){
 const matrix=historical?'historical':'current',illumination=on?'on':'off'
 test(`glyphs and decimal points occlude dark faces (${matrix}, ${illumination}) ${id}`,async({page})=>{
  await open(page)
  await page.evaluate(async({historical,on})=>{
   const h=(window as any).depthHarness
   h.fixture(historical)
   await h.frame()
   h.setOn(on)
   await h.frame()
  },{historical,on})
  const results=[]
  try{
   for(const distance of [3,30]){
    const result=await measureGlyphPose(page,id,distance)
    results.push({historical,on,id,distance,...result})
    console.log(JSON.stringify({historical,on,id,distance,dpr:result.metadata.dpr,...result.leaks,timing:result.profile}))
    expect.soft(result.leaks.tested).toBeGreaterThan(10)
    expect.soft(result.leaks.changed).toBe(0)
   }
  }finally{
   await writeFile(resolve(directory,`glyph-decimal-point-${matrix}-${illumination}-${id}.json`),JSON.stringify(results,null,2))
  }
 })
}
test('offscreen CLOCK label near the eye does not collapse precision for visible display',async({page})=>{
 await open(page);await measure(page,'DISPLAY',30)
 const result=await page.evaluate(async()=>{const h=(window as any).depthHarness,c=h.manager.camera;const position=c.position.clone().add(c.position.clone().set(100,0,-.001).applyQuaternion(c.quaternion));const graph={...h.metadata().graph,modules:[...h.metadata().graph.modules,{id:'CLOCK_NEAR_EYE',type:'CLOCK',position:{x:position.x,y:position.y,z:position.z}}]};h.setGraph(graph);await h.frame();return{metadata:h.metadata(),leaks:await h.leaks('DISPLAY')}})
 expect(result.metadata.near).toBeGreaterThan(1);expect(result.leaks.changed).toBe(0);await writeFile(resolve(directory,'offscreen-clock.json'),JSON.stringify(result,null,2))
})
