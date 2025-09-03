import 'dotenv/config';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swaggerPlugin from './swagger.js';
import authPlugin from './auth.js';
import routes from './routes.js';
import { initPools } from './db.js';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: [
      'req.headers.authorization',
      'headers.authorization',
      'body.clientSecret',
      '*.password',
      '*.token',
      '*.access_token'
    ]
  },
  trustProxy: true,
  bodyLimit: 512 * 1024 // 512 KB
});

// Seguridad HTTP
await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' }
});

// Rate limit (clave por token si hay, si no por IP)
await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.headers['authorization'] || req.ip
});

// Swagger opcional
if (String(process.env.ENABLE_SWAGGER || 'false') === 'true') {
  app.log.warn('Swagger UI HABILITADO. No lo expongas en producción.');
  app.register(swaggerPlugin);
} else {
  // aun así registramos los schemas OpenAPI base
  app.register(swaggerPlugin, { ui: false });
}

// Auth + rutas
app.register(authPlugin);
app.register(routes);

// Timeouts de servidor
app.server.headersTimeout = 65_000;
app.server.requestTimeout = 30_000;
app.server.keepAliveTimeout = 10_000;

// Manejador de errores sobrio
app.setErrorHandler((err, req, reply) => {
  const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  app.log.error({ err, traceId: req.id });
  reply.code(status).send({
    ok: false,
    error: {
      code: status === 401 ? 'UNAUTHENTICATED'
           : status === 403 ? 'FORBIDDEN'
           : status === 404 ? 'NOT_FOUND'
           : status === 429 ? 'RATE_LIMITED'
           : 'INTERNAL',
      message: status < 500 ? err.message : 'Unexpected error',
      traceId: req.id
    }
  });
});

(async () => {
  try {
    await initPools(app);
    await app.listen({ port: Number(process.env.PORT || 8080), host: '0.0.0.0' });
    app.log.info(`API lista en http://localhost:${process.env.PORT || 8080}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
