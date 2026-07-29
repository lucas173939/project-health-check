const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const chalk = require("chalk");
const ora = require("ora");

const execAsync = promisify(exec);

async function analyzeProject(projectPath) {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const spinner = ora("Analisando dependências...").start();

  // 1. Listar dependências
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const dependencies = Object.entries(allDeps).map(([name, version]) => ({
    name,
    installedVersion: version,
    latestVersion: null,
    isOutdated: false,
    type: packageJson.dependencies[name] ? "prod" : "dev",
  }));

  // 2. Verificar versões desatualizadas
  spinner.text = "Verificando versões desatualizadas...";
  let outdated = [];

  try {
    const { stdout } = await execAsync(
      `cd "${projectPath}" && npm outdated --json 2>/dev/null`,
      { maxBuffer: 1024 * 1024 * 10 }
    );

    if (stdout) {
      const outdatedData = JSON.parse(stdout);
      outdated = Object.entries(outdatedData).map(([name, data]) => ({
        name,
        installedVersion: data.current,
        latestVersion: data.latest,
        type: packageJson.dependencies[name] ? "prod" : "dev",
      }));
    }
  } catch (err) {
    // npm outdated pode falhar, é ok
  }

  // 3. Vulnerabilidades (npm audit)
  spinner.text = "Verificando vulnerabilidades...";
  let vulnerabilities = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    total: 0,
  };

  try {
    const { stdout } = await execAsync(
      `cd "${projectPath}" && npm audit --json 2>/dev/null`,
      { maxBuffer: 1024 * 1024 * 10 }
    );

    if (stdout) {
      const auditData = JSON.parse(stdout);
      const metadata = auditData.metadata || {};
      vulnerabilities = {
        critical: metadata.vulnerabilities?.critical || 0,
        high: metadata.vulnerabilities?.high || 0,
        moderate: metadata.vulnerabilities?.moderate || 0,
        low: metadata.vulnerabilities?.low || 0,
        total: auditData.vulnerabilities ? Object.keys(auditData.vulnerabilities).length : 0,
      };
    }
  } catch (err) {
    // npm audit pode falhar, é ok
  }

  // 4. Verificar testes
  spinner.text = "Verificando testes...";
  const hasTests =
    fs.existsSync(path.join(projectPath, "test")) ||
    fs.existsSync(path.join(projectPath, "tests")) ||
    fs.existsSync(path.join(projectPath, "__tests__")) ||
    packageJson.scripts?.test;

  const testFramework = Object.keys(packageJson.devDependencies || {})
    .filter((dep) => ["jest", "mocha", "vitest", "ava"].includes(dep))
    .join(", ");

  // 5. Verificar size
  spinner.text = "Calculando tamanho do projeto...";
  const nodeModulesSize = getDirectorySize(
    path.join(projectPath, "node_modules")
  );

  spinner.succeed("Análise concluída!");

  return {
    projectName: packageJson.name || path.basename(projectPath),
    timestamp: new Date().toISOString(),
    totalDependencies: dependencies.length,
    dependencies,
    outdated,
    vulnerabilities,
    hasTests,
    testFramework,
    nodeModulesSize,
    packageJson: {
      version: packageJson.version,
      description: packageJson.description,
      author: packageJson.author,
    },
  };
}

function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let size = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  });

  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

module.exports = { analyzeProject, formatBytes };
