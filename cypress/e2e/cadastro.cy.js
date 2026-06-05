describe('CT-CAD - Cadastro de Usuário', () => {
  const emailUnico = () => `usuario_${Date.now()}@teste.com`;

  beforeEach(() => {
    cy.visit('/register.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-CAD-001 - Cadastro com todos os dados válidos cria conta e redireciona', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Usuário QA Automatizado');
    cy.get('input[placeholder="seu@email.com"]').type(emailUnico());
    cy.get('input[placeholder="(11) 99999-9999"]').type('(11) 98765-4321');
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
    cy.get('input[type="checkbox"]').check();
    cy.screenshot('CT-CAD-001_formulario-preenchido');
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'dashboard');
    cy.screenshot('CT-CAD-001_cadastro-realizado');
  });

  it('CT-CAD-002 - Cadastro sem telefone (campo opcional) deve funcionar', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Sem Telefone');
    cy.get('input[placeholder="seu@email.com"]').type(emailUnico());
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'dashboard');
    cy.screenshot('CT-CAD-002_cadastro-sem-telefone');
  });

  it('CT-CAD-003 - Indicador de força da senha exibe "Senha forte!" para senha robusta', () => {
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123Forte');
    cy.contains(/senha forte/i).should('be.visible');
    cy.screenshot('CT-CAD-003_senha-forte');
  });

  it('CT-CAD-004 - Link "termos de uso" redireciona para página de termos', () => {
    cy.contains('a', /termos de uso/i).should('have.attr', 'href').and('include', 'terms');
    cy.screenshot('CT-CAD-004_link-termos');
  });

  it('CT-CAD-005 - Link "Fazer Login" redireciona para página de login', () => {
    cy.contains('a', /fazer login/i).click();
    cy.url().should('include', 'login');
    cy.screenshot('CT-CAD-005_link-fazer-login');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-CAD-006 - Cadastro com e-mail já existente exibe mensagem de erro', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Admin Duplicado');
    cy.get('input[placeholder="seu@email.com"]').type(Cypress.env('ADMIN_EMAIL'));
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'register');
    cy.contains(/erro ao criar conta|e-mail já cadastrado|já existe/i).should('be.visible');
    cy.screenshot('CT-CAD-006_email-duplicado');
  });

  it('CT-CAD-007 - Campos obrigatórios vazios impedem envio do formulário', () => {
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'register');
    cy.get('input:invalid').should('have.length.greaterThan', 0);
    cy.screenshot('CT-CAD-007_campos-obrigatorios-vazios');
  });

  it('CT-CAD-008 - Senha com menos de 6 caracteres impede o cadastro', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Teste Curto');
    cy.get('input[placeholder="seu@email.com"]').type(emailUnico());
    cy.get('input[placeholder="Crie uma senha segura"]').type('12345');
    cy.get('input[placeholder="Confirme sua senha"]').type('12345');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'register');
    cy.screenshot('CT-CAD-008_senha-curta');
  });

  it('CT-CAD-009 - Senhas diferentes nos campos senha e confirmação exibem erro', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Teste Mismatch');
    cy.get('input[placeholder="seu@email.com"]').type(emailUnico());
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@456');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'register');
    cy.contains(/senhas não coincidem|confirme a senha|diferentes/i).should('be.visible');
    cy.screenshot('CT-CAD-009_senhas-diferentes');
  });

  it('CT-CAD-010 - Cadastro sem aceitar termos de uso impede envio', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Sem Termos');
    cy.get('input[placeholder="seu@email.com"]').type(emailUnico());
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'register');
    cy.screenshot('CT-CAD-010_sem-aceitar-termos');
  });

  it('CT-CAD-011 - E-mail com formato inválido (sem domínio) impede envio', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('Email Inválido');
    cy.get('input[placeholder="seu@email.com"]').type('invalido@');
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /criar conta/i).click();
    cy.url().should('include', 'register');
    cy.get('input:invalid').should('have.length.greaterThan', 0);
    cy.screenshot('CT-CAD-011_email-formato-invalido');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-CAD-SEC-001 - XSS no campo nome não executa script', () => {
    cy.get('input[placeholder="Seu nome completo"]').type('<script>alert("xss")</script>');
    cy.get('input[placeholder="seu@email.com"]').type(emailUnico());
    cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
    cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', /criar conta/i).click();
    cy.on('window:alert', (txt) => {
      throw new Error(`Alert inesperado disparado: ${txt}`);
    });
    cy.screenshot('CT-CAD-SEC-001_xss-nome');
  });

  it('CT-CAD-SEC-002 - API de cadastro retorna 400 com body vazio', () => {
    cy.request({
      method: 'POST',
      url: '/api/register',
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422]);
    });
  });

  it('CT-CAD-SEC-003 - API de cadastro não retorna senha no response de sucesso', () => {
    cy.request({
      method: 'POST',
      url: '/api/register',
      body: {
        name: 'Teste Segurança',
        email: emailUnico(),
        password: 'Senha@123',
      },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200 || response.status === 201) {
        expect(response.body).to.not.have.property('password');
        expect(response.body).to.not.have.property('senha');
      }
    });
  });
});
