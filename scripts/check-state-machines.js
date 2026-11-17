// Gate: docs/state-machines.md stays honest.
//  1. Every catalogued machine's owner and test files exist and the owner
//     carries an `@state-machine <id>` marker.
//  2. Every `@state-machine <id>` marker in src/ names a catalogued id.
//  3. Patterns the catalogue retired never come back: reading a Svelte
//     component's internals (`$$.ctx`) and side effects in markup (`{void …}`).
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const CATALOG = 'docs/state-machines.md';
const MARKER = /@state-machine\s+([a-z0-9-]+)/g;
const BANNED = [
	{ pattern: /\$\$\??\.ctx/, why: 'reads Svelte component internals; bind to a prop instead' },
	{ pattern: /\{void\s/, why: 'side effect in markup; move it into the owning state machine' }
];

const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path) : [path];
	});
const sources = walk('src').filter(
	(p) => /\.(svelte|ts|js)$/.test(p) && !/\.(test|spec)\./.test(p) && !p.endsWith('.d.ts')
);

const rows = readFileSync(CATALOG, 'utf-8')
	.split('\n')
	.map((line) => line.match(/^\|\s*`([a-z0-9-]+)`\s*\|(.*)\|\s*$/))
	.filter(Boolean)
	.map(([, id, rest]) => {
		// id | machine | states | owner | tests — file paths are the backticked
		// tokens; the first one in the owner cell is THE owner, prose is allowed.
		const cells = rest.split('|');
		const paths = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
		return { id, owner: paths(cells[2])[0] ?? '', tests: paths(cells[3]) };
	});

const errors = [];
const catalogued = new Set(rows.map((r) => r.id));
if (!rows.length) errors.push(`${CATALOG}: no machine rows found (expected | \`id\` | ... | rows)`);

for (const { id, owner, tests } of rows) {
	if (!existsSync(owner)) errors.push(`${id}: owner ${owner} does not exist`);
	else if (!readFileSync(owner, 'utf-8').includes(`@state-machine ${id}`))
		errors.push(`${id}: ${owner} lacks an "@state-machine ${id}" marker`);
	if (!tests.length) errors.push(`${id}: no test files listed`);
	for (const t of tests) if (!existsSync(t)) errors.push(`${id}: test file ${t} does not exist`);
}

for (const path of sources) {
	const text = readFileSync(path, 'utf-8');
	for (const [, id] of text.matchAll(MARKER))
		if (!catalogued.has(id)) errors.push(`${path}: marker "${id}" is not a row in ${CATALOG}`);
	for (const { pattern, why } of BANNED)
		if (pattern.test(text)) errors.push(`${path}: matches ${pattern} — ${why}`);
}

if (errors.length) {
	errors.forEach((e) => console.error(`FAIL: ${e}`));
	process.exit(1);
}
console.log(
	`State-machine catalogue honest: ${rows.length} machines, markers and files all present`
);
