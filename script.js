document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('serviceForm');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const phoneInput = document.getElementById('phone');

    // ID чатов для разных специалистов
    const SPECIALIST_CHATS = {
        'Автоэлектрик': '372812183', // Замените на ID чата автоэлектрика
        'Юрист': 'CHAT_ID_LAWYER', // Замените на ID чата юриста
        'Грузовые машины': 'CHAT_ID_TRUCKS' // Замените на ID чата специалиста по грузовикам
    };

    // Обработка ввода телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Оставляем только цифры

        // Если первая цифра не 8, очищаем поле
        if (value.length > 0 && value[0] !== '8') {
            value = '';
        }

        // Ограничиваем длину до 11 цифр
        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        e.target.value = value;
    });

    // Валидация телефона при отправке
    form.addEventListener('submit', function(e) {
        const phone = phoneInput.value;
        if (phone.length !== 11 || phone[0] !== '8') {
            e.preventDefault();
            alert('Пожалуйста, введите корректный номер телефона (11 цифр, начиная с 8)');
            return;
        }
    });

    // Заполняем список годов
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1980; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Токен бота
    const BOT_TOKEN = '7846913510:AAGw8ZQNutYVSNfVJwqdyQ8jH7naUrcMZ0I';
    const DEFAULT_CHAT_ID = 'YOUR_DEFAULT_CHAT_ID'; // ID чата по умолчанию
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            organization: document.getElementById('organization').value,
            phone: document.getElementById('phone').value,
            specialist: document.getElementById('specialist').value,
            vin: document.getElementById('vin').value,
            year: document.getElementById('year').value,
            description: document.getElementById('description').value
        };

        const message = formatMessage(formData);

        try {
            // Определяем ID чата в зависимости от выбранного специалиста
            const chatId = formData.specialist ? SPECIALIST_CHATS[formData.specialist] || DEFAULT_CHAT_ID : DEFAULT_CHAT_ID;

            const response = await fetch(TELEGRAM_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            if (response.ok) {
                form.reset();
                successModal.show();
            } else {
                throw new Error('Ошибка отправки сообщения');
            }
        } catch (error) {
            alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
            console.error('Error:', error);
        }
    });
});

function formatMessage(data) {
    return `
<b>Новая заявка на обслуживание</b>

<b>Имя:</b> ${data.name}
<b>Организация:</b> ${data.organization || 'Не указано'}
<b>Телефон:</b> ${data.phone}
<b>Специалист:</b> ${data.specialist || 'Не указано'}
<b>VIN авто:</b> ${data.vin || 'Не указано'}
<b>Год авто:</b> ${data.year || 'Не указано'}

<b>Описание проблемы:</b>
${data.description || 'Не указано'}
    `.trim();
}