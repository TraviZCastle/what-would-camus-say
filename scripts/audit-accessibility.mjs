import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const url =
  process.argv.slice(2).find((argument) => argument !== '--') ?? 'http://127.0.0.1:4173';
const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless', '--no-sandbox'],
});

try {
  const result = await lighthouse(url, {
    port: chrome.port,
    onlyCategories: ['accessibility'],
    output: 'json',
    logLevel: 'error',
  });
  const score = Math.round((result?.lhr.categories.accessibility.score ?? 0) * 100);
  console.log(`Lighthouse Accessibility：${score}`);
  if (score < 90) process.exitCode = 1;
} finally {
  await chrome.kill();
}
