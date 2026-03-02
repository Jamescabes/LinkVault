import 'dotenv/config';
import { Resend } from 'resend';
import { askClaudeJSON } from '../../shared/claude.js';
import { supabase } from '../../shared/supabase.js';
import { logger } from '../../shared/logger.js';
import { OUTREACH_PROMPTS } from '../../shared/prompts.js';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ── GENERACIÓN DE EMAILS CON CLAUDE ─────────────────────────────────

async function generateEmailSequence(lead) {
  const emails = [];

  for (let emailNum = 1; emailNum <= 3; emailNum++) {
    try {
      const email = await askClaudeJSON(
        OUTREACH_PROMPTS.emailSequence(lead, emailNum),
        { max_tokens: 500 },
      );

      // Calcular fecha de envío
      const daysDelay = emailNum === 1 ? 0 : emailNum === 2 ? 4 : 9;
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + daysDelay);

      emails.push({
        lead_id: lead.id,
        sequence_number: emailNum,
        subject: email.subject,
        body: email.body,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      });
    } catch (err) {
      logger.error(`Failed to generate email ${emailNum}/3 for ${lead.email}: ${err.message}`);
    }
  }

  return emails;
}

// ── PREPARAR SECUENCIAS PARA LEADS NUEVOS ───────────────────────────

async function prepareNewLeads() {
  // Obtener leads nuevos sin secuencia asignada
  const { data: newLeads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'new')
    .gte('score', 50) // Solo leads con score suficiente
    .limit(20);

  if (error) {
    logger.error(`Failed to fetch new leads: ${error.message}`);
    return;
  }

  logger.info(`Preparing sequences for ${newLeads?.length || 0} new leads`);

  for (const lead of newLeads || []) {
    const emails = await generateEmailSequence(lead);

    if (emails.length > 0) {
      const { error: insertError } = await supabase
        .from('email_sequences')
        .insert(emails);

      if (insertError) {
        logger.error(`Failed to insert sequences for ${lead.email}: ${insertError.message}`);
        continue;
      }

      await supabase
        .from('leads')
        .update({ status: 'sequence_ready' })
        .eq('id', lead.id);

      logger.info(`✓ Sequence ready for: ${lead.email}`);
    }

    await new Promise((r) => setTimeout(r, 1500)); // Rate limiting
  }
}

// ── ENVIAR EMAILS PROGRAMADOS ────────────────────────────────────────

async function sendScheduledEmails() {
  if (!resend) {
    logger.warn('RESEND_API_KEY not set — skipping email sending');
    return;
  }

  const now = new Date().toISOString();

  const { data: pending, error } = await supabase
    .from('email_sequences')
    .select('*, leads(*)')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(50); // Máx 50 emails por ejecución

  if (error) {
    logger.error(`Failed to fetch pending emails: ${error.message}`);
    return;
  }

  logger.info(`Sending ${pending?.length || 0} scheduled emails`);

  for (const seq of pending || []) {
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'hola@linkvault.io',
        to: seq.leads.email,
        subject: seq.subject,
        text: seq.body,
        headers: {
          'X-Sequence-Id': seq.id,
          'X-Lead-Id': seq.lead_id,
        },
      });

      await supabase
        .from('email_sequences')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', seq.id);

      await supabase
        .from('leads')
        .update({ status: 'contacted', last_contact_at: new Date().toISOString() })
        .eq('id', seq.lead_id);

      logger.info(`✓ Sent email ${seq.sequence_number}/3 to ${seq.leads.email}`);

      // Delay entre emails para evitar spam filters
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      logger.error(`✗ Failed to send to ${seq.leads.email}: ${err.message}`);
    }
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────

async function run() {
  const mode = process.argv[2];

  if (mode === '--prepare') {
    await prepareNewLeads();
  } else if (mode === '--send') {
    await sendScheduledEmails();
  } else {
    // Default: prepare then send
    await prepareNewLeads();
    await sendScheduledEmails();
  }
}

run();
