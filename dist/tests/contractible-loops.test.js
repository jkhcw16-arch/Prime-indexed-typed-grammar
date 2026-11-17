import test from "node:test";
import assert from "node:assert/strict";
import { kernel, reduce, relativeLoop, inverseTrajectory, concat } from "../src/index.js";
const v = (...xs) => new Map(xs);
test("immediate bridge reversal is a contractible kernel loop", () => {
    const t = { source: "x", target: "y", bridges: [{ source: "x", target: "y", displacement: v([2n, 2n], [3n, -1n]) }] };
    const loop = concat(t, inverseTrajectory(t));
    assert.equal(loop.source, "x");
    assert.equal(loop.target, "x");
    assert.ok(kernel(loop));
    assert.deepEqual([...reduce(loop)], []);
});
test("multi-step path followed by its inverse contracts to zero displacement", () => {
    const t = { source: "x", target: "z", bridges: [
            { source: "x", target: "y", displacement: v([2n, 1n]) },
            { source: "y", target: "z", displacement: v([3n, 2n], [5n, -1n]) }
        ] };
    const loop = concat(t, inverseTrajectory(t));
    assert.ok(kernel(loop));
    assert.deepEqual([...reduce(loop)], []);
});
test("relative loop of net-equivalent trajectories lies in kernel", () => {
    const a = { source: "x", target: "z", bridges: [
            { source: "x", target: "y", displacement: v([2n, 1n]) },
            { source: "y", target: "z", displacement: v([3n, 1n]) }
        ] };
    const b = { source: "x", target: "z", bridges: [
            { source: "x", target: "z", displacement: v([2n, 1n], [3n, 1n]) }
        ] };
    assert.ok(kernel(relativeLoop(a, b)));
});
test("closed but nonzero claimed displacement is not a kernel loop", () => {
    const bad = { source: "x", target: "x", bridges: [{ source: "x", target: "x", displacement: v([7n, 1n]) }] };
    assert.equal(kernel(bad), false);
});
test("open zero-displacement trajectory is not classified as a loop", () => {
    const bad = { source: "x", target: "y", bridges: [{ source: "x", target: "y", displacement: new Map() }] };
    assert.equal(kernel(bad), false);
});
