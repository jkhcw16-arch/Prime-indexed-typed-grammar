import type { Bridge, ExponentVector, Invariant, Trajectory } from "./types.js";
import { add, eq, sub } from "./lattice.js";
import { reduce } from "./trajectory.js";

export type WorkflowStage = "encode"|"type"|"classify"|"transform"|"validate"|"record"|"reduce"|"decode";
export type WorkflowErrorCode = "ENCODING_ERROR"|"TYPE_ERROR"|"CLASSIFICATION_ERROR"|"BRIDGE_ERROR"|"INVARIANT_VIOLATION"|"REDUCTION_ERROR"|"DECODE_ERROR";
export type WorkflowError = { code: WorkflowErrorCode; stage: WorkflowStage; message: string; cause?: unknown };
export type WorkflowResult<E> =
  | { ok: true; entity: E; trajectory: Trajectory; displacement: ExponentVector; effects: ReadonlySet<string>; stages: readonly WorkflowStage[] }
  | { ok: false; error: WorkflowError; trajectory: Trajectory | null; stages: readonly WorkflowStage[] };

export type TypedClassifier<S> = { role: string; accepts: (state:S)=>boolean; effect?: string };
export type TypedTransform<S> = { name: string; target: string; apply: (state:S)=>S; effect?: string };

export type WorkflowDefinition<E,S> = {
  encode: (entity:E)=>S;
  typecheck: (state:S)=>boolean;
  classify: (state:S)=>TypedClassifier<S>|null;
  transform: (state:S, classifier:TypedClassifier<S>)=>TypedTransform<S>|null;
  coordinates: (state:S)=>ExponentVector;
  stateId: (state:S)=>string;
  invariants?: readonly Invariant<S>[];
  decode: (state:S)=>E;
};

const failure = <E>(code:WorkflowErrorCode, stage:WorkflowStage, message:string, stages:WorkflowStage[], trajectory:Trajectory|null, cause?:unknown):WorkflowResult<E> =>
  ({ok:false,error:{code,stage,message,cause},trajectory,stages});

export function runWorkflow<E,S>(entity:E, def:WorkflowDefinition<E,S>):WorkflowResult<E> {
  const stages:WorkflowStage[]=[]; let trajectory:Trajectory|null=null;
  let before:S;
  try { stages.push("encode"); before=def.encode(entity); } catch(cause) { return failure("ENCODING_ERROR","encode","Entity could not be encoded",stages,trajectory,cause); }
  stages.push("type");
  if (!def.typecheck(before)) return failure("TYPE_ERROR","type","Encoded state failed the typing judgment",stages,trajectory);
  stages.push("classify");
  const classifier=def.classify(before);
  if (!classifier || !classifier.accepts(before)) return failure("CLASSIFICATION_ERROR","classify","No admissible classifier accepted the state",stages,trajectory);
  stages.push("transform");
  const operator=def.transform(before,classifier);
  if (!operator) return failure("BRIDGE_ERROR","transform","No composable transformation was produced",stages,trajectory);
  let after:S;
  try { after=operator.apply(before); } catch(cause) { return failure("BRIDGE_ERROR","transform","Transformation failed",stages,trajectory,cause); }
  const source=def.stateId(before), target=def.stateId(after);
  if (!source || !target) return failure("BRIDGE_ERROR","transform","Bridge endpoints must be non-empty",stages,trajectory);
  stages.push("validate");
  const violated=(def.invariants??[]).find(i=>!i.holds(after));
  if (violated) return failure("INVARIANT_VIOLATION","validate",`Invariant failed: ${violated.mode}`,stages,trajectory);
  const displacement=sub(def.coordinates(after),def.coordinates(before));
  const bridge:Bridge={source,target,displacement};
  stages.push("record"); trajectory={source,target,bridges:[bridge]};
  stages.push("reduce");
  const net=reduce(trajectory);
  if (!eq(net,displacement)) return failure("REDUCTION_ERROR","reduce","Trajectory reduction disagrees with bridge displacement",stages,trajectory);
  stages.push("decode");
  let output:E;
  try { output=def.decode(after); } catch(cause) { return failure("DECODE_ERROR","decode","Reduced state could not be decoded",stages,trajectory,cause); }
  const effects=new Set<string>(); if(classifier.effect)effects.add(classifier.effect); if(operator.effect)effects.add(operator.effect);
  return {ok:true,entity:output,trajectory,displacement:net,effects,stages};
}

export const vectorToObject=(v:ExponentVector)=>Object.fromEntries([...v].sort((a,b)=>a[0]<b[0]?-1:1).map(([p,e])=>[p.toString(),e.toString()]));
export const applyDisplacement=(state:ExponentVector,d:ExponentVector)=>add(state,d);
