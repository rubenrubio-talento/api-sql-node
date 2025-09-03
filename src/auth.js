// src/auth.js
import fp from 'fastify-plugin';
import { randomUUID } from 'node:crypto';

export default fp(async function authPlugin(app) {
  const privateKey = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const publicKey  = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');

  await app.register(import('@fastify/jwt'), {
    secret: { private: privateKey, public: publicKey },
    sign: {
      algorithm: 'RS256',
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      expiresIn: '15m'
    },
    verify: {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    }
  });

  // Emisión (PoC). En prod lo normal es migrar a OAuth2 y quitar este endpoint.
  app.post('/auth/token', {
    schema: {
      tags: ['Auth'],
      summary: 'Emite un JWT RS256 (solo desarrollo)',
      body: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          clientSecret: { type: 'string' },
          scope: { type: 'array', items: { type: 'string' }, default: ['read.sql'] }
        },
        required: ['clientId', 'clientSecret']
      },
      response: {
        200: { $ref: 'TokenResponse#' },
        401: { type: 'object', properties: { ok: { type: 'boolean' }, error: { type: 'object' } } }
      }
    }
  }, async (req, reply) => {
    const { clientId, clientSecret, scope = ['read.sql'] } = req.body || {};
    if (clientId !== process.env.AUTH_CLIENT_ID || clientSecret !== process.env.AUTH_CLIENT_SECRET) {
      return reply.code(401).send({ ok:false, error:{ code:'UNAUTHENTICATED' } });
    }
    const token = app.jwt.sign({ sub: clientId, scope, jti: randomUUID() });
    return { access_token: token, token_type: 'Bearer', expires_in: 900 };
  });

  // Guards
  app.decorate('authRequired', async function (req, reply) {
    try { await req.jwtVerify(); }
    catch { return reply.code(401).send({ ok:false, error:{ code:'UNAUTHENTICATED' } }); }
  });

  app.decorate('requireScope', function(required) {
    return async function (req, reply) {
      const scopes = Array.isArray(req.user?.scope) ? req.user.scope : [];
      if (!scopes.includes(required)) return reply.code(403).send({ ok:false, error:{ code:'FORBIDDEN' } });
    };
  });
});
