/**
 * All Claude prompts centralized here.
 * Never hardcode prompts in module files — import from here.
 */

// ── SEO Engine Prompts ──────────────────────────────────────────────

export const SEO_PROMPTS = {
  vs_competitor: (competitor) => `
Eres un experto en SEO y copywriting de SaaS.
Crea el contenido completo para una página de comparativa SEO optimizada.

Producto nuestro: LinkVault — tracker de enlaces para creadores y marketers independientes.
Competidor: ${competitor}
URL destino: /linkvault-vs-${competitor}

Genera un JSON con esta estructura exacta:
{
  "title": "SEO title tag (max 60 chars)",
  "meta_description": "Meta description (max 155 chars)",
  "h1": "H1 de la página",
  "hero_text": "Párrafo de introducción (2-3 frases)",
  "comparison_table": {
    "features": ["Feature 1", "Feature 2", ...],
    "linkvault": [true/false o "texto corto", ...],
    "competitor": [true/false o "texto corto", ...]
  },
  "linkvault_advantages": ["Ventaja 1", "Ventaja 2", "Ventaja 3"],
  "when_to_choose_us": "Párrafo sobre cuándo elegir LinkVault (2-3 frases)",
  "cta_text": "Texto del botón de llamada a la acción",
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

IMPORTANTE:
- Tono profesional pero directo
- Mencionar que LinkVault es más barato para features equivalentes
- Enfocarse en el nicho de creadores y marketers independientes
- Las respuestas FAQ deben ser útiles para SEO (responder búsquedas reales)
- Responde SOLO con el JSON, sin texto adicional
`,

  how_to_track: (platform) => `
Eres un experto en SEO y marketing de afiliados.
Crea contenido para una guía SEO.

Tema: Cómo trackear enlaces en ${platform}
Producto a mencionar: LinkVault (tracker de enlaces para creadores)

Genera un JSON:
{
  "title": "SEO title (max 60 chars)",
  "meta_description": "Meta description (max 155 chars)",
  "h1": "H1 de la página",
  "intro": "Introducción que explica el problema (2-3 frases)",
  "steps": [
    {"title": "Paso 1", "content": "Explicación detallada"},
    ...
  ],
  "why_tracking_matters": "Párrafo sobre por qué es importante trackear en esta plataforma",
  "linkvault_section": {
    "heading": "Cómo LinkVault simplifica el tracking en ${platform}",
    "content": "2-3 frases sobre cómo LinkVault resuelve esto específicamente"
  },
  "cta_text": "Texto CTA",
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Responde SOLO con el JSON.
`,

  for_usecase: (usecase) => `
Crea una landing page SEO para LinkVault dirigida a: ${usecase}

LinkVault es un tracker de enlaces para creadores y marketers independientes.
Características clave: analytics en tiempo real, tracking por fuente, exportación CSV,
links personalizados, dashboard compartible.

Genera un JSON:
{
  "title": "SEO title (max 60 chars)",
  "meta_description": "(max 155 chars)",
  "h1": "H1 de la página",
  "hero_headline": "Headline principal de la hero section",
  "hero_subheadline": "Subheadline (1-2 frases)",
  "pain_points": ["Dolor 1", "Dolor 2", "Dolor 3"],
  "solutions": [
    {"feature": "Feature de LinkVault", "benefit": "Beneficio concreto para ${usecase}"},
    ...
  ],
  "social_proof_placeholder": "Texto placeholder para testimonios",
  "cta_primary": "CTA principal",
  "cta_secondary": "CTA secundario",
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Responde SOLO con el JSON.
`,
};

// ── Outreach Prompts ────────────────────────────────────────────────

export const OUTREACH_PROMPTS = {
  emailSequence: (lead, emailNum) => `
Eres el fundador de LinkVault, un tracker de enlaces para creadores y marketers.
Escribe el email ${emailNum} de 3 de una secuencia de outreach en frío.

Datos del lead:
- Nombre: ${lead.name}
- Rol/Plataforma: ${lead.role || lead.platform}
- Empresa/Canal: ${lead.company || 'su canal'}
- Audiencia estimada: ${lead.audience_size ? `${lead.audience_size} seguidores` : 'no disponible'}
- Bio: ${lead.bio_summary || 'no disponible'}
- Tipo de lead: ${lead.lead_type} (beta tester / afiliado)

Objetivos por email:
Email 1: Presentarte, mencionar el problema que resuelves, invitar a beta gratuita.
Email 2: Follow-up con dato concreto sobre su nicho + caso de uso específico para él.
Email 3: Último intento. Oferta concreta: 3 meses gratis del plan Creator si se registra esta semana.

Reglas:
- Máximo 80 palabras por email
- Sin saludos genéricos ("Espero que estés bien")
- Primera frase: referencia específica a ellos (su contenido, su nicho, su plataforma)
- Sin lenguaje corporativo
- Sin frases como "me pongo en contacto" o "no dude en contactarme"
- Firmar como: [Tu nombre], fundador de LinkVault

Responde con JSON:
{
  "subject": "Asunto del email",
  "body": "Cuerpo del email en texto plano"
}
`,
};

// ── Content Engine Prompts ──────────────────────────────────────────

export const CONTENT_PROMPTS = {
  dailyContent: (topic) => `
Eres el community manager de LinkVault, tracker de enlaces para creadores y marketers.
Genera contenido para hoy sobre el tema: ${topic}

Genera un JSON:
{
  "twitter_thread": {
    "tweets": [
      "Tweet 1 (máx 280 chars)",
      "Tweet 2",
      "Tweet 3",
      "Tweet 4 (CTA: prueba LinkVault gratis)"
    ]
  },
  "linkedin_post": {
    "content": "Post de LinkedIn (150-250 palabras, sin hashtags excesivos)",
    "hook": "Primera línea que genere curiosidad"
  }
}

Reglas de tono:
- Datos concretos cuando sea posible (inventar si no hay reales, pero creíbles)
- Sin florituras ni motivación vacía
- Técnico pero accesible
- La mención a LinkVault debe ser natural, no forzada
- Responde SOLO con el JSON
`,
};
