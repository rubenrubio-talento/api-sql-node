import fp from 'fastify-plugin';
import { pools, sql } from './db.js';
import { QUERIES, OPS } from './catalog.js';

export default fp(async function routes(app) {
  const isStoredProcName = (def) => /^[\w.]+$/i.test(def);
  const paginate = (page = 1, pageSize = 100) => {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const s = Math.max(1, Math.min(1000, parseInt(pageSize, 10) || 100));
    return { page: p, pageSize: s, offset: (p - 1) * s };
  };
  const bindParams = (request, params = {}) => {
    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === undefined) request.input(k, sql.NVarChar, null);
      else request.input(k, v);
    }
  };

  // Health
  app.get('/healthz', async () => {
    await pools.ro.request().query('SELECT 1');
    return { ok: true };
  });

  // Lecturas (allowlist)
  app.post('/read/query', {
    preHandler: [app.authRequired, app.requireScope('read.sql')],
    schema: {
      tags: ['Read'],
      summary: 'Ejecuta una consulta predefinida (lectura)',
      security: [{ bearerAuth: [] }],
      body: { $ref: 'ReadQueryBody#' },
      response: { 200: { $ref: 'ReadQueryResponse#' } }
    }
  }, async (req, reply) => {
    const { q, params = {}, page = 1, pageSize = 100, timeoutMs = 8000 } = req.body || {};
    if (!q || !QUERIES.has(q)) return reply.code(400).send({ ok:false, error:{ code:'UNKNOWN_QUERY' } });

    const def = QUERIES.get(q);
    const { page: p, pageSize: s, offset } = paginate(page, pageSize);

    const r = pools.ro.request();
    r.input('offset', sql.Int, offset);
    r.input('limit',  sql.Int, s);
    bindParams(r, params);
    r.timeout = Math.max(1000, Math.min(60000, timeoutMs));

    const result = isStoredProcName(def) ? await r.execute(def) : await r.query(def);
    return { ok: true, data: result.recordset, page: p, pageSize: s, total: null, meta: { query: q, traceId: req.id } };
  });

  // Comandos (allowlist)
  app.post('/cmd/run', {
    preHandler: [app.authRequired, app.requireScope('cmd.sql')],
    schema: {
      tags: ['Command'],
      summary: 'Ejecuta una operación predefinida (comando)',
      security: [{ bearerAuth: [] }],
      body: { $ref: 'CmdRunBody#' },
      response: { 200: { $ref: 'CmdRunResponse#' } }
    }
  }, async (req, reply) => {
    const { op, args = {}, timeoutMs = 8000 } = req.body || {};
    if (!op || !OPS.has(op)) return reply.code(400).send({ ok:false, error:{ code:'UNKNOWN_OP' } });

    const def = OPS.get(op);
    const r = pools.ops.request();
    bindParams(r, args);
    r.timeout = Math.max(1000, Math.min(60000, timeoutMs));

    const result = isStoredProcName(def) ? await r.execute(def) : await r.query(def);
    return { ok: true, data: result.recordset?.[0] ?? null, meta: { op, traceId: req.id } };
  });
});
