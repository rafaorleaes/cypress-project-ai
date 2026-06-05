# cypress-project-ai

Suite de testes E2E automatizados com Cypress para o sistema **Hub de Leitura** — uma biblioteca digital de treinamento em QA. Os testes cobrem cenários funcionais positivos, negativos e de segurança em todas as funcionalidades da aplicação.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Git](https://git-scm.com/)
- A aplicação **Hub de Leitura** rodando localmente na porta `3000`

---

## 1. Subir a aplicação alvo

Os testes dependem do **Hub de Leitura** em execução. Clone e inicie o servidor antes de rodar os testes:

```bash
git clone https://github.com/fabioaraujoqa/hub-de-leitura.git
cd hub-de-leitura
npm install
npm run db      # inicializa o banco de dados SQLite
npm start       # inicia o servidor em http://localhost:3000
```

> Verifique em `http://localhost:3000` se a aplicação está no ar antes de prosseguir.

---

## 2. Instalar o projeto de testes

```bash
git clone https://github.com/rafaorleaes/cypress-project-ai.git
cd cypress-project-ai
npm install
```

---

## 3. Configurar as credenciais

Crie o arquivo `cypress.env.json` na raiz do projeto (ele está no `.gitignore` e **nunca deve ser commitado**):

```json
{
  "ADMIN_EMAIL": "admin@biblioteca.com",
  "ADMIN_PASSWORD": "admin123",
  "USER_EMAIL": "usuario@teste.com",
  "USER_PASSWORD": "user123"
}
```

> As credenciais acima são as padrão do Hub de Leitura. Se o banco foi resetado, elas funcionarão diretamente.

---

## 4. Executar os testes

### Modo interativo (recomendado para desenvolvimento)

Abre a interface gráfica do Cypress para rodar e depurar testes individualmente:

```bash
npx cypress open
```

### Modo headless (CI/CD e execução completa)

Executa toda a suite em segundo plano e gera relatórios:

```bash
npx cypress run
```

### Rodar um arquivo específico

```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
npx cypress run --spec "cypress/e2e/seguranca.cy.js"
```

### Rodar em um navegador específico

```bash
npx cypress run --browser chrome
npx cypress run --browser firefox
```

---

## 5. Estrutura do projeto

```
cypress-project-ai/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js          # Autenticação
│   │   ├── cadastro.cy.js       # Registro de usuário
│   │   ├── catalogo.cy.js       # Catálogo de livros
│   │   ├── cesta.cy.js          # Cesta de livros
│   │   ├── checkout.cy.js       # Checkout e reserva
│   │   ├── dashboard.cy.js      # Dashboard do usuário
│   │   ├── admin.cy.js          # Painel administrativo
│   │   ├── home-contato.cy.js   # Página inicial e contato
│   │   └── seguranca.cy.js      # Testes de segurança transversais
│   └── support/
│       └── commands.js          # Custom commands reutilizáveis
├── cypress.config.js            # Configuração do Cypress
├── cypress.env.json             # Credenciais (não commitar)
└── .gitignore
```

---

## 6. Cobertura de testes

| Arquivo | Cenários | Tipos cobertos |
|---|---|---|
| `login.cy.js` | 10 | Positivo, negativo, XSS, SQL injection, força bruta |
| `cadastro.cy.js` | 11 | Positivo, negativo, senhas, duplicidade, XSS |
| `catalogo.cy.js` | 13 | Busca, filtros, paginação, grid/lista, XSS |
| `cesta.cy.js` | 7 | Autenticação, fluxo de reserva, JWT forjado |
| `checkout.cy.js` | 7 | Confirmação, cesta vazia, proteção de rotas |
| `dashboard.cy.js` | 9 | Conteúdo, token expirado, controle de acesso |
| `admin.cy.js` | 10 | CRUD livros/reservas, controle de acesso por role |
| `home-contato.cy.js` | 12 | Navegação, formulário de contato, validações |
| `seguranca.cy.js` | 15 | XSS, SQL injection, JWT adulterado, enumeração, headers |
| **Total** | **~94** | |

---

## 7. Custom commands

Definidos em `cypress/support/commands.js` e disponíveis em todos os testes:

| Comando | Descrição |
|---|---|
| `cy.loginComoAdmin()` | Autentica como administrador via API (sem passar pela UI) |
| `cy.loginComoUsuario()` | Autentica como usuário comum via API |
| `cy.fecharModalSeExistir()` | Fecha modal de guia QA caso esteja aberto |

**Exemplo de uso:**

```javascript
beforeEach(() => {
  cy.loginComoUsuario();
  cy.visit('/dashboard.html');
});
```

---

## 8. Configuração (`cypress.config.js`)

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    viewportWidth: 1366,
    viewportHeight: 768,
    chromeWebSecurity: false,
    screenshotOnRunFailure: true,
    video: true,
    defaultCommandTimeout: 8000,
  },
});
```

Para apontar para um ambiente diferente:

```bash
BASE_URL=https://staging.meusite.com npx cypress run
```

---

## 9. Evidências

- **Screenshots:** gerados automaticamente em `cypress/screenshots/` quando um teste falha
- **Vídeos:** gravados em `cypress/videos/` a cada execução headless

---

## Tecnologias

- [Cypress](https://www.cypress.io/) v15
- Node.js v18+
- Aplicação alvo: [Hub de Leitura](https://github.com/fabioaraujoqa/hub-de-leitura) (Node.js + Express + SQLite)

---

## Autor

Rafael Orleaes — [@rafaorleaes](https://github.com/rafaorleaes)
