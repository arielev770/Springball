const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const bot = new TelegramBot(token, { polling: true });

// Кнопка запуска игры при команде /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Нажми на кнопку ниже, чтобы запустить игру!', {
    reply_markup: {
      inline_keyboard: [[{ text: '🎮 Играть в Springball', web_app: { url: webAppUrl } }]]
    }
  });
});

// Создание ссылки на оплату Звездами (XTR)
app.post('/create-invoice', async (req, res) => {
  try {
    const title = req.body.title || 'Игровой бонус';
    const description = req.body.description || 'Покупка в игре Springball';
    const price = Number(req.body.price) || 1; // Цена в звездах

    const invoiceLink = await bot.createInvoiceLink(
      title,
      description,
      'payload_bonus',
      '', // Для Telegram Stars токен всегда пустой
      'XTR',
      [{ label: title, amount: price }]
    );

    res.json({ invoiceLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка создания счета' });
  }
});

// Обязательное подтверждение перед списанием звезд
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

// Сообщение после успешной оплаты
bot.on('successful_payment', (msg) => {
  bot.sendMessage(msg.chat.id, '✅ Оплата прошла успешно! Бонус активирован.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
