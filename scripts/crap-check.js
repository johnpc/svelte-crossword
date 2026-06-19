import { readFileSync } from 'fs';
import { resolve } from 'path';

const CRAP_THRESHOLD = 15;
const coveragePath = resolve('coverage/coverage-final.json');

let coverageData;
try {
	const raw = readFileSync(coveragePath, 'utf-8');
	coverageData = JSON.parse(raw);
} catch {
	console.error('Coverage data not found. Run `npm run test:coverage` first.');
	process.exit(1);
}

const failures = [];

for (const [filePath, fileData] of Object.entries(coverageData)) {
	// CRAP measures per-function cyclomatic complexity vs. coverage. Svelte
	// compiles a component's whole script+template into one synthetic instance
	// function, so istanbul reports compiled-template size rather than authored
	// function complexity — a false signal for this metric. We gate .svelte on
	// the coverage thresholds instead, and run CRAP over the .ts/.js logic layer
	// (which is where business logic lives and per-function complexity is real).
	if (filePath.endsWith('.svelte')) continue;

	const fnMap = fileData.fnMap || {};
	const f = fileData.f || {};
	const branchMap = fileData.branchMap || {};
	const b = fileData.b || {};

	for (const [fnId, fnMeta] of Object.entries(fnMap)) {
		const fnName = fnMeta.name || `anonymous@${fnMeta.loc?.start?.line}`;
		const fnHits = f[fnId] || 0;
		const fnCoverage = fnHits > 0 ? 1 : 0;

		let branchCount = 0;
		let coveredBranches = 0;
		for (const [branchId, branchMeta] of Object.entries(branchMap)) {
			const branchLoc = branchMeta.loc || {};
			const fnLoc = fnMeta.loc || {};
			if (
				branchLoc.start &&
				fnLoc.start &&
				branchLoc.start.line >= fnLoc.start.line &&
				branchLoc.end &&
				fnLoc.end &&
				branchLoc.end.line <= fnLoc.end.line
			) {
				const branchCounts = b[branchId] || [];
				branchCount += branchCounts.length;
				coveredBranches += branchCounts.filter((c) => c > 0).length;
			}
		}

		const complexity = 1 + branchCount;
		const coverage = branchCount > 0 ? coveredBranches / branchCount : fnCoverage;
		const crap = Math.pow(complexity, 2) * Math.pow(1 - coverage, 3) + complexity;

		if (crap > CRAP_THRESHOLD) {
			const relativePath = filePath.replace(process.cwd() + '/', '');
			failures.push({
				file: relativePath,
				function: fnName,
				crap: crap.toFixed(2),
				complexity,
				coverage: (coverage * 100).toFixed(1)
			});
		}
	}
}

if (failures.length > 0) {
	console.error(`\nCRAP Score Violations (threshold: ${CRAP_THRESHOLD}):\n`);
	console.error(
		'File'.padEnd(50) +
			'Function'.padEnd(30) +
			'CRAP'.padEnd(10) +
			'Complexity'.padEnd(12) +
			'Coverage'
	);
	console.error('-'.repeat(110));
	for (const f of failures) {
		console.error(
			f.file.padEnd(50) +
				f.function.padEnd(30) +
				f.crap.padEnd(10) +
				String(f.complexity).padEnd(12) +
				`${f.coverage}%`
		);
	}
	console.error(`\n${failures.length} function(s) exceed CRAP threshold of ${CRAP_THRESHOLD}`);
	process.exit(1);
} else {
	console.log(`All functions pass CRAP score check (threshold: ${CRAP_THRESHOLD})`);
}
