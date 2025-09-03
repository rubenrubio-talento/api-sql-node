export const QUERIES = new Map([
  // 1) Obtener todos los documentos
  ['get_all_docs', `
    SELECT id, estadoFirma, tipo, usuario, responsable, fechaEnvio, fechaFirmaUsuario,fechaFirmaResponsable
    FROM dbo.Documentos
    ORDER BY fechaEnvio DESC
  `],

  // 2) Obtener documento por ID
  ['get_doc_by_id', `
    SELECT id, estadoFirma, tipo, usuario, responsable, fechaEnvio, fechaFirmaUsuario,fechaFirmaResponsable
    FROM dbo.Documentos
    WHERE id = @id
  `],

  // 3) Obtener documentos por tipo
  ['get_docs_by_tipo', `
    SELECT id, estadoFirma, tipo, usuario, responsable, fechaEnvio, fechaFirmaUsuario,fechaFirmaResponsable
    FROM dbo.Documentos
    WHERE tipo = @tipo
    ORDER BY fechaEnvio DESC
  `],

  // 4) Obtener documentos por estado
  ['get_docs_by_estado', `
    SELECT id, estadoFirma, tipo, usuario, responsable, fechaEnvio, fechaFirmaUsuario,fechaFirmaResponsable
    FROM dbo.Documentos
    WHERE estadoFirma = @estado
    ORDER BY fechaEnvio DESC
  `],

  // 5) Insertar nuevo documento
  ['insert_doc', `
    INSERT INTO dbo.Documentos (id, estadoFirma, tipo, usuario, responsable, fechaEnvio)
    VALUES (@id, @estadoFirma, @tipo, @usuario, @responsable, GETDATE())
  `],

  // 6) Actualizar estado
  ['update_estado', `
    UPDATE dbo.Documentos
    SET estadoFirma = @estado, fechaFirma = CASE WHEN @estado = 'firmado' THEN GETDATE() ELSE NULL END
    WHERE id = @id
  `],

  // 8) Eliminar documento
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
