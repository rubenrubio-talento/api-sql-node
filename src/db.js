import sql from 'mssql';

const baseConfig = (user, password) => ({
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  user,
  password,
  options: {
    encrypt: String(process.env.DB_ENCRYPT || 'true') === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERT || 'false') === 'true',
    enableArithAbort: true
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
});

export const pools = {
  ro: new sql.ConnectionPool(baseConfig(process.env.DB_USER_RO, process.env.DB_PASS_RO)),
  ops: new sql.ConnectionPool(baseConfig(process.env.DB_USER_OPS, process.env.DB_PASS_OPS))
};

export async function initPools(app) {
  app.log.info('Conectando a la base de datos');
  await pools.ro.connect();
  await pools.ops.connect();
  app.log.info('SQL conectado');
}

export { sql };
