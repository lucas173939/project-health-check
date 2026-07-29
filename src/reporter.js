const fs = require("fs");
const path = require("path");
const { formatBytes } = require("./analyzer");
const { saveReport } = require("./storage");

function generateReport(analysis, projectPath) {
  const timestamp = new Date(analysis.timestamp);
  const dateStr = timestamp.toLocaleString("pt-BR");
  const filenameTimestamp = timestamp
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, -5);

  const reportsDir = path.join(projectPath, "health-reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `report-${filenameTimestamp}.html`);

  // Calcular score de saúde
  const healthScore = calculateHealthScore(analysis);

  // Gerar tabela de dependências
  const dependenciesTable = generateDependenciesTable(analysis);

  // Gerar estatísticas
  const stats = {
    upToDate: analysis.dependencies.length - analysis.outdated.length,
    outdated: analysis.outdated.length,
    vulnerabilities: analysis.vulnerabilities.total,
  };

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Health Check - ${analysis.projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .date {
      opacity: 0.9;
      font-size: 0.9em;
    }
    
    main {
      padding: 40px;
    }
    
    .score-section {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 40px;
      margin-bottom: 40px;
      align-items: center;
    }
    
    .score-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .score-number {
      font-size: 4em;
      font-weight: bold;
      color: ${healthScore >= 70 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444"};
      margin: 20px 0;
    }
    
    .score-label {
      font-size: 1.2em;
      color: #6b7280;
      margin-bottom: 10px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .stat-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }
    
    .stat-label {
      color: #6b7280;
      margin-top: 8px;
      font-size: 0.9em;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    h2 {
      color: #1f2937;
      margin-bottom: 20px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    tr:hover {
      background: #f9fafb;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 600;
    }
    
    .badge-prod {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .badge-dev {
      background: #f3e8ff;
      color: #6b21a8;
    }
    
    .badge-ok {
      background: #dcfce7;
      color: #166534;
    }
    
    .badge-outdated {
      background: #fef3c7;
      color: #b45309;
    }
    
    .vulnerability-badge {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 6px;
      margin-right: 10px;
      font-weight: 600;
    }
    
    .vulnerability-critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .vulnerability-high {
      background: #fecaca;
      color: #7c2d12;
    }
    
    .vulnerability-moderate {
      background: #fef3c7;
      color: #78350f;
    }
    
    .info-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    
    footer {
      background: #f3f4f6;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 0.85em;
    }
    
    @media (max-width: 768px) {
      .score-section {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      table {
        font-size: 0.9em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Project Health Check</h1>
      <div class="date">${dateStr}</div>
    </header>
    
    <main>
      <section class="score-section">
        <div class="score-box">
          <div class="score-label">Saúde do Projeto</div>
          <div class="score-number">${healthScore}</div>
          <div class="score-label">/100</div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${stats.upToDate}</div>
            <div class="stat-label">Dependências Atualizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.outdated}</div>
            <div class="stat-label">Desatualizadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.vulnerabilities}</div>
            <div class="stat-label">Vulnerabilidades</div>
          </div>
        </div>
      </section>
      
      <section class="section">
        <h2>🔒 Vulnerabilidades</h2>
        <div>
          <span class="vulnerability-badge vulnerability-critical">
            🔴 Críticas: ${analysis.vulnerabilities.critical}
          </span>
          <span class="vulnerability-badge vulnerability-high">
            🟠 Altas: ${analysis.vulnerabilities.high}
          </span>
          <span class="vulnerability-badge vulnerability-moderate">
            🟡 Moderadas: ${analysis.vulnerabilities.moderate}
          </span>
        </div>
        ${
          analysis.vulnerabilities.critical > 0
            ? '<div class="info-box">⚠️ Existem vulnerabilidades críticas! Execute <code>npm audit fix</code> para tentar corrigir.</div>'
            : ""
        }
      </section>
      
      <section class="section">
        <h2>🧪 Testes</h2>
        ${
          analysis.hasTests
            ? `<div class="info-box">✅ Testes detectados${analysis.testFramework ? ` (${analysis.testFramework})` : ""}</div>`
            : '<div class="info-box">⚠️ Nenhum teste detectado. Considere adicionar testes ao seu projeto.</div>'
        }
      </section>
      
      <section class="section">
        <h2>📦 Dependências (${analysis.totalDependencies})</h2>
        ${
          analysis.outdated.length > 0
            ? `<div class="info-box">⚠️ ${analysis.outdated.length} dependência(s) podem ser atualizada(s)</div>`
            : '<div class="info-box">✅ Todas as dependências estão atualizadas!</div>'
        }
        
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Versão Instalada</th>
              <th>Versão Disponível</th>
              <th>Tipo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dependenciesTable}
          </tbody>
        </table>
      </section>
      
      <section class="section">
        <h2>ℹ️ Informações do Projeto</h2>
        <table>
          <tr>
            <td><strong>Nome</strong></td>
            <td>${analysis.projectName}</td>
          </tr>
          <tr>
            <td><strong>Versão</strong></td>
            <td>${analysis.packageJson.version || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Descrição</strong></td>
            <td>${analysis.packageJson.description || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>node_modules Size</strong></td>
            <td>${formatBytes(analysis.nodeModulesSize)}</td>
          </tr>
          <tr>
            <td><strong>Data da Análise</strong></td>
            <td>${dateStr}</td>
          </tr>
        </table>
      </section>
    </main>
    
    <footer>
      <p>Generated by Project Health Check CLI • ${dateStr}</p>
    </footer>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(reportPath, html, "utf8");
  saveReport(analysis, projectPath);

  return reportPath;
}

function generateDependenciesTable(analysis) {
  const outdatedNames = new Set(analysis.outdated.map((o) => o.name));

  return analysis.dependencies
    .map((dep) => {
      const isOutdated = outdatedNames.has(dep.name);
      const latestVersion = analysis.outdated.find(
        (o) => o.name === dep.name
      )?.latestVersion;

      return `
    <tr>
      <td>${dep.name}</td>
      <td>${dep.installedVersion}</td>
      <td>${isOutdated && latestVersion ? latestVersion : "✓"}</td>
      <td><span class="badge ${dep.type === "prod" ? "badge-prod" : "badge-dev"}">${dep.type}</span></td>
      <td>
        ${
          isOutdated
            ? '<span class="badge badge-outdated">Desatualizada</span>'
            : '<span class="badge badge-ok">Atualizada</span>'
        }
      </td>
    </tr>
    `;
    })
    .join("");
}

function calculateHealthScore(analysis) {
  let score = 100;

  // Descontar por dependências desatualizadas
  score -= Math.min(analysis.outdated.length * 5, 30);

  // Descontar por vulnerabilidades
  score -= analysis.vulnerabilities.critical * 15;
  score -= analysis.vulnerabilities.high * 10;
  score -= analysis.vulnerabilities.moderate * 3;

  // Descontar se não tem testes
  if (!analysis.hasTests) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

module.exports = { generateReport };
