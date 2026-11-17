import { runWorkflow, vectorToObject } from "./workflow.js";
import type { ExponentVector } from "./types.js";

type DemoEntity={id:string; semantic:Record<string,string>; polarity:1|-1};
type DemoState={id:string; vector:ExponentVector; polarity:1|-1};
const primes={identity:2n,semantic:3n,temporal:5n};
const fromObject=(x:Record<string,string>):ExponentVector=>new Map(Object.entries(x).map(([p,e])=>[BigInt(p),BigInt(e)]));
const input:DemoEntity={id:"entity-1",semantic:{"3":"2","5":"1"},polarity:1};
const result=runWorkflow(input,{
  encode:e=>({id:e.id+":0",vector:fromObject({...e.semantic,"2":"1"}),polarity:e.polarity}),
  typecheck:s=>s.vector.has(primes.identity),
  classify:()=>({role:"advance",accepts:()=>true,effect:"classified"}),
  transform:s=>({name:"semantic-step",target:s.id+":1",effect:"state-change",apply:x=>({id:x.id.replace(":0",":1"),vector:new Map([...x.vector,[primes.semantic,(x.vector.get(primes.semantic)??0n)+1n],[primes.temporal,(x.vector.get(primes.temporal)??0n)+1n]]),polarity:x.polarity})}),
  coordinates:s=>s.vector,
  stateId:s=>s.id,
  invariants:[{mode:"positive-polarity",holds:s=>s.polarity===1}],
  decode:s=>({id:s.id,semantic:Object.fromEntries([...s.vector].filter(([p])=>p!==primes.identity).map(([p,e])=>[p.toString(),e.toString()])),polarity:s.polarity})
});
if(!result.ok){console.error(JSON.stringify(result,null,2));process.exitCode=1}else console.log(JSON.stringify({...result,displacement:vectorToObject(result.displacement)},null,2));
