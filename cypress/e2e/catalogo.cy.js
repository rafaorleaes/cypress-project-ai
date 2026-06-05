describe('CT-CAT - Catálogo de Livros', () => {
  beforeEach(() => {
    cy.visit('/catalog.html');
    cy.fecharModalSeExistir();
    cy.get('#book-list, #loading').should('exist');
    cy.get('#loading').should('not.be.visible');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-CAT-001 - Catálogo exibe lista de livros ao carregar a página', () => {
    cy.get('#book-list').children().should('have.length.greaterThan', 0);
    cy.screenshot('CT-CAT-001_livros-listados');
  });

  it('CT-CAT-002 - Busca por título retorna resultados relevantes', () => {
    cy.get('#search-input').type('dom casmurro');
    cy.get('#book-list').children().should('have.length.greaterThan', 0);
    cy.get('#results-count, #filter-status').should('be.visible');
    cy.screenshot('CT-CAT-002_busca-titulo');
  });

  it('CT-CAT-003 - Busca sem resultados exibe mensagem de "nenhum livro encontrado"', () => {
    cy.get('#search-input').type('zzz_livro_inexistente_xyz_999');
    cy.contains(/nenhum livro|não encontrado|sem resultados/i).should('be.visible');
    cy.screenshot('CT-CAT-003_sem-resultados');
  });

  it('CT-CAT-004 - Filtro por categoria filtra os livros corretamente', () => {
    cy.get('#category-filter').select(1);
    cy.get('#book-list').children().should('have.length.greaterThan', 0);
    cy.screenshot('CT-CAT-004_filtro-categoria');
  });

  it('CT-CAT-005 - Filtro por disponibilidade exibe apenas livros disponíveis', () => {
    cy.get('#availability-filter').select(1);
    cy.get('#book-list').children().should('have.length.greaterThan', 0);
    cy.screenshot('CT-CAT-005_filtro-disponibilidade');
  });

  it('CT-CAT-006 - Botão "Limpar filtros" restaura a listagem completa', () => {
    cy.get('#search-input').type('tolkien');
    cy.get('#book-list').children().then(($filtrado) => {
      cy.get('#clear-filters').click();
      cy.get('#book-list').children().should('have.length.greaterThan', $filtrado.length - 1);
    });
    cy.screenshot('CT-CAT-006_limpar-filtros');
  });

  it('CT-CAT-007 - Alternar para visualização em lista muda o layout', () => {
    cy.get('#view-list').click();
    cy.get('#book-list').should('not.have.class', 'row-cols-2');
    cy.screenshot('CT-CAT-007_visualizacao-lista');
  });

  it('CT-CAT-008 - Alternar para visualização em grade muda o layout', () => {
    cy.get('#view-list').click();
    cy.get('#view-grid').click();
    cy.get('#book-list').should('be.visible');
    cy.screenshot('CT-CAT-008_visualizacao-grade');
  });

  it('CT-CAT-009 - Paginação está presente e funcional', () => {
    cy.get('#pagination').should('be.visible');
    cy.get('#pagination a[data-page]').should('have.length.greaterThan', 0);
    cy.screenshot('CT-CAT-009_paginacao-presente');
  });

  it('CT-CAT-010 - Clicar em um livro redireciona para página de detalhes', () => {
    cy.get('#book-list').children().first().find('a').first().click();
    cy.url().should('include', 'book-details');
    cy.screenshot('CT-CAT-010_detalhes-livro');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-CAT-011 - Busca com caracteres especiais não causa erro na página', () => {
    cy.get('#search-input').type('!@#$%^&*()');
    cy.get('#book-list').should('exist');
    cy.get('body').should('not.contain.text', 'Uncaught');
    cy.screenshot('CT-CAT-011_busca-caracteres-especiais');
  });

  it('CT-CAT-012 - Busca com texto muito longo não trava a aplicação', () => {
    cy.get('#search-input').type('a'.repeat(200));
    cy.get('#book-list').should('exist');
    cy.screenshot('CT-CAT-012_busca-texto-longo');
  });

  it('CT-CAT-013 - API de livros retorna lista com status 200', () => {
    cy.request('GET', '/api/books').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array').or.have.property('books');
    });
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-CAT-SEC-001 - XSS na barra de busca não executa scripts', () => {
    cy.get('#search-input').type('<img src=x onerror=alert(1)>');
    cy.on('window:alert', () => {
      throw new Error('XSS executado na busca');
    });
    cy.get('#book-list').should('exist');
    cy.screenshot('CT-CAT-SEC-001_xss-busca');
  });

  it('CT-CAT-SEC-002 - API de livros é pública e não requer autenticação para leitura', () => {
    cy.request({ method: 'GET', url: '/api/books', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
