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
                if (sectionId === 'components') {
                    loadComponents('cpu'); // Загружаем процессоры по умолчанию
                }
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

    // Функция для загрузки компонентов
    async function loadComponents(category = 'cpu') {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/components?category=${category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке компонентов');
            }

            const components = await response.json();
            displayComponents(components, category);
        } catch (error) {
            console.error('Ошибка при загрузке компонентов:', error);
            showToast('Ошибка при загрузке компонентов', 'error');
        }
    }

    // Функция для отображения компонентов
    function displayComponents(components, category) {
        const tbody = document.querySelector('#components-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (components.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Нет компонентов</td></tr>';
            return;
        }

        components.forEach(component => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${component.data.id}</td>
                <td>${component.data.name}</td>
                <td>${component.data.price} ₽</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editComponent(${component.data.id}, '${category}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteComponent(${component.data.id}, '${category}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Функция для отображения модального окна добавления компонента
    function showAddComponentModal() {
        const modal = document.getElementById('componentModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('componentForm').reset();
            document.getElementById('componentModalTitle').textContent = 'Добавить компонент';
            document.getElementById('componentForm').dataset.mode = 'add';
        }
    }

    // Функция для редактирования компонента
    async function editComponent(id, category) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/components/${id}?category=${category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке компонента');
            }

            const component = await response.json();
            showEditComponentModal(component, category);
        } catch (error) {
            console.error('Ошибка при загрузке компонента:', error);
            showToast('Ошибка при загрузке компонента', 'error');
        }
    }

    // Функция для отображения модального окна редактирования компонента
    function showEditComponentModal(component, category) {
        const modal = document.getElementById('componentModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('componentModalTitle').textContent = 'Редактировать компонент';
            
            // Заполняем форму данными компонента
            document.getElementById('componentName').value = component.data.name;
            document.getElementById('componentPrice').value = component.data.price;
            document.getElementById('category').value = category;
            
            // Сохраняем ID компонента и режим редактирования
            document.getElementById('componentForm').dataset.mode = 'edit';
            document.getElementById('componentForm').dataset.id = component.data.id;
            document.getElementById('componentForm').dataset.category = category;
        }
    }

    // Функция для удаления компонента
    async function deleteComponent(id, category) {
        if (confirm('Вы уверены, что хотите удалить этот компонент?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8080/components/${id}?category=${category}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении компонента');
                }

                showToast('Компонент успешно удален', 'success');
                loadComponents(category);
            } catch (error) {
                console.error('Ошибка при удалении компонента:', error);
                showToast('Ошибка при удалении компонента', 'error');
            }
        }
    }

    // Обработчик отправки формы компонента
    document.getElementById('componentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const mode = this.dataset.mode;
        const category = formData.get('category');
        
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:8080/components';
            let method = 'POST';
            
            if (mode === 'edit') {
                url += `/${this.dataset.id}?category=${category}`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.get('componentName'),
                    price: parseFloat(formData.get('componentPrice')),
                    category: category
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении компонента');
            }

            showToast('Компонент успешно сохранен', 'success');
            document.getElementById('componentModal').style.display = 'none';
            loadComponents(category);
        } catch (error) {
            console.error('Ошибка при сохранении компонента:', error);
            showToast('Ошибка при сохранении компонента', 'error');
        }
    });

    // Закрытие модального окна
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('componentModal').style.display = 'none';
    });

    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:8080/builds', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке сборок');
            }

            const builds = await response.json();
            const tbody = document.querySelector('#products-table tbody');
            tbody.innerHTML = '';

            builds.forEach(build => {
                const tr = document.createElement('tr');
                let imageUrl = build.image_url;
                
                // Если URL локальный, добавляем базовый URL сервера
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = 'http://localhost:8080' + imageUrl;
                }
                
                tr.innerHTML = `
                    <td>${build.id}</td>
                    <td>
                        <img src="${imageUrl || 'images/builds/default.jpg'}" 
                             alt="${build.name}" 
                             style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
                    </td>
                    <td>${build.name}</td>
                    <td>${build.description}</td>
                    <td>$${build.total_price}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${build.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${build.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Ошибка при загрузке сборок:', error);
            showToast('Ошибка при загрузке сборок: ' + error.message, 'error');
        }
    }

    // Добавляем обработчик для кнопки загрузки сборок
    const productsTab = document.querySelector('a[data-section="products"]');
    if (productsTab) {
        productsTab.addEventListener('click', function() {
            loadProducts();
        });
    }
}); 