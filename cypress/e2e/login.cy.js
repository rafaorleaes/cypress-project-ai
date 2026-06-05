describe('CT-LOGIN - Autenticação', () => {
  beforeEach(() => {
    cy.visit('/login.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-LOGIN-001 - Login com credenciais válidas de administrador redireciona para painel admin', () => {
    cy.get('input[type="email"], input[name="email"]').type(Cypress.env('ADMIN_EMAIL'));
    cy.get('input[type="password"], input[name="password"]').type(Cypress.env('ADMIN_PASSWORD'));
    cy.screenshot('CT-LOGIN-001_antes-submeter');
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'admin');
    cy.contains(/painel administrativo|admin/i).should('be.visible');
    cy.screenshot('CT-LOGIN-001_painel-admin-visivel');
  });

  it('CT-LOGIN-002 - Login com credenciais válidas de usuário comum redireciona para dashboard', () => {
    cy.get('input[type="email"], input[name="email"]').type(Cypress.env('USER_EMAIL'));
    cy.get('input[type="password"], input[name="password"]').type(Cypress.env('USER_PASSWORD'));
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'dashboard');
    cy.screenshot('CT-LOGIN-002_dashboard-usuario');
  });

  it('CT-LOGIN-003 - Toggle de visibilidade da senha altera tipo do campo', () => {
    cy.get('input[type="password"], input[name="password"]').should('have.attr', 'type', 'password');
    cy.get('#toggle-password, button[aria-label*="senha"], button').filter(':visible').last().click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    cy.screenshot('CT-LOGIN-003_senha-visivel');
  });

  it('CT-LOGIN-004 - Página de login exibe elementos essenciais', () => {
    cy.get('input[type="email"], input[name="email"]').should('be.visible');
    cy.get('input[type="password"], input[name="password"]').should('be.visible');
    cy.contains('button', /entrar/i).should('be.visible');
    cy.contains(/hub de leitura/i).should('be.visible');
    cy.screenshot('CT-LOGIN-004_elementos-pagina');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-LOGIN-005 - Login com senha incorreta exibe mensagem de erro', () => {
    cy.get('input[type="email"], input[name="email"]').type(Cypress.env('ADMIN_EMAIL'));
    cy.get('input[type="password"], input[name="password"]').type('senha_errada_123');
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.contains(/credenciais inválidas|e-mail ou senha|incorretos|erro/i).should('be.visible');
    cy.screenshot('CT-LOGIN-005_erro-senha-incorreta');
  });

  it('CT-LOGIN-006 - Login com e-mail não cadastrado exibe mensagem de erro', () => {
    cy.get('input[type="email"], input[name="email"]').type('naoexiste@biblioteca.com');
    cy.get('input[type="password"], input[name="password"]').type('qualquersenha123');
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.contains(/credenciais inválidas|usuário não encontrado|erro/i).should('be.visible');
    cy.screenshot('CT-LOGIN-006_erro-email-nao-cadastrado');
  });

  it('CT-LOGIN-007 - Login com campos vazios não submete o formulário', () => {
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.get('input:invalid').should('have.length.greaterThan', 0);
    cy.screenshot('CT-LOGIN-007_campos-vazios');
  });

  it('CT-LOGIN-008 - Login com e-mail inválido (sem @) não submete o formulário', () => {
    cy.get('input[type="email"], input[name="email"]').type('emailsemarroba');
    cy.get('input[type="password"], input[name="password"]').type('senha123');
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.get('input:invalid').should('have.length.greaterThan', 0);
    cy.screenshot('CT-LOGIN-008_email-invalido');
  });

  it('CT-LOGIN-009 - Login com apenas o e-mail preenchido não submete', () => {
    cy.get('input[type="email"], input[name="email"]').type(Cypress.env('USER_EMAIL'));
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.screenshot('CT-LOGIN-009_apenas-email');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-LOGIN-SEC-001 - Tentativa de injeção SQL no campo e-mail não autentica', () => {
    cy.get('input[type="email"], input[name="email"]').type("' OR '1'='1' --", { parseSpecialCharSequences: false });
    cy.get('input[type="password"], input[name="password"]').type('qualquer');
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.screenshot('CT-LOGIN-SEC-001_sql-injection-bloqueado');
  });

  it('CT-LOGIN-SEC-002 - Tentativa de XSS no campo e-mail não executa script', () => {
    cy.get('input[type="email"], input[name="email"]').type('<script>alert(1)</script>@test.com');
    cy.get('input[type="password"], input[name="password"]').type('qualquer');
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', 'login');
    cy.screenshot('CT-LOGIN-SEC-002_xss-bloqueado');
  });

  it('CT-LOGIN-SEC-003 - API de login retorna 401 com credenciais inválidas', () => {
    cy.request({
      method: 'POST',
      url: '/api/login',
      body: { email: 'hacker@test.com', password: 'wrongpass' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('CT-LOGIN-SEC-004 - API de login não expõe senha no response', () => {
    cy.request('POST', '/api/login', {
      email: Cypress.env('USER_EMAIL'),
      password: Cypress.env('USER_PASSWORD'),
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.have.property('password');
      expect(response.body).to.not.have.property('senha');
    });
  });

  it('CT-LOGIN-SEC-005 - Força bruta com múltiplas tentativas consecutivas', () => {
    const tentativas = [
      { email: Cypress.env('ADMIN_EMAIL'), password: 'errado1' },
      { email: Cypress.env('ADMIN_EMAIL'), password: 'errado2' },
      { email: Cypress.env('ADMIN_EMAIL'), password: 'errado3' },
    ];

    tentativas.forEach(({ email, password }) => {
      cy.request({
        method: 'POST',
        url: '/api/login',
        body: { email, password },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 429]);
      });
    });
  });
});
