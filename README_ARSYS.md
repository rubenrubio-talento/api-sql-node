# Handoff Arsys (VPS/Dedicado) – API `talento/procesos`

Este paquete permite a Sistemas desplegar la API en un servidor Arsys **sin tocar código**.
Requisitos: Ubuntu 22.04+, DNS del dominio apuntando a la IP del servidor, puertos 80/443 abiertos.

## Pasos para Sistemas
1) Docker y Compose
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   # re-login para aplicar el grupo
   ```
2) DNS
   - Crear A/AAAA: `api.empresa.local` → IP del servidor.
3) Variables
   - `cp .env.example .env.prod` y completar valores.
   - `./scripts/generate_jwt_keys.sh` y pegar PEMs escapadas en `.env.prod`.
   - Poner `AUTH_CLIENT_SECRET` robusto.
4) Despliegue
   ```bash
   docker compose up -d
   ```
5) Verificación
   ```bash
   ./scripts/smoke_test.sh https://api.empresa.local/talento/procesos/healthz
   docker logs -f internal-sql-api
   ```
6) Operación
   - Reiniciar API: `docker restart internal-sql-api`
   - Logs proxy: `docker logs -f reverse-proxy`

## Seguridad
- `ENABLE_SWAGGER=false` en prod. Si se habilita, proteger `/docs` en el proxy.
- BBDD: `DB_ENCRYPT=true` y `DB_TRUST_SERVER_CERT=false` con CA corporativa.
- CORS: limitar `CORS_ORIGIN` a dominios clientes reales.

## Notas
- Si la BBDD está en otro servidor, usar FQDN/IP alcanzable desde Arsys (VPN/red privada/pública con allowlist y TLS).
- TLS: Caddy gestiona certs Let’s Encrypt automáticamente (si DNS → servidor y puertos abiertos).
