const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramJob {
  title: string;
  companyName: string;
  description: string;
  telegramLink: string;
  telegramBannerUrl?: string | null; // base64 data URI when present
  jobType?: string | null;
  duration?: string | null;
  stipend?: string | null;
  skills?: string[];
  location?: { name: string } | null;
  category?: { name: string } | null;
}

/**
 * Format job details into an HTML message for Telegram.
 */
function formatJobMessage(job: TelegramJob): string {
  const lines: string[] = [];

  lines.push(`🚀 <b>${escapeHtml(job.title)}</b>`);
  lines.push(`🏢 <b>${escapeHtml(job.companyName)}</b>`);
  lines.push('');

  if (job.location?.name || job.jobType) {
    const parts: string[] = [];
    if (job.location?.name) parts.push(`📍 ${escapeHtml(job.location.name)}`);
    if (job.jobType) parts.push(`💼 ${escapeHtml(job.jobType)}`);
    lines.push(parts.join('  •  '));
  }

  if (job.category?.name) {
    lines.push(`📂 ${escapeHtml(job.category.name)}`);
  }

  lines.push('');

  // Description (truncated to 500 chars for readability)
  const desc = job.description.length > 500
    ? job.description.slice(0, 497) + '...'
    : job.description;
  lines.push(escapeHtml(desc));

  lines.push('');

  if (job.duration) {
    lines.push(`⏱ <b>Duration:</b> ${escapeHtml(job.duration)}`);
  }
  if (job.stipend) {
    lines.push(`💰 <b>Stipend:</b> ${escapeHtml(job.stipend)}`);
  }

  if (job.skills && job.skills.length > 0) {
    const tags = job.skills.map(s => `#${s.replace(/\s+/g, '_')}`).join(' ');
    lines.push('');
    lines.push(tags);
  }

  lines.push('');
  lines.push(`📩 <a href="${escapeHtml(job.telegramLink)}">Apply Now</a>`);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━');
  lines.push('🔔 Follow <b>StepZen</b> for more internships!');

  return lines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send a job posting to the Telegram channel.
 * If the job has a banner (base64 data URI), sends it as a photo via multipart upload.
 * Otherwise sends a text-only message.
 */
export async function sendJobToTelegram(job: TelegramJob): Promise<void> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn('[Telegram] Bot token or channel ID not configured. Skipping send.');
    return;
  }

  const message = formatJobMessage(job);

  try {
    if (job.telegramBannerUrl) {
      // Fetch the image from Supabase Storage URL
      const imageRes = await fetch(job.telegramBannerUrl);
      if (!imageRes.ok) {
        console.warn('[Telegram] Failed to fetch banner image, falling back to text-only.');
        await sendTextMessage(message);
        return;
      }

      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

      // Determine file extension from content type
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      const ext = extMap[contentType] || 'jpg';

      // Build multipart/form-data manually
      const boundary = `----TelegramBotBoundary${Date.now()}`;
      const parts: Buffer[] = [];

      // chat_id field
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${CHANNEL_ID}\r\n`
      ));

      // caption field
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${message}\r\n`
      ));

      // parse_mode field
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`
      ));

      // photo file field
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="banner.${ext}"\r\nContent-Type: ${contentType}\r\n\r\n`
      ));
      parts.push(buffer);
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

      const bodyBuffer = Buffer.concat(parts);

      const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: bodyBuffer,
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('[Telegram] sendPhoto failed:', err);
      }
    } else {
      await sendTextMessage(message);
    }
  } catch (err) {
    console.error('[Telegram] Failed to send message:', err);
  }
}

async function sendTextMessage(text: string): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('[Telegram] sendMessage failed:', err);
  }
}

// ─── Telegram Bot OTP Functions ──────────────────────────────────────

/**
 * Send an OTP code to a user via Telegram bot DM.
 */
export async function sendTelegramOtp(chatId: string, code: string): Promise<void> {
  if (!BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const message = [
    '🔐 <b>StepZen Verification Code</b>',
    '',
    `Your code is:`,
    '',
    `<code>${code}</code>`,
    '',
    '⏱ This code expires in <b>5 minutes</b>.',
    '',
    '━━━━━━━━━━━━━━━━━━━',
    'If you didn\'t request this, please ignore this message.',
  ].join('\n');

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('[Telegram] sendOtp failed:', err);
    throw new Error('Failed to send OTP via Telegram');
  }
}

/**
 * Send a reply message to a Telegram user (used during linking flow).
 */
export async function sendTelegramReply(chatId: string, text: string): Promise<void> {
  if (!BOT_TOKEN) return;

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

