document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('serviceForm');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const phoneInput = document.getElementById('phone');

    // ID чатов для разных специалистов
    const SPECIALIST_CHATS = {
        'Автоэлектрик': '372812183', // ID чата автоэлектрика
        'Юрист': 'CHAT_ID_LAWYER', // ID чата юриста
        'Грузовые машины': 'CHAT_ID_TRUCKS' // ID чата специалиста по грузовикам
    };

    // Обработка ввода телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0 && value[0] !== '8') {
            value = '';
        }

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

    const DEFAULT_CHAT_ID = '372812183'; // ID чата по умолчанию

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Собираем данные формы и удаляем пробелы по краям
        const formData = {
            name: document.getElementById('name').value.trim(),
            organization: document.getElementById('organization').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            specialist: document.getElementById('specialist').value.trim(),
            vin: document.getElementById('vin').value.trim(),
            year: document.getElementById('year').value.trim(),
            description: document.getElementById('description').value.trim()
        };

        // Проверяем обязательные поля
        if (!formData.name || !formData.phone) {
            alert('Пожалуйста, заполните обязательные поля (имя и телефон)');
            return;
        }

        const message = formatMessage(formData);

        // Проверяем, что сообщение не пустое
        if (!message.trim()) {
            alert('Ошибка формирования сообщения. Пожалуйста, проверьте введенные данные.');
            return;
        }

        try {
            // Определяем ID чата в зависимости от выбранного специалиста
            const chatId = formData.specialist ? SPECIALIST_CHATS[formData.specialist] || DEFAULT_CHAT_ID : DEFAULT_CHAT_ID;

            console.log('Отправка данных:', { chatId, message }); // Логируем данные для отладки

            const response = await fetch('/api/send-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId: chatId,
                    message: message
                })
            });

            // Проверяем успешность запроса
            if (!response.ok) {
                let errorMessage = 'Ошибка отправки сообщения';

                try {
                    // Пытаемся получить JSON с деталями ошибки
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.details || errorMessage;
                } catch (jsonError) {
                    // Если ответ не является JSON, получаем текст ошибки
                    errorMessage = await response.text() || errorMessage;
                }

                throw new Error(errorMessage);
            }

            // Получаем данные только если запрос успешен
            const data = await response.json();
            console.log('Успешный ответ:', data);

            form.reset();
            successModal.show();
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            alert(`Произошла ошибка при отправке заявки: ${error.message}`);
        }
    });
});

function formatMessage(data) {
    // Форматируем сообщение с проверкой на пустые значения
    const message = `
<b>🔔 Новая заявка на обслуживание</b>

<b>👤 Имя:</b> ${data.name || 'Не указано'}
<b>🏢 Организация:</b> ${data.organization || 'Не указано'}
<b>📱 Телефон:</b> ${data.phone || 'Не указано'}
<b>👨‍🔧 Специалист:</b> ${data.specialist || 'Не указано'}
<b>🚗 VIN авто:</b> ${data.vin || 'Не указано'}
<b>📅 Год авто:</b> ${data.year || 'Не указано'}

<b>📝 Описание проблемы:</b>
${data.description || 'Не указано'}

<i>Заявка отправлена: ${new Date().toLocaleString('ru-RU')}</i>`;

    return message.trim();
}