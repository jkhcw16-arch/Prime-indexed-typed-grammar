import test from "node:test";
import assert from "node:assert/strict";
import { add, transition, compose, inverse, equivalent, kernel, relativeLoop } from "../src/index.js";
const v = (...xs) => new Map(xs);
test("lattice addition and transition", () => { assert.deepEqual([...add(v([2n, 1n]), v([2n, 2n], [3n, 1n]))], [[2n, 3n], [3n, 1n]]); assert.deepEqual([...transition(v([2n, 4n]), v([2n, 1n]))], [[2n, -3n]]); });
test("bridge composition is invertible", () => { const b = { source: "x", target: "y", displacement: v([2n, 2n], [3n, -1n]) }; const r = compose(b, inverse(b)); assert.equal(r.source, "x"); assert.equal(r.target, "x"); assert.deepEqual([...r.displacement], []); });
test("quotient equivalence and kernel relative loop", () => { const a = { source: "x", target: "z", bridges: [{ source: "x", target: "y", displacement: v([2n, 1n]) }, { source: "y", target: "z", displacement: v([3n, 1n]) }] }; const b = { source: "x", target: "z", bridges: [{ source: "x", target: "z", displacement: v([2n, 1n], [3n, 1n]) }] }; assert.ok(equivalent(a, b)); assert.ok(kernel(relativeLoop(a, b))); });
