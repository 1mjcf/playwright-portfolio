#!/usr/bin/env node
// Reads a Playwright Oracle Reporter run summary (data/run.json) and appends a
// markdown table to the GitHub Actions job summary ($GITHUB_STEP_SUMMARY) so the
// key results are visible on the run page without downloading the HTML artifact.
//
// Usage: node scripts/oracle-summary.mjs <reportDir> <title> <artifactName>

import { readFileSync, appendFileSync } from 'node:fs';

const [, , reportDir, title = 'Playwright tests', artifactName] = process.argv;

if (!reportDir) {
  console.error('Usage: node scripts/oracle-summary.mjs <reportDir> <title> <artifactName>');
  process.exit(1);
}

const runPath = `${reportDir}/data/run.json`;

let run;
try {
  run = JSON.parse(readFileSync(runPath, 'utf8'));
} catch (err) {
  // A missing summary shouldn't fail the build — just note it.
  console.error(`⚠️  Oracle summary: could not read ${runPath}: ${err.message}`);
  process.exit(0);
}

const {
  totalTests = 0,
  passed = 0,
  failed = 0,
  skipped = 0,
  flaky = 0,
  duration = 0,
} = run;

const durationSecs = (Number(duration) / 1000).toFixed(1);
const status =
  failed > 0 ? '❌ Failed' : flaky > 0 ? '⚠️ Passed with flakes' : '✅ Passed';

const lines = [
  `## ${title} — ${status}`,
  '',
  '| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped | ⏱️ Duration |',
  '|------:|----------:|----------:|---------:|-----------:|------------:|',
  `| ${totalTests} | ${passed} | ${failed} | ${flaky} | ${skipped} | ${durationSecs}s |`,
  '',
];

if (artifactName) {
  lines.push(`📦 Full Oracle HTML report: download the **${artifactName}** artifact from this run.`, '');
}

const md = lines.join('\n');

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  appendFileSync(summaryFile, md + '\n');
} else {
  process.stdout.write(md + '\n');
}
