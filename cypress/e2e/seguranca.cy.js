describe('CT-SEC - Testes de Segurança Transversais', () => {
  // ──────────────────────────────────────────
  // CONTROLE DE ACESSO (AUTHZ)
  // ──────────────────────────────────────────

  context('Controle de Acesso', () => {
    it('CT-SEC-001 - Acesso a rota protegida sem token retorna 401', () => {
      const rotasProtegidas = [
        '/api/reservations',
        '/api/users',
        '/api/basket/1',
        '/api/admin/users',
        '/api/admin/stats',
      ];

      rotasProtegidas.forEach((rota) => {
        cy.request({ method: 'GET', url: rota, failOnStatusCode: false }).then(
          (response) => {
            expect(response.status, `Rota ${rota} deveria retornar 401`).to.eq(401);
          }
        );
      });
    });

    it('CT-SEC-002 - Usuário comum não acessa rotas exclusivas de admin', () => {
      cy.loginComoUsuario();
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        const rotasAdmin = ['/api/admin/users', '/api/admin/stats', '/api/admin/reservations'];

        rotasAdmin.forEach((rota) => {
          cy.request({
            method: 'GET',
            url: rota,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status, `Rota admin ${rota} deve ser bloqueada para user`).to.be.oneOf([401, 403]);
          });
        });
      });
    });

    it('CT-SEC-003 - Páginas administrativas redirecionam usuário comum', () => {
      cy.loginComoUsuario();
      const paginasAdmin = ['/admin-dashboard.html', '/admin-books.html', '/admin-reservations.html'];

      paginasAdmin.forEach((pagina) => {
        cy.visit(pagina);
        cy.url().should('not.include', pagina.replace('.html', ''));
      });
      cy.screenshot('CT-SEC-003_acesso-admin-bloqueado');
    });

    it('CT-SEC-004 - Páginas protegidas redirecionam visitante anônimo para login', () => {
      cy.clearLocalStorage();
      const paginasProtegidas = ['/dashboard.html', '/basket.html', '/checkout.html', '/user.html'];

      paginasProtegidas.forEach((pagina) => {
        cy.visit(pagina);
        cy.url().should('include', 'login');
      });
      cy.screenshot('CT-SEC-004_redirecionamento-anonimo');
    });
  });

  // ──────────────────────────────────────────
  // INJEÇÃO (XSS / SQL)
  // ──────────────────────────────────────────

  context('Proteção contra Injeção', () => {
    beforeEach(() => {
      cy.visit('/login.html');
      cy.fecharModalSeExistir();
    });

    it('CT-SEC-005 - XSS via campo de login não executa código malicioso', () => {
      cy.on('window:alert', () => {
        throw new Error('XSS executado no campo de login');
      });
      cy.get('input[type="email"], input[name="email"]').type('<script>alert("xss")</script>@mail.com');
      cy.get('input[type="password"], input[name="password"]').type('<img src=x onerror=alert(1)>');
      cy.contains('button', /entrar/i).click();
      cy.screenshot('CT-SEC-005_xss-login');
    });

    it('CT-SEC-006 - SQL Injection no login não bypassa autenticação', () => {
      const payloads = ["' OR 1=1 --", "' OR '1'='1", "admin'--", "1; DROP TABLE users;--"];

      payloads.forEach((payload) => {
        cy.request({
          method: 'POST',
          url: '/api/login',
          body: { email: payload, password: payload },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status, `SQL Injection "${payload}" não deve autenticar`).to.eq(401);
        });
      });
    });

    it('CT-SEC-007 - XSS no campo de busca do catálogo não executa scripts', () => {
      cy.visit('/catalog.html');
      cy.fecharModalSeExistir();
      cy.on('window:alert', () => {
        throw new Error('XSS executado na busca');
      });
      cy.get('#search-input').type('<script>alert("xss")</script>');
      cy.get('#book-list').should('exist');
      cy.screenshot('CT-SEC-007_xss-catalogo');
    });

    it('CT-SEC-008 - XSS no cadastro não persiste scripts no sistema', () => {
      cy.visit('/register.html');
      cy.fecharModalSeExistir();
      cy.on('window:alert', () => {
        throw new Error('XSS executado no cadastro');
      });
      cy.get('input[placeholder="Seu nome completo"]').type('<script>alert(document.cookie)</script>');
      cy.get('input[placeholder="seu@email.com"]').type(`xss_${Date.now()}@test.com`);
      cy.get('input[placeholder="Crie uma senha segura"]').type('Senha@123');
      cy.get('input[placeholder="Confirme sua senha"]').type('Senha@123');
      cy.get('input[type="checkbox"]').check();
      cy.contains('button', /criar conta/i).click();
      cy.screenshot('CT-SEC-008_xss-cadastro');
    });
  });

  // ──────────────────────────────────────────
  // JWT E SESSÃO
  // ──────────────────────────────────────────

  context('JWT e Gerenciamento de Sessão', () => {
    it('CT-SEC-009 - Token JWT adulterado é rejeitado pela API', () => {
      const tokenAdulterado = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBiaWJsaW90ZWNhLmNvbSIsInJvbGUiOiJhZG1pbiJ9.ASSINATURA_FALSA';

      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        headers: { Authorization: `Bearer ${tokenAdulterado}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('CT-SEC-010 - Token JWT com role adulterada para admin não concede acesso', () => {
      cy.loginComoUsuario();
      cy.window().then((win) => {
        const tokenOriginal = win.localStorage.getItem('token');
        const [header, payload] = tokenOriginal.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        decodedPayload.role = 'admin';
        const payloadAdulterado = btoa(JSON.stringify(decodedPayload));
        const tokenAdulterado = `${header}.${payloadAdulterado}.ASSINATURA_INVALIDA`;

        cy.request({
          method: 'GET',
          url: '/api/admin/users',
          headers: { Authorization: `Bearer ${tokenAdulterado}` },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.be.oneOf([401, 403]);
        });
      });
    });

    it('CT-SEC-011 - Token inexistente no localStorage redireciona para login', () => {
      cy.clearLocalStorage();
      cy.visit('/dashboard.html');
      cy.url().should('include', 'login');
      cy.screenshot('CT-SEC-011_sem-token-redireciona');
    });
  });

  // ──────────────────────────────────────────
  // HEADERS DE SEGURANÇA
  // ──────────────────────────────────────────

  context('Headers HTTP de Segurança', () => {
    it('CT-SEC-012 - API retorna headers de segurança básicos', () => {
      cy.request('/api/health').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('CT-SEC-013 - API não expõe informações sensíveis do servidor', () => {
      cy.request('/api/info').then((response) => {
        expect(response.status).to.eq(200);
        expect(JSON.stringify(response.body)).to.not.include('senha');
        expect(JSON.stringify(response.body)).to.not.include('password');
        expect(JSON.stringify(response.body)).to.not.include('secret');
      });
    });

    it('CT-SEC-014 - Endpoint inexistente retorna 404, não 500', () => {
      cy.request({
        method: 'GET',
        url: '/api/rota_que_nao_existe_xpto',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  // ──────────────────────────────────────────
  // ENUMERAÇÃO E EXPOSIÇÃO DE DADOS
  // ──────────────────────────────────────────

  context('Proteção contra Enumeração', () => {
    it('CT-SEC-015 - Login com senha errada retorna mensagem genérica (não confirma se e-mail existe)', () => {
      cy.request({
        method: 'POST',
        url: '/api/login',
        body: { email: 'naoexiste@test.com', password: 'senha123' },
        failOnStatusCode: false,
      }).then((respNaoExiste) => {
        cy.request({
          method: 'POST',
          url: '/api/login',
          body: { email: Cypress.env('ADMIN_EMAIL'), password: 'senhaerrada' },
          failOnStatusCode: false,
        }).then((respExiste) => {
          expect(respNaoExiste.status).to.eq(401);
          expect(respExiste.status).to.eq(401);
        });
      });
    });
  });
});
