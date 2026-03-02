# LinkVault Automation System

## Contexto del proyecto
LinkVault es un tracker de enlaces para creadores y marketers independientes.
Competimos con Bitly pero nos enfocamos en creadores independientes que venden
cursos, hacen afiliados y necesitan saber qué enlace convierte.

**Estado actual:** MVP en desarrollo. No tenemos producto live todavía.
**Objetivo:** Automatizar distribución, generación de leads y SEO ANTES de lanzar.

## Stack tecnológico
- Runtime: Node.js 20+
- Base de datos: Supabase (Postgres)
- LLM: Claude API (claude-sonnet-4-20250514)
- Email: Resend
- Deploy SEO: Vercel + Next.js
- Queue: Bull + Redis
- Scheduler: node-cron

## Módulos y prioridades

### MÓDULO 1: SEO Engine (ejecutar HOY)
Genera páginas SEO programático para posicionarnos mientras desarrollamos el MVP.
- Archivo principal: modules/01-seo-engine/generator.js
- Genera 40+ páginas automáticamente
- Las despliega en Vercel con landing de "lista de espera"

### MÓDULO 2: Outreach Engine (ejecutar HOY)
Encuentra leads cualificados y les envía secuencia de emails personalizada.
- Archivo principal: modules/02-outreach-engine/index.js
- Fuentes: Apollo.io API + Hunter.io + YouTube Data API
- Secuencia: 3 emails en 9 días, personalizados con Claude

### MÓDULO 3: Content Engine (ejecutar al lanzar)
Publica contenido automático en X y LinkedIn.
- Archivo principal: modules/03-content-engine/index.js
- Genera y programa posts diarios

### MÓDULO 4: Metrics Dashboard (ejecutar al lanzar)
Agrega métricas de todas las fuentes en un dashboard.
- Archivo principal: modules/04-metrics-dashboard/index.js

## Reglas de desarrollo
1. Cada módulo debe ser independiente y ejecutable por separado
2. Todos los prompts de Claude están en /shared/prompts.js — nunca hardcoded
3. Usar variables de entorno para todas las API keys
4. Logging detallado en cada operación
5. Rate limiting en todas las llamadas a APIs externas
6. Si algo falla, continuar con el siguiente item (nunca parar el batch)

## Base de datos — Schema
Ver /infrastructure/schema.sql para el schema completo.
Las tablas principales son: seo_pages, leads, email_sequences, content_queue, metrics

## Comandos principales
- npm run seo:generate     → genera todas las páginas SEO
- npm run seo:deploy       → despliega en Vercel
- npm run outreach:scrape  → encuentra nuevos leads
- npm run outreach:prepare → prepara secuencias de email
- npm run outreach:send    → envía emails pendientes
- npm run content:generate → genera contenido para redes
- npm run content:publish  → publica contenido programado
- npm run metrics:collect  → agrega métricas del día
- npm run setup            → configura todo desde cero
