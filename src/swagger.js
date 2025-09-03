import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { queryNames, opNames } from './catalog.js';
import YAML from 'yaml';
import fs from 'node:fs';

export default fp(async function swaggerPlugin(app, opts) {
  // Schemas base para $ref
  app.addSchema({
    $id: 'TokenResponse',
    type: 'object',
    properties: {
      access_token: { type: 'string' },
      token_type:   { type: 'string', enum: ['Bearer'] },
      expires_in:   { type: 'integer' }
    },
    required: ['access_token', 'token_type', 'expires_in']
  });
  app.addSchema({
    $id: 'ReadQueryBody',
    type: 'object',
    properties: {
      q:        { type: 'string', enum: queryNames },
      params:   { type: 'object', additionalProperties: true },
      page:     { type: 'integer', minimum: 1, default: 1 },
      pageSize: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
      timeoutMs:{ type: 'integer', minimum: 100, maximum: 60000, default: 8000 }
    },
    required: ['q']
  });

app.addSchema({
  $id: 'ReadQueryResponse',
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true
      }
    },
    page: { type: 'integer', minimum: 1 },
    pageSize: { type: 'integer', minimum: 1, maximum: 1000 },
    total: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
    meta: { type: 'object', additionalProperties: true }
  },
  required: ['ok', 'data', 'page', 'pageSize', 'meta']
});

  app.addSchema({
    $id: 'CmdRunBody',
    type: 'object',
    properties: {
      op:        { type: 'string', enum: opNames },
      args:      { type: 'object', additionalProperties: true },
      timeoutMs: { type: 'integer', minimum: 100, maximum: 60000, default: 8000 }
    },
    required: ['op']
  });

app.addSchema({
  $id: 'CmdRunResponse',
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    data: {
      anyOf: [
        { type: 'object', additionalProperties: true },
        { type: 'null' }
      ]
    },
    meta: { type: 'object', additionalProperties: true }
  },
  required: ['ok', 'meta']
});


  await app.register(swagger, {
    openapi: {
      info: { title: 'Internal SQL API', version: '1.0.0' },
      servers: [{ url: `http://localhost:${process.env.PORT || 8080}` }],
      components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
      },
      security: [{ bearerAuth: [] }]
    }
  });

  if (opts?.ui !== false && String(process.env.ENABLE_SWAGGER || 'false') === 'true') {
    await app.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: false },
      staticCSP: true
    });
  }

  // Export a disco (siempre útil para conectores)
  app.addHook('onReady', async () => {
    const spec = app.swagger();
    try {
      fs.writeFileSync('openapi.json', JSON.stringify(spec, null, 2));
      fs.writeFileSync('openapi.yaml', YAML.stringify(spec));
      app.log.info('OpenAPI exportado a openapi.json / openapi.yaml');
    } catch {
      app.log.warn('No se pudo escribir OpenAPI (opcional).');
    }
  });
});
