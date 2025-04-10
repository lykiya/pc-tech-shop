document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию и роль администратора
    if (!checkAuth() || !checkAdminRole()) {
        window.location.href = 'login.html';
        return;
    }

    // Получаем все элементы меню
    const menuItems = document.querySelectorAll('.admin-menu a');
    const contentSections = document.querySelectorAll('.admin-content > div');

    // Функция для переключения активного раздела
    function switchSection(sectionId) {
        // Скрываем все разделы
        contentSections.forEach(section => {
            section.style.display = 'none';
        });

        // Показываем выбранный раздел
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.style.display = 'block';
        }

        // Обновляем активное состояние в меню
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            }
        });
    }

    // Добавляем обработчики для пунктов меню
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                switchSection(sectionId);
            }
        });
    });

    // Показываем первый раздел по умолчанию
    if (menuItems.length > 0) {
        const firstSection = menuItems[0].getAttribute('data-section');
        switchSection(firstSection);
    }

    // Функция для загрузки данных в раздел
    async function loadSectionData(section) {
        const token = localStorage.getItem('token');
        let endpoint = '';

        switch(section) {
            case 'dashboard':
                // Загрузка статистики
                try {
                    const response = await fetch('http://localhost:8080/admin/stats', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const stats = await response.json();
                        updateDashboardStats(stats);
                    }
                } catch (error) {
                    console.error('Error loading dashboard stats:', error);
                }
                break;
            case 'products':
                // Загрузка товаров
                try {
                    const response = await fetch('http://localhost:8080/admin/products', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const products = await response.json();
                        updateProductsList(products);
                    }
                } catch (error) {
                    console.error('Error loading products:', error);
                }
                break;
            case 'orders':
                // Загрузка заказов
                try {
                    const response = await fetch('http://localhost:8080/orders', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const orders = await response.json();
                        updateOrdersList(orders);
                    } else {
                        console.error('Error loading orders:', response.status);
                    }
                } catch (error) {
                    console.error('Error loading orders:', error);
                }
                break;
            case 'users':
                // Загрузка пользователей
                try {
                    const response = await fetch('http://localhost:8080/admin/users', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const users = await response.json();
                        updateUsersList(users);
                    }
                } catch (error) {
                    console.error('Error loading users:', error);
                }
                break;
        }
    }

    // Функции для обновления данных в разделах
    function updateDashboardStats(stats) {
        const statsContainer = document.getElementById('dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Всего заказов</h3>
                        <div class="value">${stats.totalOrders}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Новых заказов</h3>
                        <div class="value">${stats.newOrders}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Всего пользователей</h3>
                        <div class="value">${stats.totalUsers}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Общая выручка</h3>
                        <div class="value">${stats.totalRevenue.toLocaleString()} ₽</div>
                    </div>
                </div>
            `;
        }
    }

    function updateProductsList(products) {
        const productsContainer = document.getElementById('products-list');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Категория</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.id}</td>
                                <td>${product.name}</td>
                                <td>${product.price.toLocaleString()} ₽</td>
                                <td>${product.category}</td>
                                <td>
                                    <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    function updateOrdersList(orders) {
        const ordersContainer = document.getElementById('orders-list');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th>Дата</th>
                            <th>Адрес доставки</th>
                            <th>Способ оплаты</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.user_id}</td>
                                <td>
                                    <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                                    </select>
                                </td>
                                <td>${order.total_price.toLocaleString()} ₽</td>
                                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                                <td>${order.shipping_address}</td>
                                <td>${order.payment_method === 'card' ? 'Карта' : 'Наличные'}</td>
                                <td>
                                    <button class="action-btn edit-btn" onclick="viewOrder(${order.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    function updateUsersList(users) {
        const usersContainer = document.getElementById('users-list');
        if (usersContainer) {
            usersContainer.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>
                                    <select class="role-select" onchange="updateUserRole(${user.id}, this.value)">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="action-btn edit-btn" onclick="editUser(${user.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    // Глобальные функции для обработки действий
    window.editProduct = async function(productId) {
        // Реализация редактирования товара
        showToast('Редактирование', 'Функция редактирования товара', 'info');
    };

    window.deleteProduct = async function(productId) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8080/admin/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    showToast('Успешно', 'Товар удален', 'success');
                    loadSectionData('products');
                } else {
                    showToast('Ошибка', 'Не удалось удалить товар', 'error');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                showToast('Ошибка', 'Произошла ошибка при удалении товара', 'error');
            }
        }
    };

    window.updateOrderStatus = async function(orderId, newStatus) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showToast('Успешно', 'Статус заказа обновлен', 'success');
            } else {
                showToast('Ошибка', 'Не удалось обновить статус заказа', 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showToast('Ошибка', 'Произошла ошибка при обновлении статуса заказа', 'error');
        }
    };

    window.updateUserRole = async function(userId, role) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });
            if (response.ok) {
                showToast('Успешно', 'Роль пользователя обновлена', 'success');
            } else {
                showToast('Ошибка', 'Не удалось обновить роль пользователя', 'error');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            showToast('Ошибка', 'Произошла ошибка при обновлении роли пользователя', 'error');
        }
    };
}); 