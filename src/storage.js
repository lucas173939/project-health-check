const fs = require("fs");
const path = require("path");

const HISTORY_FILE = "health-reports/history.json";

function getHistoryPath(projectPath) {
  return path.join(projectPath, HISTORY_FILE);
}

function saveReport(analysis, projectPath) {
  const historyPath = getHistoryPath(projectPath);
  const dir = path.dirname(historyPath);

  // Criar diretório se não existir
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Ler histórico anterior
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    } catch (err) {
      history = [];
    }
  }

  // Adicionar novo relatório
  const entry = {
    timestamp: analysis.timestamp,
    projectName: analysis.projectName,
    totalDependencies: analysis.totalDependencies,
    outdated: analysis.outdated.length,
    vulnerabilities: analysis.vulnerabilities.total,
    critical: analysis.vulnerabilities.critical,
    high: analysis.vulnerabilities.high,
    hasTests: analysis.hasTests,
  };

  history.push(entry);

  // Manter apenas os últimos 100 relatórios
  if (history.length > 100) {
    history = history.slice(-100);
  }

  // Salvar atualizado
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8");
}

function getHistory(projectPath) {
  const historyPath = getHistoryPath(projectPath);

  if (!fs.existsSync(historyPath)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(historyPath, "utf8"));
  } catch (err) {
    return [];
  }
}

function loadReports(projectPath) {
  const reportsDir = path.join(projectPath, "health-reports");

  if (!fs.existsSync(reportsDir)) {
    return [];
  }

  return fs
    .readdirSync(reportsDir)
    .filter((file) => file.startsWith("report-") && file.endsWith(".html"))
    .sort()
    .reverse();
}

module.exports = { saveReport, getHistory, loadReports };
