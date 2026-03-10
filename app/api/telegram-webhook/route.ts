import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramReply } from '@/lib/telegram';

/**
 * POST /api/telegram-webhook
 * Telegram Bot webhook handler.
 * Processes /start <linkCode> commands to link Telegram accounts.
 */
export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Only handle message updates
    const message = update?.message;
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const firstName = message.from?.first_name || 'there';

    // Handle /start <linkCode> command
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const linkCode = parts[1];

      if (!linkCode) {
        // Plain /start without a code
        await sendTelegramReply(
          chatId,
          `👋 Hi <b>${firstName}</b>!\n\n` +
          `Welcome to <b>StepZen Bot</b>.\n\n` +
          `To link your account, please visit our website and click "Verify via Telegram" during signup. ` +
          `You'll be redirected back here with a linking code.\n\n` +
          `🌐 <a href="https://stepzen.com/signup">stepzen.com/signup</a>`
        );
        return NextResponse.json({ ok: true });
      }

      // Look up the link code
      const telegramLink = await prisma.telegramLink.findUnique({
        where: { linkCode },
      });

      if (!telegramLink) {
        await sendTelegramReply(
          chatId,
          '❌ Invalid or expired link code. Please go back to StepZen and try again.'
        );
        return NextResponse.json({ ok: true });
      }

      // Check expiry
      if (new Date() > telegramLink.expiresAt) {
        await sendTelegramReply(
          chatId,
          '⏰ This link code has expired. Please go back to StepZen and generate a new one.'
        );
        return NextResponse.json({ ok: true });
      }

      // Check if already linked
      if (telegramLink.chatId) {
        await sendTelegramReply(
          chatId,
          '✅ This code has already been used. You can go back to StepZen to continue.'
        );
        return NextResponse.json({ ok: true });
      }

      // Link the Telegram account
      await prisma.telegramLink.update({
        where: { linkCode },
        data: { chatId },
      });

      await sendTelegramReply(
        chatId,
        `✅ <b>Account linked!</b>\n\n` +
        `Great job, <b>${firstName}</b>! Your Telegram is now connected.\n\n` +
        `🔙 Go back to StepZen to receive your verification code here.`
      );

      return NextResponse.json({ ok: true });
    }

    // Handle any other message
    await sendTelegramReply(
      chatId,
      `👋 Hi <b>${firstName}</b>! I'm the StepZen verification bot.\n\n` +
      `Use the link from our website to get started.`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
