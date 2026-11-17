import type {Bridge,ExponentVector,Trajectory} from "./types.js";
import {add,eq,neg,zero} from "./lattice.js";
export const identityBridge=<X>(x:X):Bridge<X,X>=>({source:x,target:x,displacement:new Map()});
export function compose<X,Y,Z>(a:Bridge<X,Y>,b:Bridge<Y,Z>):Bridge<X,Z>{if(a.target!==b.source)throw new Error("Bridge endpoints do not compose");return {source:a.source,target:b.target,displacement:add(a.displacement,b.displacement)}}
export const inverse=<X,Y>(b:Bridge<X,Y>):Bridge<Y,X>=>({source:b.target,target:b.source,displacement:neg(b.displacement)});
export function reduce(t:Trajectory):ExponentVector{return t.bridges.reduce<ExponentVector>((v,b)=>add(v,b.displacement),new Map<bigint,bigint>())}
export const equivalent=(a:Trajectory,b:Trajectory)=>a.source===b.source&&a.target===b.target&&eq(reduce(a),reduce(b));
export const kernel=(t:Trajectory)=>t.source===t.target&&zero(reduce(t));
export function inverseTrajectory(t:Trajectory):Trajectory{return {source:t.target,target:t.source,bridges:[...t.bridges].reverse().map(inverse)}}
export function concat(a:Trajectory,b:Trajectory):Trajectory{if(a.target!==b.source)throw new Error("Trajectory endpoints do not compose");return {source:a.source,target:b.target,bridges:[...a.bridges,...b.bridges]}}
export const relativeLoop=(t:Trajectory,u:Trajectory)=>concat(t,inverseTrajectory(u));
export const quotientKey=(t:Trajectory)=>JSON.stringify({s:t.source,t:t.target,r:[...reduce(t)].sort((a,b)=>a[0]<b[0]?-1:1).map(([p,e])=>[p.toString(),e.toString()])});
