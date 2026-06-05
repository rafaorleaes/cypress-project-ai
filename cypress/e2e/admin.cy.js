describe('CT-ADMIN - Painel Administrativo', () => {
  beforeEach(() => {
    cy.loginComoAdmin();
    cy.visit('/admin-dashboard.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-ADMIN-001 - Admin acessa o painel administrativo com sucesso', () => {
    cy.contains(/painel administrativo|admin dashboard/i).should('be.visible');
    cy.screenshot('CT-ADMIN-001_painel-admin');
  });

  it('CT-ADMIN-002 - Dashboard admin exibe estatísticas do sistema', () => {
    cy.contains(/usuários|livros|reservas/i).should('be.visible');
    cy.screenshot('CT-ADMIN-002_estatisticas-sistema');
  });

  it('CT-ADMIN-003 - Painel de gerenciamento de livros carrega corretamente', () => {
    cy.visit('/admin-books.html');
    cy.fecharModalSeExistir();
    cy.contains(/gerenciar livros|livros|catálogo/i).should('be.visible');
    cy.screenshot('CT-ADMIN-003_gerenciar-livros');
  });

  it('CT-ADMIN-004 - Painel de gerenciamento de reservas carrega corretamente', () => {
    cy.visit('/admin-reservations.html');
    cy.fecharModalSeExistir();
    cy.contains(/reservas|gerenciar/i).should('be.visible');
    cy.screenshot('CT-ADMIN-004_gerenciar-reservas');
  });

  it('CT-ADMIN-005 - API de admin retorna lista de usuários', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').or.have.property('users');
      });
    });
  });

  it('CT-ADMIN-006 - API de admin retorna estatísticas do sistema', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      cy.request({
        method: 'GET',
        url: '/api/admin/stats',
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-ADMIN-007 - Usuário não autenticado não acessa o painel admin', () => {
    cy.clearLocalStorage();
    cy.visit('/admin-dashboard.html');
    cy.url().should('include', 'login');
    cy.screenshot('CT-ADMIN-007_acesso-negado-sem-auth');
  });

  it('CT-ADMIN-008 - Usuário comum não acessa o painel admin', () => {
    cy.loginComoUsuario();
    cy.visit('/admin-dashboard.html');
    cy.url().should('not.include', 'admin-dashboard');
    cy.screenshot('CT-ADMIN-008_acesso-negado-usuario-comum');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-ADMIN-SEC-001 - API admin/users sem token retorna 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/admin/users',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('CT-ADMIN-SEC-002 - API admin/users com token de usuário comum retorna 403', () => {
    cy.loginComoUsuario();
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });
  });

  it('CT-ADMIN-SEC-003 - Endpoint de exclusão de livro requer autenticação admin', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/books/1',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it('CT-ADMIN-SEC-004 - Endpoint de criação de livro requer autenticação admin', () => {
    cy.request({
      method: 'POST',
      url: '/api/books',
      body: { title: 'Livro Hacker', author: 'Hacker' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });
});
