function showToast(title, message, type = 'success') {
    // Создаем контейнер для уведомлений, если его нет
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Создаем уведомление
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Иконка в зависимости от типа
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <i class="fas fa-${icon} toast-icon"></i>
        <i class="fas fa-times toast-close"></i>
    `;

    // Добавляем уведомление в контейнер
    container.appendChild(toast);

    // Показываем уведомление
    setTimeout(() => toast.classList.add('show'), 100);

    // Обработчик закрытия
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });

    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (toast.classList.contains('show')) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
} 