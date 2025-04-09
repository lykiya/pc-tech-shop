// Функция для обновления UI в зависимости от авторизации
function updateAuthUI() {
    console.log('Updating auth UI...');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userDisplayName = document.getElementById('userDisplayName');
    const loginLink = document.querySelector('.login-link');
    const userMenu = document.querySelector('.user-menu');
    const adminPanelLink = document.querySelector('.admin-panel-link');

    console.log('User data:', user);
    console.log('Token:', token);

    if (user && token) {
        console.log('User is authenticated');
        if (userDisplayName) {
            const userName = user.name || user.email || 'Пользователь';
            console.log('Setting user name to:', userName);
            userDisplayName.textContent = userName;
        }
        if (loginLink) {
            loginLink.style.display = 'none';
        }
        if (userMenu) {
            userMenu.style.display = 'block';
        }
        if (adminPanelLink) {
            adminPanelLink.style.display = user.role === 'admin' ? 'block' : 'none';
        }
    } else {
        console.log('User is not authenticated');
        if (userDisplayName) {
            userDisplayName.textContent = '';
        }
        if (loginLink) {
            loginLink.style.display = 'block';
        }
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        if (adminPanelLink) {
            adminPanelLink.style.display = 'none';
        }
    }
}

// Функция для проверки авторизации
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Функция для проверки роли администратора
function checkAdminRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin';
}

// Функция для обновления количества товаров в корзине
async function updateCartCount() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            document.querySelector('.cart-count').textContent = '0';
            return;
        }

        const response = await fetch('http://localhost:8080/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const cartItems = await response.json();
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelector('.cart-count').textContent = totalItems;
        } else {
            document.querySelector('.cart-count').textContent = '0';
        }
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.cart-count').textContent = '0';
    }
}

// Функция для добавления товара в корзину
async function addToCart(productId) {
    try {
        const token = checkAuth();
        if (!token) return;

        // Определяем тип товара на основе текущей страницы
        const isBuildPage = window.location.pathname.includes('builds.html');
        const type = isBuildPage ? 'build' : 'product';

        const response = await fetch('http://localhost:8080/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pcbuild_id: parseInt(productId),
                quantity: 1,
                type: type
            })
        });

        if (response.ok) {
            showToast(
                'Успешно',
                'Товар добавлен в корзину',
                'success'
            );
            updateCartCount();
        } else {
            const data = await response.json();
            showToast(
                'Ошибка',
                data.error || 'Ошибка при добавлении в корзину',
                'error'
            );
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showToast(
            'Ошибка',
            'Произошла ошибка при добавлении в корзину',
            'error'
        );
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    updateAuthUI();
    updateCartCount();
    
    // Добавляем обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout clicked');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Добавляем обработчик для выпадающего меню
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = userMenu.querySelector('.user-dropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Закрываем меню при клике вне его
        document.addEventListener('click', () => {
            const dropdown = userMenu.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });
    }
});

// Обновляем UI при изменении localStorage
window.addEventListener('storage', () => {
    console.log('Storage event triggered');
    updateAuthUI();
}); 