#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const { analyzeProject } = require("../src/analyzer");
const { generateReport } = require("../src/reporter");
const { getHistory, loadReports } = require("../src/storage");
const path = require("path");
const fs = require("fs");

program
  .name("project-health-check")
  .description("Analisa a saúde de projetos Node.js")
  .version("1.0.0");

program
  .command("analyze [projectPath]")
  .description("Analisa a saúde de um projeto")
  .action(async (projectPath = ".") => {
    try {
      const fullPath = path.resolve(projectPath);

      if (!fs.existsSync(path.join(fullPath, "package.json"))) {
        console.error(
          chalk.red("❌ Erro: package.json não encontrado em " + fullPath)
        );
        process.exit(1);
      }

      console.log(chalk.blue.bold("\n📊 Project Health Check\n"));
      console.log(chalk.gray(`Analisando: ${fullPath}\n`));

      const analysis = await analyzeProject(fullPath);

      // Exibir resumo no terminal
      console.log(chalk.bold("━━━ RESUMO ━━━"));
      console.log(
        `Total de dependências: ${chalk.cyan(analysis.dependencies.length)}`
      );
      console.log(
        `Vulnerabilidades: ${chalk.red(analysis.vulnerabilities.critical + analysis.vulnerabilities.high)} críticas/altas`
      );
      console.log(
        `Dependências desatualizadas: ${chalk.yellow(analysis.outdated.length)}`
      );
      console.log(
        `Testes detectados: ${analysis.hasTests ? chalk.green("✓") : chalk.gray("✗")}`
      );

      // Gerar e salvar relatório
      const reportPath = generateReport(analysis, fullPath);
      console.log(
        chalk.green(`\n✅ Relatório gerado: ${chalk.underline(reportPath)}\n`)
      );

      // Abrir no navegador (opcional, comentado por padrão)
      // require('child_process').exec(`start "${reportPath}"`);
    } catch (error) {
      console.error(chalk.red("❌ Erro durante análise:"), error.message);
      process.exit(1);
    }
  });

program
  .command("history [projectPath]")
  .description("Mostra histórico de análises")
  .action((projectPath = ".") => {
    const fullPath = path.resolve(projectPath);
    const history = getHistory(fullPath);

    if (history.length === 0) {
      console.log(chalk.yellow("Nenhuma análise anterior encontrada."));
      return;
    }

    console.log(chalk.blue.bold("\n📈 Histórico de Análises\n"));
    history.forEach((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleString("pt-BR");
      console.log(`${index + 1}. ${date}`);
      console.log(`   Vulnerabilidades: ${entry.vulnerabilities}`);
      console.log(`   Desatualizadas: ${entry.outdated}`);
      console.log("");
    });
  });

program
  .command("reports [projectPath]")
  .description("Lista todos os relatórios gerados")
  .action((projectPath = ".") => {
    const fullPath = path.resolve(projectPath);
    const reports = loadReports(fullPath);

    if (reports.length === 0) {
      console.log(chalk.yellow("Nenhum relatório encontrado."));
      return;
    }

    console.log(chalk.blue.bold("\n📁 Relatórios Disponíveis\n"));
    reports.forEach((report) => {
      console.log(`• ${report}`);
    });
    console.log("");
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
