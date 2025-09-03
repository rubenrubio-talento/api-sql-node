
USE DemoAPI;
GO
-- 1) Documento pendiente (sin firmas)
INSERT INTO dbo.Documentos
(id, tipo, estadoFirma, usuario, responsable, fechaEnvio, fechaFirmaUsuario, fechaFirmaResponsable)
VALUES
(NEWID(), N'nomina', N'pendiente', N'juan.perez@example.com', N'ana.garcia@example.com',
 '2025-09-01T10:00:00.000', NULL, NULL);

-- 2) Documento firmado (requiere fechaFirmaUsuario para pasar el CHECK)
INSERT INTO dbo.Documentos
(id, tipo, estadoFirma, usuario, responsable, fechaEnvio, fechaFirmaUsuario, fechaFirmaResponsable)
VALUES
(NEWID(), N'contrato', N'firmado', N'luis.lopez@example.com', N'maria.sanchez@example.com',
 '2025-09-02T09:30:00.000', '2025-09-02T12:15:00.000', NULL);
