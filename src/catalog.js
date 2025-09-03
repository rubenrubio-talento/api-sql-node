export const QUERIES = new Map([
  // Obtener todos los documentos con paginación
  ['get_all_docs', `
    SELECT *
    FROM dbo.Documentos
    ORDER BY fechaEnvio DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `],

  // Obtener un documento por ID
  ['get_doc_by_id', `
    SELECT *
    FROM dbo.Documentos
    WHERE id = @id
  `],

  // Obtener documentos por tipo
  ['get_docs_by_tipo', `
    SELECT *
    FROM dbo.Documentos
    WHERE tipo = @tipo
    ORDER BY fechaEnvio DESC
  `],

  // Obtener documentos por estadoFirma
  ['get_docs_by_estado', `
    SELECT *
    FROM dbo.Documentos
    WHERE estadoFirma = @estadoFirma
    ORDER BY fechaEnvio DESC
  `],

  // Actualizar estadoFirma
  ['update_estado_usuario', `
    UPDATE dbo.Documentos
    SET estadoFirma = @estadoFirma
    WHERE id = @id
  `],

  // Insertar un nuevo documento
  ['insert_doc', `
    INSERT INTO dbo.Documentos (id, tipo, estadoFirma, usuario, responsable, fechaEnvio)
    VALUES (@id, @tipo, @estadoFirma, @usuario, @responsable, SYSUTCDATETIME())
  `],

  // Eliminar un documento
  ['delete_doc', `
    DELETE FROM dbo.Documentos
    WHERE id = @id
  `]
]);

export const OPS = new Map([
 ['create_order', 'dbo.sp_create_order']
]);


export const queryNames = Array.from(QUERIES.keys());
export const opNames = Array.from(OPS.keys());
