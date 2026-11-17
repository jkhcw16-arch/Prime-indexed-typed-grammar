const keys = (a, b) => new Set([...a.keys(), ...(b ? [...b.keys()] : [])]);
const clean = (m) => { for (const [p, e] of m)
    if (e === 0n)
        m.delete(p); return m; };
export const add = (a, b) => clean(new Map([...keys(a, b)].map(p => [p, (a.get(p) ?? 0n) + (b.get(p) ?? 0n)])));
export const sub = (a, b) => clean(new Map([...keys(a, b)].map(p => [p, (a.get(p) ?? 0n) - (b.get(p) ?? 0n)])));
export const neg = (a) => clean(new Map([...a].map(([p, e]) => [p, -e])));
export const meet = (a, b) => clean(new Map([...keys(a, b)].map(p => [p, (a.get(p) ?? 0n) < (b.get(p) ?? 0n) ? (a.get(p) ?? 0n) : (b.get(p) ?? 0n)])));
export const join = (a, b) => clean(new Map([...keys(a, b)].map(p => [p, (a.get(p) ?? 0n) > (b.get(p) ?? 0n) ? (a.get(p) ?? 0n) : (b.get(p) ?? 0n)])));
export const eq = (a, b) => [...keys(a, b)].every(p => (a.get(p) ?? 0n) === (b.get(p) ?? 0n));
export const zero = (a) => [...a.values()].every(e => e === 0n);
export const transition = (from, to) => sub(to, from);
