describe('CT-CHECKOUT - Checkout e Reservas', () => {
  beforeEach(() => {
    cy.loginComoUsuario();
    cy.visit('/checkout.html');
    cy.fecharModalSeExistir();
  });

  // ──────────────────────────────────────────
  // CENÁRIOS POSITIVOS
  // ──────────────────────────────────────────

  it('CT-CHECK-001 - Página de checkout carrega para usuário autenticado', () => {
    cy.contains(/checkout|confirmação|reserva/i).should('be.visible');
    cy.screenshot('CT-CHECK-001_pagina-checkout');
  });

  it('CT-CHECK-002 - Resumo da reserva exibe itens corretamente', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[class*="item"], [class*="livro"], [class*="book"]').length > 0) {
        cy.get('[class*="item"], [class*="livro"], [class*="book"]')
          .first()
          .should('be.visible');
      } else {
        cy.contains(/nenhum livro|cesta vazia|adicione/i).should('be.visible');
      }
    });
    cy.screenshot('CT-CHECK-002_resumo-reserva');
  });

  it('CT-CHECK-003 - Botão de confirmar reserva está presente', () => {
    cy.contains('button', /confirmar|finalizar|reservar/i).should('be.visible');
    cy.screenshot('CT-CHECK-003_botao-confirmar');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS NEGATIVOS
  // ──────────────────────────────────────────

  it('CT-CHECK-004 - Usuário não autenticado é redirecionado ao tentar acessar checkout', () => {
    cy.clearLocalStorage();
    cy.visit('/checkout.html');
    cy.url().should('include', 'login');
    cy.screenshot('CT-CHECK-004_checkout-sem-auth');
  });

  it('CT-CHECK-005 - Confirmar reserva com cesta vazia exibe mensagem de aviso', () => {
    cy.contains('button', /confirmar|finalizar|reservar/i).then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click();
        cy.contains(/cesta vazia|nenhum livro|adicione itens/i).should('be.visible');
      }
    });
    cy.screenshot('CT-CHECK-005_reserva-cesta-vazia');
  });

  // ──────────────────────────────────────────
  // CENÁRIOS DE SEGURANÇA
  // ──────────────────────────────────────────

  it('CT-CHECK-SEC-001 - API de reservas sem token retorna 401', () => {
    cy.request({
      method: 'POST',
      url: '/api/reservations',
      body: { bookId: 1 },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('CT-CHECK-SEC-002 - API de reservas rejeita bookId inválido', () => {
    cy.loginComoUsuario();
    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      cy.request({
        method: 'POST',
        url: '/api/reservations',
        headers: { Authorization: `Bearer ${token}` },
        body: { bookId: -1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 404, 422]);
      });
    });
  });
});
