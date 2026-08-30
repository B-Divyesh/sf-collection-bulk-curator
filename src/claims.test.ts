import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

interface Claim { id: string; claim: string; test: string; sandbox: string }

test('keeps every published claim mapped to one runnable browser regression', async () => {
  const claims = JSON.parse(await readFile(resolve('.factory/claims.json'), 'utf8')) as Claim[];
  const browserTests = await readFile(resolve('tests/e2e/claims.spec.ts'), 'utf8');

  expect(claims.length).toBeGreaterThan(0);
  expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
  for (const claim of claims) {
    expect(claim.claim).not.toHaveLength(0);
    expect(claim.sandbox).not.toHaveLength(0);
    expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    expect(browserTests.match(new RegExp(`@claim:${claim.id}\\b`, 'g'))).toHaveLength(1);
  }
});
