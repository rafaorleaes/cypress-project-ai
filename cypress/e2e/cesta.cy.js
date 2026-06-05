describe('CT-CESTA - Cesta de Livros', () => {
  beforeEach(() => {
    cy.loginComoUsuario();
    cy.visit('/basket.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-CESTA-001 - Página da cesta carrega corretamente para usuário autenticado', () => {
    cy.contains(/cesta|carrinho|meus livros/i).should('be.visible');
    cy.screenshot('CT-CESTA-001_pagina-cesta');
  });

  it('CT-CESTA-002 - Adicionar livro ao catálogo atualiza contador na cesta', () => {
    cy.visit('/catalog.html');
    cy.fecharModalSeExistir();
    cy.get('#book-list').children().should('have.length.greaterThan', 0);

    cy.get('#book-list')
      .children()
      .first()
      .find('button')
      .contains(/reservar|adicionar|cesta/i)
      .click({ force: true });

    cy.contains(/adicionado|cesta atualizada|sucesso/i).should('be.visible');
    cy.screenshot('CT-CESTA-002_livro-adicionado');
  });

  it('CT-CESTA-003 - Cesta vazia exibe mensagem informativa', () => {
    cy.request({
      method: 'GET',
      url: '/api/basket',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      failOnStatusCode: false,
    });

    cy.visit('/basket.html');
    cy.fecharModalSeExistir();
    cy.contains(/cesta vazia|nenhum livro|adicione livros/i).should('be.visible');
    cy.screenshot('CT-CESTA-003_cesta-vazia');
  });

  it('CT-CESTA-004 - Botão "Ir para o Catálogo" na cesta vazia redireciona', () => {
    cy.contains('a', /catálogo|ver livros/i).should('be.visible').click();
    cy.url().should('include', 'catalog');
    cy.screenshot('CT-CESTA-004_link-catalogo');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-CESTA-005 - Usuário não autenticado é redirecionado ao tentar acessar a cesta', () => {
    cy.clearLocalStorage();
    cy.visit('/basket.html');
    cy.url().should('include', 'login');
    cy.screenshot('CT-CESTA-005_acesso-nao-autenticado');
  });

  it('CT-CESTA-006 - API da cesta sem token retorna 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/basket/1',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-CESTA-SEC-001 - API da cesta rejeita token forjado', () => {
    cy.request({
      method: 'GET',
      url: '/api/basket/1',
      headers: { Authorization: 'Bearer token_forjado_invalido_123' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  it('CT-CESTA-SEC-002 - Usuário comum não acessa cesta de outro usuário via API', () => {
    cy.loginComoUsuario().then(() => {
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        cy.request({
          method: 'GET',
          url: '/api/basket/9999',
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403, 404]);
        });
      });
    });
  });
});
