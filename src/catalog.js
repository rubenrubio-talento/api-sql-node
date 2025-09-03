export const QUERIES = new Map([
  // lectura simple
  ['get_prefix', 'SELECT prefijo, idDocumento, nombreDeTabla FROM dbo.PrefijosDocumentos ORDER BY idDocumento'],
  // lectura de estado y responsable
  ['get_estado_responsable', 'SELECT doc_id, estadoFirma, responsable FROM dbo.Documentos WHERE doc_id = @doc_id'],
  // actualización de estado
  ['update_estado','UPDATE dbo.Documentos SET estadoFirma = @estado WHERE doc_id = @doc_id'],
]);

export const OPS = new Map([
 ['create_order', 'dbo.sp_create_order']
]);


export const queryNames = Array.from(QUERIES.keys());
export const opNames = Array.from(OPS.keys());
