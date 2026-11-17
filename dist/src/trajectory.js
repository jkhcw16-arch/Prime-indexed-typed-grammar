import { add, eq, neg, zero } from "./lattice.js";
export const identityBridge = (x) => ({ source: x, target: x, displacement: new Map() });
export function compose(a, b) { if (a.target !== b.source)
    throw new Error("Bridge endpoints do not compose"); return { source: a.source, target: b.target, displacement: add(a.displacement, b.displacement) }; }
export const inverse = (b) => ({ source: b.target, target: b.source, displacement: neg(b.displacement) });
export function reduce(t) { return t.bridges.reduce((v, b) => add(v, b.displacement), new Map()); }
export const equivalent = (a, b) => a.source === b.source && a.target === b.target && eq(reduce(a), reduce(b));
export const kernel = (t) => t.source === t.target && zero(reduce(t));
export function inverseTrajectory(t) { return { source: t.target, target: t.source, bridges: [...t.bridges].reverse().map(inverse) }; }
export function concat(a, b) { if (a.target !== b.source)
    throw new Error("Trajectory endpoints do not compose"); return { source: a.source, target: b.target, bridges: [...a.bridges, ...b.bridges] }; }
export const relativeLoop = (t, u) => concat(t, inverseTrajectory(u));
export const quotientKey = (t) => JSON.stringify({ s: t.source, t: t.target, r: [...reduce(t)].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([p, e]) => [p.toString(), e.toString()]) });
