/** Executable bootstrap entrypoint; pure resource readers never import this file. */
import {bootstrap} from './contracts-artifacts.mjs'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2),options={manifestPath:process.env.CIRNET_CONTRACTS_ARTIFACT_MANIFEST}
    while(args.length){
      const flag=args.shift()
      if(flag==='--product'){options.product=true;continue}
      const field={'--manifest':'manifestPath','--github-env':'githubEnv'}[flag]
      if(!field)throw Error(`Unknown bootstrap option: ${flag}`)
      const value=args.shift()
      if(!value||value.startsWith('--'))throw Error(`Missing value for ${flag}`)
      options[field]=value
    }
    console.log(JSON.stringify(await bootstrap(options)))
  }catch(error){console.error(`contracts-bootstrap: ${error.message}`);process.exitCode=1}
}
