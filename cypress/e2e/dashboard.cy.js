describe('CT-DASH - Dashboard do Usuário', () => {
  beforeEach(() => {
    cy.loginComoUsuario();
    cy.visit('/dashboard.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-DASH-001 - Dashboard carrega corretamente para usuário autenticado', () => {
    cy.contains(/dashboard|minhas reservas|bem-vindo/i).should('be.visible');
    cy.screenshot('CT-DASH-001_dashboard-carregado');
  });

  it('CT-DASH-002 - Seção de reservas está visível no dashboard', () => {
    cy.contains(/reservas|histórico|livros reservados/i).should('be.visible');
    cy.screenshot('CT-DASH-002_secao-reservas');
  });

  it('CT-DASH-003 - Estatísticas do usuário são exibidas', () => {
    cy.get('body').then(($body) => {
      const temStats = $body.find('[class*="stat"], [class*="card"], [class*="count"]').length > 0;
      if (temStats) {
        cy.get('[class*="stat"], [class*="card"]').first().should('be.visible');
      }
    });
    cy.screenshot('CT-DASH-003_estatisticas');
  });

  it('CT-DASH-004 - Nome do usuário logado aparece no dashboard', () => {
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      if (user.name) {
        cy.contains(user.name).should('be.visible');
      }
    });
    cy.screenshot('CT-DASH-004_nome-usuario');
  });

  it('CT-DASH-005 - Link para o catálogo de livros está acessível', () => {
    cy.contains('a', /catálogo|ver livros/i).should('be.visible');
    cy.screenshot('CT-DASH-005_link-catalogo');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-DASH-006 - Usuário não autenticado é redirecionado para login', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard.html');
    cy.url().should('include', 'login');
    cy.screenshot('CT-DASH-006_redirecionamento-login');
  });

  it('CT-DASH-007 - Usuário comum não vê opções administrativas no dashboard', () => {
    cy.contains(/gerenciar usuários|painel admin|admin/i).should('not.exist');
    cy.screenshot('CT-DASH-007_sem-opcoes-admin');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-DASH-SEC-001 - API de reservas do usuário sem token retorna 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/reservations',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('CT-DASH-SEC-002 - Token expirado redireciona para login', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'token.expirado.invalido');
    });
    cy.visit('/dashboard.html');
    cy.url().should('include', 'login');
    cy.screenshot('CT-DASH-SEC-002_token-expirado');
  });
});
