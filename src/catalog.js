export const QUERIES = new Map([
  ['get_all_docs', `
    SELECT *
    FROM dbo.Documentos
    ORDER BY fechaEnvio DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `]
]);


export const OPS = new Map([
 ['create_order', 'dbo.sp_create_order']
]);


export const queryNames = Array.from(QUERIES.keys());
export const opNames = Array.from(OPS.keys());
