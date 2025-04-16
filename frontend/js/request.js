// Обработчик формы запроса помощи
document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.querySelector('.request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(requestForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            try {
                const response = await fetch(buildApiUrl('/requests'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast(
                        'Успешно',
                        'Ваш запрос отправлен. Мы свяжемся с вами в ближайшее время.',
                        'success'
                    );
                    requestForm.reset();
                } else {
                    const errorData = await response.json();
                    showToast(
                        'Ошибка',
                        errorData.error || 'Произошла ошибка при отправке запроса',
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error:', error);
                showToast(
                    'Ошибка',
                    'Произошла ошибка при отправке запроса',
                    'error'
                );
            }
        });
    }
}); 