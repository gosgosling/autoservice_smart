const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// Раздача статических файлов
app.use(express.static(path.join(__dirname)));

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Тестовый маршрут для проверки соединения
app.get('/api/test', (req, res) => {
    res.json({ status: 'ok', message: 'API работает корректно' });
});

// Endpoint для отправки сообщений в Telegram
app.post('/api/send-telegram', async(req, res) => {
    const BOT_TOKEN = '7846913510:AAGw8ZQNutYVSNfVJwqdyQ8jH7naUrcMZ0I';
    const { chatId, message } = req.body;

    // Проверяем наличие необходимых данных
    if (!chatId || !message) {
        return res.status(400).json({
            error: 'Отсутствуют обязательные параметры',
            details: 'Необходимо указать chatId и message'
        });
    }

    try {
        console.log('Отправка сообщения:', { chatId, message }); // Логируем данные для отладки

        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });

        console.log('Ответ от Telegram:', response.data); // Логируем ответ для отладки
        res.json(response.data);
    } catch (error) {
        console.error('Ошибка при отправке сообщения:');

        if (error.response) {
            console.error('Данные ошибки:', error.response.data);
            console.error('Статус ошибки:', error.response.status);
        } else if (error.request) {
            console.error('Ошибка запроса:', error.request);
        } else {
            console.error('Ошибка:', error.message);
        }

        // Отправляем более подробную информацию об ошибке
        res.status(500).json({
            error: 'Ошибка отправки сообщения',
            details: error.response && error.response.data ? error.response.data : error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});