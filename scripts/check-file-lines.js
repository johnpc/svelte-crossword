// Gate: every authored source file (components + logic, tests exempt) stays
// under MAX_LINES so components stay thin and logic stays in small helpers.
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const MAX_LINES = 150;
const ROOTS = ['src', 'amplify/function/generate-puzzle'];
const EXTENSIONS = ['.svelte', '.ts', '.js'];

const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (name === 'node_modules') return [];
		return statSync(path).isDirectory() ? walk(path) : [path];
	});

const isSource = (path) =>
	EXTENSIONS.some((ext) => path.endsWith(ext)) && !/\.(test|spec)\./.test(path);

const failures = ROOTS.flatMap(walk)
	.filter(isSource)
	.map((path) => ({ path, lines: readFileSync(path, 'utf-8').split('\n').length }))
	.filter(({ lines }) => lines > MAX_LINES);

if (failures.length) {
	for (const { path, lines } of failures)
		console.error(`FAIL: ${path} (${lines} lines, max ${MAX_LINES})`);
	process.exit(1);
}
console.log(`All files within ${MAX_LINES}-line limit`);
