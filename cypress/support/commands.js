Cypress.Commands.add('loginComoAdmin', () => {
  cy.request('POST', '/api/login', {
    email: Cypress.env('ADMIN_EMAIL'),
    password: Cypress.env('ADMIN_PASSWORD'),
  }).then(({ body }) => {
    localStorage.setItem('token', body.token);
    localStorage.setItem('user', JSON.stringify(body.user));
  });
});

Cypress.Commands.add('loginComoUsuario', () => {
  cy.request('POST', '/api/login', {
    email: Cypress.env('USER_EMAIL'),
    password: Cypress.env('USER_PASSWORD'),
  }).then(({ body }) => {
    localStorage.setItem('token', body.token);
    localStorage.setItem('user', JSON.stringify(body.user));
  });
});

Cypress.Commands.add('fecharModalSeExistir', () => {
  cy.get('body').then(($body) => {
    if ($body.find('.modal.show').length > 0) {
      cy.get('.modal.show .modal-footer .btn').first().click({ force: true });
      cy.get('.modal.show').should('not.exist');
    }
  });
});
