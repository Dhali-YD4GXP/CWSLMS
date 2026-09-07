// Fungsi untuk mengirim pesan ke Discord atau Telegram via Webhook
export const sendWebhookNotification = async (message: string) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Webhook URL tidak dikonfigurasi di file .env');
    return;
  }

  try {
    if (webhookUrl.includes('discord.com')) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    } else if (webhookUrl.includes('api.telegram.org')) {
      const chatId = process.env.TELEGRAM_CHAT_ID;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });
    } else {
      // Generic JSON webhook
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    }
    console.log('Webhook notifikasi berhasil dikirim.');
  } catch (error) {
    console.error('Gagal mengirim webhook notifikasi:', error);
  }
};
