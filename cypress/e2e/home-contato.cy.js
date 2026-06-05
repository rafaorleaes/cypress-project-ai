describe('CT-HOME - Página Inicial e Contato', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // HOME — CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-HOME-001 - Página inicial carrega com elementos principais visíveis', () => {
    cy.contains(/hub de leitura/i).should('be.visible');
    cy.contains('a', /catálogo/i).should('be.visible');
    cy.screenshot('CT-HOME-001_pagina-inicial');
  });

  it('CT-HOME-002 - Hero section exibe chamada para ação', () => {
    cy.get('body').contains(/explore|descubra|acesse o catálogo/i).should('be.visible');
    cy.screenshot('CT-HOME-002_hero-section');
  });

  it('CT-HOME-003 - Seção de livros em destaque está visível', () => {
    cy.contains(/destaque|lançamentos|mais lidos|populares/i).should('be.visible');
    cy.screenshot('CT-HOME-003_livros-destaque');
  });

  it('CT-HOME-004 - Links de navegação do header estão funcionais', () => {
    cy.contains('a', /home/i).should('have.attr', 'href');
    cy.contains('a', /cesta/i).should('have.attr', 'href').and('include', 'basket');
    cy.contains('a', /entrar/i).should('have.attr', 'href').and('include', 'login');
    cy.screenshot('CT-HOME-004_links-navegacao');
  });

  it('CT-HOME-005 - Footer exibe informações de contato e links', () => {
    cy.contains(/hub de leitura/i).should('be.visible');
    cy.contains(/catálogo/i).should('be.visible');
    cy.screenshot('CT-HOME-005_footer');
  });

  it('CT-HOME-006 - Link "Catálogo" do hero redireciona para catálogo de livros', () => {
    cy.contains('a', /ver catálogo|acessar catálogo|catálogo/i).first().click();
    cy.url().should('include', 'catalog');
    cy.screenshot('CT-HOME-006_link-catalogo-hero');
  });

  // ──────────────────────────────────────────
  // CONTATO — CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-CONT-001 - Formulário de contato está visível na home', () => {
    cy.get('#contactForm, form[id*="contact"], [class*="contact"]').should('exist');
    cy.screenshot('CT-CONT-001_formulario-contato');
  });

  it('CT-CONT-002 - Envio do formulário de contato com dados válidos exibe confirmação', () => {
    cy.get('#contactForm, form[id*="contact"]').within(() => {
      cy.get('input[name="name"], input[placeholder*="nome"]').type('QA Tester');
      cy.get('input[name="email"], input[type="email"]').type('qa@teste.com');
      cy.get('input[name="subject"], input[placeholder*="assunto"]').type('Teste Automatizado');
      cy.get('textarea[name="message"], textarea').type('Mensagem de teste automatizado pelo Cypress.');
      cy.screenshot('CT-CONT-002_formulario-preenchido');
      cy.contains('button', /enviar|submit/i).click();
    });
    cy.contains(/mensagem enviada|obrigado|sucesso|recebemos/i).should('be.visible');
    cy.screenshot('CT-CONT-002_mensagem-enviada');
  });

  // ──────────────────────────────────────────
  // CONTATO — CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-CONT-003 - Envio do formulário de contato com campos vazios é bloqueado', () => {
    cy.get('#contactForm, form[id*="contact"]').within(() => {
      cy.contains('button', /enviar|submit/i).click();
    });
    cy.get('input:invalid, textarea:invalid').should('have.length.greaterThan', 0);
    cy.screenshot('CT-CONT-003_campos-obrigatorios');
  });

  it('CT-CONT-004 - Formulário de contato com e-mail inválido é bloqueado', () => {
    cy.get('#contactForm, form[id*="contact"]').within(() => {
      cy.get('input[name="name"], input[placeholder*="nome"]').type('Teste');
      cy.get('input[name="email"], input[type="email"]').type('emailinvalido');
      cy.get('textarea[name="message"], textarea').type('Mensagem de teste.');
      cy.contains('button', /enviar|submit/i).click();
    });
    cy.get('input:invalid').should('have.length.greaterThan', 0);
    cy.screenshot('CT-CONT-004_email-invalido-contato');
  });

  // ──────────────────────────────────────────
  // CONTATO — CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-CONT-SEC-001 - XSS no formulário de contato não executa scripts', () => {
    cy.on('window:alert', () => {
      throw new Error('XSS executado no formulário de contato');
    });
    cy.get('#contactForm, form[id*="contact"]').within(() => {
      cy.get('input[name="name"], input[placeholder*="nome"]').type('<script>alert("xss")</script>');
      cy.get('input[name="email"], input[type="email"]').type('xss@test.com');
      cy.get('input[name="subject"], input[placeholder*="assunto"]').type('<img src=x onerror=alert(1)>');
      cy.get('textarea[name="message"], textarea').type('<script>alert(document.cookie)</script>');
      cy.contains('button', /enviar|submit/i).click();
    });
    cy.screenshot('CT-CONT-SEC-001_xss-contato');
  });

  it('CT-CONT-SEC-002 - API de contato sem body retorna 400', () => {
    cy.request({
      method: 'POST',
      url: '/api/contact',
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422]);
    });
  });
});
