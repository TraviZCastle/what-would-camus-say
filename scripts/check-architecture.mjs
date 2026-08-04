import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, 'package.json'), 'utf8'),
);

const bannedDependencyPatterns = [
  /^openai$/,
  /^@ai-sdk\//,
  /anthropic/,
  /langchain/,
  /llamaindex/,
  /ollama/,
  /transformers/,
];

const dependencyNames = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
});
const bannedDependencies = dependencyNames.filter((name) =>
  bannedDependencyPatterns.some((pattern) => pattern.test(name)),
);

const sourceRoot = path.join(projectRoot, 'src');
const bannedPathPatterns = [/(^|\/)api(\/|$)/i, /(^|\/)server-actions?(\/|\.|$)/i];
const bannedSourcePatterns = [
  { label: 'AI SDK import', pattern: /from\s+['"](?:openai|@ai-sdk\/|@anthropic-ai\/)/ },
  { label: 'server action directive', pattern: /['"]use server['"]/ },
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolutePath)));
    if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

const sourceFiles = await walk(sourceRoot);
const bannedPaths = sourceFiles
  .map((file) => path.relative(projectRoot, file))
  .filter((file) => bannedPathPatterns.some((pattern) => pattern.test(file)));
const bannedSources = [];

for (const file of sourceFiles.filter((candidate) =>
  /\.(?:js|jsx|ts|tsx)$/.test(candidate),
)) {
  const contents = await readFile(file, 'utf8');
  for (const rule of bannedSourcePatterns) {
    if (rule.pattern.test(contents)) {
      bannedSources.push(`${path.relative(projectRoot, file)}: ${rule.label}`);
    }
  }
}

const errors = [
  ...bannedDependencies.map((name) => `禁止的运行时依赖：${name}`),
  ...bannedPaths.map((file) => `禁止的 API/server-action 路径：${file}`),
  ...bannedSources.map((finding) => `禁止的源代码模式：${finding}`),
];

if (!String(packageJson.scripts?.build).includes('content:validate:production')) {
  errors.push('生产 build 必须先运行 content:validate:production');
}

if (!String(packageJson.scripts?.build).includes('build:index')) {
  errors.push('生产 build 必须生成浏览器只读检索索引');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('架构检查通过：未发现 API route、server action 或 AI SDK。');
