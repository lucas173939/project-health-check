# 🏥 Project Health Check

Uma ferramenta CLI para analisar a "saúde" de projetos Node.js, verificando dependências desatualizadas, vulnerabilidades, testes e gerando relatórios HTML detalhados.

![Node](https://img.shields.io/badge/node-18%2B-green)
![npm](https://img.shields.io/badge/npm-package-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- ✅ **Análise de Dependências** — detecta pacotes desatualizados
- ✅ **Verificação de Vulnerabilidades** — integra com `npm audit`
- ✅ **Detecção de Testes** — identifica frameworks de teste (Jest, Mocha, Vitest)
- ✅ **Score de Saúde** — calcula um score 0-100 baseado em análise completa
- ✅ **Relatórios HTML** — gera relatórios visuais e interativos
- ✅ **Histórico** — mantém registro de análises anteriores
- ✅ **Comparação** — mostra evolução do projeto ao longo do tempo

## 📦 Instalação

### Global (recomendado)
```bash
npm install -g @seu-usuario/project-health-check
```

### Local (para desenvolvimento)
```bash
git clone https://github.com/seu-usuario/project-health-check.git
cd project-health-check
npm install
npm link
```

## 🎯 Uso

### Analisar um projeto
```bash
project-health-check analyze [caminho]
```

Exemplos:
```bash
# Analisa o projeto atual
project-health-check analyze

# Analisa um projeto específico
project-health-check analyze ~/my-project

# Resultado: gera um relatório HTML em health-reports/
```

### Ver histórico de análises
```bash
project-health-check history [caminho]
```

### Listar todos os relatórios
```bash
project-health-check reports [caminho]
```

## 📊 O que é analisado?

### 1. Dependências Desatualizadas
- Verifica `package.json` e compara com versões disponíveis
- Separa dependências de produção vs desenvolvimento
- Exibe versão atual e versão mais recente

### 2. Vulnerabilidades de Segurança
- Executa `npm audit` internamente
- Categor iza por severidade: crítica, alta, moderada, baixa
- Sugere `npm audit fix` quando necessário

### 3. Cobertura de Testes
- Detecta pasta `test/`, `tests/` ou `__tests__`
- Identifica framework (Jest, Mocha, Vitest, Ava)
- Avisa se o projeto não tem testes

### 4. Tamanho do Projeto
- Calcula o tamanho de `node_modules`
- Útil para identificar dependências pesadas

### 5. Score de Saúde
Baseado em:
- Dependências atualizadas (70%)
- Ausência de vulnerabilidades (20%)
- Presença de testes (10%)

## 📈 Relatório HTML

O relatório gerado inclui:

- **Dashboard Visual** — score de saúde em destaque
- **Estatísticas** — número de dependências atualizadas, desatualizadas e vulnerabilidades
- **Tabela Detalhada** — lista completa de cada dependência com status
- **Histórico** — gráfico com evolução do score ao longo do tempo
- **Informações do Projeto** — nome, versão, descrição, data da análise

Os relatórios são salvos em `health-reports/report-[timestamp].html`

## 📁 Estrutura de Diretórios

```
seu-projeto/
├── src/
├── test/
├── package.json
└── health-reports/          ← criado automaticamente
    ├── report-2024-01-15T10-30-00.html
    ├── report-2024-01-16T14-20-00.html
    └── history.json         ← histórico de análises
```

## 🔧 Desenvolvimento

### Clonar e instalar
```bash
git clone https://github.com/seu-usuario/project-health-check.git
cd project-health-check
npm install
npm link
```

### Testar localmente
```bash
project-health-check analyze ./
```

### Estrutura do código
```
project-health-check/
├── bin/cli.js               (ponto de entrada)
├── src/
│   ├── analyzer.js          (análise de dependências)
│   ├── reporter.js          (geração de HTML)
│   └── storage.js           (histórico)
└── package.json
```

## 🚀 Publicar no npm

1. Crie conta em [npmjs.com](https://npmjs.com)
2. Login local: `npm login`
3. Publique: `npm publish`
4. Seu pacote estará disponível em `npmjs.com/package/@seu-usuario/project-health-check`

## 📋 Exemplos Reais

### Analisar seu próprio projeto
```bash
cd ~/meu-projeto
project-health-check analyze
```

Output:
```
📊 Project Health Check

Analisando: /Users/lucas/meu-projeto

━━━ RESUMO ━━━
Total de dependências: 24
Vulnerabilidades: 1 críticas/altas
Dependências desatualizadas: 3
Testes detectados: ✓

✅ Relatório gerado: /Users/lucas/meu-projeto/health-reports/report-2024-01-15T10-30-00.html
```

### Rodar em CI/CD (exemplo com GitHub Actions)
```yaml
name: Health Check
on: [push]
jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install -g @seu-usuario/project-health-check
      - run: project-health-check analyze
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: health-reports
          path: health-reports/
```

## 🎨 Screenshots

![Health Check Dashboard](./screenshots/dashboard.png)
![Relatório HTML](./screenshots/report.png)
![Histórico](./screenshots/history.png)

## 🚧 Roadmap

- [ ] Integração com Dependabot
- [ ] Exportar relatórios em JSON/CSV
- [ ] Suporte para projetos Python/Ruby
- [ ] Dashboard web com histórico visual
- [ ] Notificações no Slack/Discord
- [ ] Testes automatizados mais robustos
- [ ] Análise de performance

## 📝 Licença

MIT

## 👨‍💻 Autor

Desenvolvido por [lucas fernando da silva santos ](https://github.com/lucas173939)

## 💬 Contribuições

Feedback, sugestões e pull requests são bem-vindos!

- 🐛 Encontrou um bug? Abra uma [issue](https://github.com/seu-usuario/project-health-check/issues)
- 💡 Tem uma ideia? Discuta no [discussions](https://github.com/seu-usuario/project-health-check/discussions)

---

**Feito com ❤️ por um desenvolvedor Node.js apaixonado**
