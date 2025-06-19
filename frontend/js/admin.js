console.log('[DEBUG] admin.js загружен');

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию и роль администратора
    if (!checkAuth() || !checkAdminRole()) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем данные пользователей при инициализации
    loadUsers();

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
            
            // Загружаем данные для раздела
            if (sectionId === 'users') {
                loadUsers();
            } else if (sectionId === 'components') {
                loadComponents('cpu');
            }
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
                // Загрузка статистики на основе заказов
                try {
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.STATS, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const orders = await response.json();
                        // Создаем статистику на основе заказов
                        const stats = {
                            totalOrders: orders.length,
                            newOrders: orders.filter(order => order.status === 'pending').length,
                            totalUsers: 0, // Будет обновлено после загрузки пользователей
                            totalRevenue: orders.reduce((sum, order) => sum + (order.total_price || 0), 0)
                        };
                        
                        // Загружаем пользователей для подсчета общего количества
                        const usersResponse = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (usersResponse.ok) {
                            const users = await usersResponse.json();
                            stats.totalUsers = users.length;
                        }
                        
                        updateDashboard(stats);
                    }
                } catch (error) {
                    console.error('Error loading stats:', error);
                }
                break;
            case 'products':
                // Загрузка товаров
                try {
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS, {
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
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ORDERS.LIST, {
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
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS, {
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
    function updateDashboard(stats) {
        const statsContainer = document.getElementById('dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Всего заказов</h3>
                            <p>${stats.totalOrders}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Новых заказов</h3>
                            <p>${stats.newOrders}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Всего пользователей</h3>
                            <p>${stats.totalUsers}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-ruble-sign"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Общая выручка</h3>
                            <p>${stats.totalRevenue.toLocaleString()} ₽</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    function updateProductsList(products) {
        const productsTableBody = document.getElementById('productsTableBody');
        if (!productsTableBody) {
            console.error('Products table body not found');
            return;
        }

        productsTableBody.innerHTML = products.map(product => {
            return `
                <tr>
                    <td>${product.id}</td>
                    <td>
                        <div class="build-image-container" style="width: 100px; height: 100px; position: relative;">
                            <img src="${product.image_url || '../assets/default-build.jpg'}" 
                                 alt="${product.name}" 
                                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;"
                                 onerror="this.onerror=null; this.src='../assets/default-build.jpg'">
                        </div>
                    </td>
                    <td>${product.name || 'Без названия'}</td>
                    <td>${product.description || 'Нет описания'}</td>
                    <td>${product.total_price ? product.total_price.toLocaleString() + ' ₽' : 'Нет цены'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewBuild(${product.id})" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" data-id="${product.id}" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteBuild(${product.id}, '${product.name}')" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function updateOrdersList(orders) {
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (ordersTableBody) {
            ordersTableBody.innerHTML = orders.map(order => {
                // Форматируем дату (используем created_at из GORM)
                const orderDate = new Date(order.created_at || order.CreatedAt);
                const formattedDate = orderDate.toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Форматируем сумму (используем total_amount из модели)
                const formattedAmount = new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB'
                }).format(order.total_amount || 0);

                return `
                    <tr>
                        <td>${order.id || order.ID || ''}</td>
                        <td>${order.user_id || order.UserID || ''}</td>
                        <td>${formattedDate}</td>
                        <td>${formattedAmount}</td>
                        <td>
                            <select class="status-select" onchange="updateOrderStatus(${order.id || order.ID}, this.value)">
                                <option value="pending" ${(order.status || order.Status) === 'pending' ? 'selected' : ''}>Ожидает обработки</option>
                                <option value="processing" ${(order.status || order.Status) === 'processing' ? 'selected' : ''}>В обработке</option>
                                <option value="completed" ${(order.status || order.Status) === 'completed' ? 'selected' : ''}>Завершен</option>
                                <option value="cancelled" ${(order.status || order.Status) === 'cancelled' ? 'selected' : ''}>Отменен</option>
                            </select>
                        </td>
                        <td>
                            <button class="action-btn view" onclick="viewOrderDetails(${order.id || order.ID})" title="Просмотр деталей">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="editOrder(${order.id || order.ID})" title="Редактировать заказ">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteOrder(${order.id || order.ID})" title="Удалить заказ">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Функция для получения текстового представления статуса заказа
    function getOrderStatusText(status) {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    function updateUsersList(users) {
        console.log('Updating users list with data:', users);
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) {
            console.error('Users table body element not found');
            return;
        }

        if (!Array.isArray(users)) {
            console.error('Users data is not an array:', users);
            return;
        }

        usersTableBody.innerHTML = users.map((user, index) => {
            console.log('Processing user:', user);
            const role = user.role || 'user';
            console.log('User role:', role);
            
            // Форматирование номера телефона
            let phone = user.phone || '';
            if (phone) {
                // Удаляем все нецифровые символы
                phone = phone.replace(/\D/g, '');
                // Форматируем номер в формат +7 (XXX) XXX-XX-XX
                if (phone.length === 11) {
                    phone = `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
                }
            }

            // Кнопка редактирования пользователя
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.id}</td>
                    <td>${user.name || user.username || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${role}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-user-btn" data-user-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Навешиваем обработчики на кнопки редактирования пользователя
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.onclick = function() {
                const userId = this.getAttribute('data-user-id');
                const user = users.find(u => u.id == userId);
                if (user) window.showEditUserModal(user);
            };
        });
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
                const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS + `/${productId}`, {
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

    // Функция для редактирования заказа
    window.editOrder = async function(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке данных заказа');
            }

            const order = await response.json();
            showEditOrderModal(order);
        } catch (error) {
            console.error('Ошибка при загрузке заказа:', error);
            showToast('Ошибка', 'Не удалось загрузить данные заказа', 'error');
        }
    };

    // Функция для удаления заказа с подтверждением
    window.deleteOrder = async function(orderId) {
        // Показываем модальное окно подтверждения
        showDeleteOrderConfirmation(orderId);
    };

    // Функция для показа модального окна подтверждения удаления
    function showDeleteOrderConfirmation(orderId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3>Подтверждение удаления</h3>
                <p>Вы уверены, что хотите удалить этот заказ?</p>
                <p><strong>Внимание:</strong> Это действие нельзя отменить!</p>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="closeDeleteOrderModal()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                        Отмена
                    </button>
                    <button onclick="confirmDeleteOrder(${orderId})" style="padding: 8px 16px; border: none; background: #e74c3c; color: white; border-radius: 4px; cursor: pointer;">
                        Удалить
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Функция для закрытия модального окна подтверждения
    window.closeDeleteOrderModal = function() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    };

    // Функция для подтверждения удаления заказа
    window.confirmDeleteOrder = async function(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении заказа');
            }

            showToast('Успешно', 'Заказ удален', 'success');
            closeDeleteOrderModal();
            
            // Перезагружаем список заказов
            loadSectionData('orders');
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            showToast('Ошибка', 'Не удалось удалить заказ', 'error');
            closeDeleteOrderModal();
        }
    };

    // Функция для показа модального окна редактирования заказа
    function showEditOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close" onclick="closeEditOrderModal()">&times;</span>
                <h3>Редактирование заказа #${order.id || order.ID}</h3>
                <form id="editOrderForm">
                    <div class="form-group">
                        <label for="editOrderStatus">Статус заказа</label>
                        <select id="editOrderStatus" required>
                            <option value="pending" ${(order.status || order.Status) === 'pending' ? 'selected' : ''}>Ожидает обработки</option>
                            <option value="processing" ${(order.status || order.Status) === 'processing' ? 'selected' : ''}>В обработке</option>
                            <option value="completed" ${(order.status || order.Status) === 'completed' ? 'selected' : ''}>Завершен</option>
                            <option value="cancelled" ${(order.status || order.Status) === 'cancelled' ? 'selected' : ''}>Отменен</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editOrderAddress">Адрес доставки</label>
                        <input type="text" id="editOrderAddress" value="${order.shipping_address || order.ShippingAddress || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editOrderPayment">Способ оплаты</label>
                        <select id="editOrderPayment" required>
                            <option value="card" ${(order.payment_method || order.PaymentMethod) === 'card' ? 'selected' : ''}>Банковская карта</option>
                            <option value="cash" ${(order.payment_method || order.PaymentMethod) === 'cash' ? 'selected' : ''}>Наличные</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editOrderDelivery">Способ доставки</label>
                        <select id="editOrderDelivery" required>
                            <option value="pickup" ${(order.delivery_method || order.DeliveryMethod) === 'pickup' ? 'selected' : ''}>Самовывоз</option>
                            <option value="courier" ${(order.delivery_method || order.DeliveryMethod) === 'courier' ? 'selected' : ''}>Курьер</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editOrderComment">Комментарий</label>
                        <textarea id="editOrderComment" rows="3">${order.comment || order.Comment || ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button type="button" onclick="closeEditOrderModal()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                            Отмена
                        </button>
                        <button type="submit" style="padding: 8px 16px; border: none; background: #3498db; color: white; border-radius: 4px; cursor: pointer;">
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Добавляем обработчик отправки формы
        document.getElementById('editOrderForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveOrderChanges(order.id || order.ID);
        });
    }

    // Функция для закрытия модального окна редактирования
    window.closeEditOrderModal = function() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    };

    // Функция для сохранения изменений заказа
    async function saveOrderChanges(orderId) {
        try {
            const token = localStorage.getItem('token');
            const formData = {
                status: document.getElementById('editOrderStatus').value,
                shipping_address: document.getElementById('editOrderAddress').value,
                payment_method: document.getElementById('editOrderPayment').value,
                delivery_method: document.getElementById('editOrderDelivery').value,
                comment: document.getElementById('editOrderComment').value
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении заказа');
            }

            showToast('Успешно', 'Заказ обновлен', 'success');
            closeEditOrderModal();
            
            // Перезагружаем список заказов
            loadSectionData('orders');
        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
            showToast('Ошибка', 'Не удалось обновить заказ', 'error');
        }
    }

    async function updateOrderStatus(orderId, newStatus) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS}/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении статуса заказа');
            }

            showToast('Статус заказа успешно обновлен', 'success');
            
            // Перезагружаем список заказов
            const ordersResponse = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ORDERS.LIST, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                updateOrdersList(orders);
            }
        } catch (error) {
            console.error('Ошибка при обновлении статуса заказа:', error);
            showToast('Не удалось обновить статус заказа', 'error');
        }
    }

    window.updateUserRole = async function(userId, role) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS + `/${userId}/role`, {
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
    async function loadComponents() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }
            
            const categories = ['cpu', 'gpu', 'motherboard', 'body', 'ram', 'power_unit', 'hdd', 'ssd'];
            const components = {};
            
            for (const category of categories) {
                const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + `?category=${category}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            if (!response.ok) {
                    throw new Error(`Ошибка при загрузке компонентов категории ${category}`);
                }
                components[category] = await response.json();
            }

            return components;
        } catch (error) {
            console.error('Ошибка при загрузке компонентов:', error);
            throw error;
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
                    <button class="btn btn-sm btn-warning btn-edit-component"
                            data-component='${JSON.stringify(component).replace(/'/g, '&apos;')}'
                            data-category='${category}'>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="showDeleteComponentModal(${component.data.id}, '${category}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        // Навешиваем обработчик на все кнопки редактирования
        tbody.querySelectorAll('.btn-edit-component').forEach(btn => {
            btn.onclick = function() {
                const component = JSON.parse(this.dataset.component.replace(/&apos;/g, "'"));
                const category = this.dataset.category;
                window.showEditComponentModal(component, category);
            };
        });
    }

    // Функция для отображения модального окна добавления компонента
    window.showAddComponentModal = function() {
        const modal = document.getElementById('componentModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('componentForm').reset();
            document.getElementById('componentModalTitle').textContent = 'Добавить компонент';
            document.getElementById('componentForm').dataset.mode = 'add';
            window.hideAllComponentFields();
            const fieldsContainer = document.getElementById('fieldsContainer');
            if (fieldsContainer) fieldsContainer.style.display = 'none';
            const categorySelect = document.getElementById('category');
            const addButton = modal.querySelector('button[type="submit"]');
            if (categorySelect) {
                categorySelect.value = '';
                if (addButton) addButton.disabled = true;
                if (!categorySelect.dataset.listenerAdded) {
                    categorySelect.addEventListener('change', function() {
                        console.log('[DEBUG] Категория выбрана (modal):', this.value);
                        window.showFieldsForCategory(this.value);
                        if (addButton) addButton.disabled = !this.value;
                    });
                    categorySelect.dataset.listenerAdded = 'true';
                }
            }
        }
    }

    // Функция для скрытия всех специфичных полей
    window.hideAllComponentFields = function() {
        const gpuFields = document.getElementById('gpuFields');
        const bodyFields = document.getElementById('bodyFields');
        const cpuFields = document.getElementById('cpuFields');
        const universalFields = document.getElementById('universalFields');
        if (gpuFields) gpuFields.style.display = 'none';
        if (bodyFields) bodyFields.style.display = 'none';
        if (cpuFields) cpuFields.style.display = 'none';
        if (universalFields) universalFields.style.display = 'block'; // по умолчанию universalFields видим
        // Добавьте сюда другие поля, если появятся
    }

    // Функция для показа полей по категории
    window.showFieldsForCategory = function(category) {
        console.log('[DEBUG] showFieldsForCategory вызвана с категорией:', category);
        window.hideAllComponentFields();
        const fieldsContainer = document.getElementById('fieldsContainer');
        if (fieldsContainer) fieldsContainer.style.display = category ? 'block' : 'none';
        if (category === 'gpu') {
            const gpuFields = document.getElementById('gpuFields');
            if (gpuFields) {
                gpuFields.style.display = 'block';
                console.log('[DEBUG] Показываю gpuFields');
            } else {
                console.error('[DEBUG] Не найден gpuFields');
            }
        } else if (category === 'body') {
            const bodyFields = document.getElementById('bodyFields');
            if (bodyFields) {
                bodyFields.style.display = 'block';
                console.log('[DEBUG] Показываю bodyFields');
            } else {
                console.error('[DEBUG] Не найден bodyFields');
            }
        } else if (category === 'cpu') {
            const cpuFields = document.getElementById('cpuFields');
            const universalFields = document.getElementById('universalFields');
            if (cpuFields) {
                cpuFields.style.display = 'block';
                console.log('[DEBUG] Показываю cpuFields');
            } else {
                console.error('[DEBUG] Не найден cpuFields');
            }
            if (universalFields) {
                universalFields.style.display = 'none';
                console.log('[DEBUG] Скрываю universalFields');
            } else {
                console.error('[DEBUG] Не найден universalFields');
            }
        }
        // Добавьте сюда другие условия для других категорий, если нужно
    }

    // Навешиваем обработчик на select категории после загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                console.log('[DEBUG] Категория выбрана:', this.value);
                window.showFieldsForCategory(this.value);
            });
        } else {
            console.error('[DEBUG] Не найден select с id="category"');
        }
    });

    // Функция для редактирования компонента
    async function editComponent(id, category) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.GET + `?category=${category}&id=${id}`);

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
    window.showEditComponentModal = function(component, category) {
        const modal = document.getElementById('editComponentModal');
        if (!modal) return;
        document.getElementById('editComponentId').value = component.data.id;
        document.getElementById('editComponentName').value = component.data.name;
        document.getElementById('editComponentPrice').value = component.data.price;
            modal.style.display = 'block';
        document.getElementById('editComponentModalTitle').textContent = `Редактировать компонент (${category})`;
        modal.dataset.category = category;
    };

    window.closeEditComponentModal = function() {
        const modal = document.getElementById('editComponentModal');
        if (modal) modal.style.display = 'none';
    };

    // --- Модальное окно подтверждения удаления комплектующего ---
    let componentToDelete = null;
    let componentCategoryToDelete = null;

    window.showDeleteComponentModal = function(id, category) {
        componentToDelete = id;
        componentCategoryToDelete = category;
        document.getElementById('deleteComponentModal').style.display = 'block';
    };

    window.closeDeleteComponentModal = function() {
        document.getElementById('deleteComponentModal').style.display = 'none';
        componentToDelete = null;
        componentCategoryToDelete = null;
    };

    document.getElementById('editComponentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('editComponentId').value;
        const data = {
            name: document.getElementById('editComponentName').value,
            price: parseFloat(document.getElementById('editComponentPrice').value)
            // ... другие поля ...
        };
        const category = document.getElementById('editComponentModal').dataset.category;
            try {
                const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/components/${id}?category=${category}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Ошибка при сохранении компонента');
            showToast('Компонент успешно обновлен', 'success');
            window.closeEditComponentModal();
            loadComponents(category);
        } catch (error) {
            showToast('Ошибка при сохранении компонента', 'error');
        }
    });

    document.getElementById('confirmDeleteComponentBtn').onclick = async function() {
        if (!componentToDelete || !componentCategoryToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/components/${componentToDelete}?category=${componentCategoryToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка при удалении компонента');
            showToast('Компонент успешно удален', 'success');
            window.closeDeleteComponentModal();
            // Загружаем все компоненты и обновляем только нужную категорию
            const allComponents = await loadComponents();
            displayComponents(allComponents[componentCategoryToDelete] || [], componentCategoryToDelete);
        } catch (error) {
            showToast('Ошибка при удалении компонента', 'error');
        }
    };

    // Обработчик отправки формы компонента
    document.getElementById('componentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const mode = this.dataset.mode;
        const category = formData.get('category');
        let data = {};

        if (category === 'cpu') {
            data = {
                name: document.getElementById('cpuName').value,
                manufacturer: document.getElementById('cpuManufacturer').value,
                cores: parseInt(document.getElementById('cpuCores').value, 10),
                threads: parseInt(document.getElementById('cpuThreads').value, 10),
                socket: document.getElementById('cpuSocket').value,
                price: parseFloat(document.getElementById('cpuPrice').value)
                // category: category // не добавлять в тело запроса!
            };
        } else {
            data = {
                name: document.getElementById('componentName').value,
                price: parseFloat(document.getElementById('componentPrice').value),
                category: category
                // ... другие универсальные поля ...
            };
        }
        
        try {
            const token = localStorage.getItem('token');
            let url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST;
            let method = 'POST';
            
            if (mode === 'edit') {
                url += `/${this.dataset.id}?category=${category}`;
                method = 'PUT';
            } else {
                url += `?category=${category}`;
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
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

    // Добавляю функцию для закрытия модального окна по крестику
    window.closeComponentModal = function() {
        document.getElementById('componentModal').style.display = 'none';
    }

    async function loadProducts() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/builds`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке сборок');
            }

            const builds = await response.json();
            updateProductsList(builds);
        } catch (error) {
            console.error('Ошибка при загрузке продуктов:', error);
            showToast('Не удалось загрузить продукты', 'error');
        }
    }

    async function loadUsers() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            // Показываем секцию пользователей
            const usersSection = document.getElementById('users');
            if (usersSection) {
                usersSection.style.display = 'block';
            }

            console.log('Fetching users with token:', token);
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке пользователей');
            }

            const users = await response.json();
            console.log('Raw users data from server:', users);
            
            // Проверяем структуру данных
            if (Array.isArray(users)) {
                console.log('Users is an array with length:', users.length);
                users.forEach((user, index) => {
                    console.log(`User ${index}:`, user);
                });
            } else {
                console.log('Users is not an array:', typeof users);
            }

            const usersTableBody = document.getElementById('usersTableBody');
            if (!usersTableBody) {
                console.error('Users table body element not found');
                return;
            }

            updateUsersList(users);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
            showToast('Ошибка при загрузке пользователей: ' + error.message, 'error');
        }
    }

    async function loadBuilds() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BUILDS.LIST);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке сборок');
            }
            const builds = await response.json();
            displayBuilds(builds);
        } catch (error) {
            console.error('Ошибка при загрузке сборок:', error);
            showToast('Не удалось загрузить сборки', 'error');
        }
    }

    async function uploadBuildImage(formData) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BUILDS.UPLOAD, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Ошибка при загрузке изображения');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
            throw error;
        }
    }

    async function loadComponents() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }
            
            const categories = ['cpu', 'gpu', 'motherboard', 'body', 'ram', 'power_unit', 'hdd', 'ssd'];
            const components = {};
            
            for (const category of categories) {
                const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + `?category=${category}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке компонентов категории ${category}`);
                }
                components[category] = await response.json();
            }
            
            return components;
        } catch (error) {
            console.error('Ошибка при загрузке компонентов:', error);
            throw error;
        }
    }

    async function loadUsersList() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке пользователей');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
            throw error;
        }
    }

    // Добавляем обработчик для кнопки загрузки сборок
    const productsTab = document.querySelector('a[data-section="products"]');
    if (productsTab) {
        productsTab.addEventListener('click', function() {
            loadProducts();
        });
    }

    // Кэш для компонентов
    let componentsCache = {
        cpu: null,
        gpu: null,
        motherboard: null,
        body: null,
        ram: null,
        power_unit: null,
        hdd: null,
        ssd: null
    };

    // Глобальные функции
    window.loadComponentsForEdit = async function() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            console.log('Starting to load components for edit...');
            
            // Загружаем все компоненты параллельно
            const [cpuResponse, gpuResponse, motherboardResponse, bodyResponse, 
                   ramResponse, powerUnitResponse, hddResponse, ssdResponse] = await Promise.all([
                fetch(`${API_CONFIG.BASE_URL}/components?category=cpu`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=gpu`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=motherboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=body`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=ram`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=power_unit`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=hdd`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_CONFIG.BASE_URL}/components?category=ssd`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Проверяем все ответы
            const responses = [cpuResponse, gpuResponse, motherboardResponse, bodyResponse, 
                            ramResponse, powerUnitResponse, hddResponse, ssdResponse];
            
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке компонентов: ${response.statusText}`);
                }
            }

            // Получаем данные
            const [cpuData, gpuData, motherboardData, bodyData, 
                   ramData, powerUnitData, hddData, ssdData] = await Promise.all([
                cpuResponse.json(),
                gpuResponse.json(),
                motherboardResponse.json(),
                bodyResponse.json(),
                ramResponse.json(),
                powerUnitResponse.json(),
                hddResponse.json(),
                ssdResponse.json()
            ]);

            console.log('Loaded component data:', {
                cpu: cpuData,
                gpu: gpuData,
                motherboard: motherboardData,
                body: bodyData,
                ram: ramData,
                powerUnit: powerUnitData,
                hdd: hddData,
                ssd: ssdData
            });

            // Функция для форматирования текста опции
            const formatOptionText = (component) => {
                let text = `${component.data.name} - ${component.data.price} ₽`;
                if (component.data.cores) {
                    text += ` (${component.data.cores} ядер)`;
                } else if (component.data.vram) {
                    text += ` (${component.data.vram}GB VRAM)`;
                } else if (component.data.capacity) {
                    text += ` (${component.data.capacity})`;
                } else if (component.data.wattage) {
                    text += ` (${component.data.wattage})`;
                }
                return text;
            };

            // Функция для заполнения селекта
            const populateSelect = (selectId, components) => {
                const select = document.getElementById(selectId);
                if (!select) {
                    console.error(`Select element not found: ${selectId}`);
                    return;
                }


                // Добавляем опции
                components.forEach(component => {
                    const option = document.createElement('option');
                    option.value = String(component.data.id); // <-- id как value
                    option.textContent = formatOptionText(component); // название и характеристики
                    select.appendChild(option);
                });

                console.log(`Populated ${selectId} with ${components.length} options`);
            };

            // Заполняем все селекты
            populateSelect('editBuildCPU', cpuData);
            populateSelect('editBuildGPU', gpuData);
            populateSelect('editBuildMotherboard', motherboardData);
            populateSelect('editBuildBody', bodyData);
            populateSelect('editBuildRAM', ramData);
            populateSelect('editBuildPowerUnit', powerUnitData);
            populateSelect('editBuildHDD', hddData);
            populateSelect('editBuildSSD', ssdData);

            // Добавляем обработчики для предпросмотра
            const addEditPreviewHandlers = () => {
                const componentTypes = {
                    'editBuildCPU': 'CPU',
                    'editBuildGPU': 'GPU',
                    'editBuildMotherboard': 'Motherboard',
                    'editBuildBody': 'Body',
                    'editBuildRAM': 'RAM',
                    'editBuildPowerUnit': 'PowerUnit',
                    'editBuildHDD': 'HDD',
                    'editBuildSSD': 'SSD'
                };

                Object.entries(componentTypes).forEach(([selectId, type]) => {
                    const select = document.getElementById(selectId);
                    const preview = document.getElementById(`editPreview${type}`);
                    
                    if (select && preview) {
                        select.addEventListener('change', () => {
                            const selectedOption = select.options[select.selectedIndex];
                            if (selectedOption.value) {
                                preview.textContent = selectedOption.textContent;
                            } else {
                                preview.textContent = 'Не выбран';
                            }
                        });
                    }
                });
            };

            addEditPreviewHandlers();
            console.log('Component loading completed successfully');

        } catch (error) {
            console.error('Ошибка при загрузке компонентов:', error);
            showToast('Ошибка при загрузке компонентов: ' + error.message, 'error');
            throw error;
        }
    };

    function addEditPreviewHandlers() {
        const components = {
            'editBuildCPU': 'editPreviewCPU',
            'editBuildGPU': 'editPreviewGPU',
            'editBuildMotherboard': 'editPreviewMotherboard',
            'editBuildBody': 'editPreviewBody',
            'editBuildRAM': 'editPreviewRAM',
            'editBuildPowerUnit': 'editPreviewPowerUnit',
            'editBuildHDD': 'editPreviewHDD',
            'editBuildSSD': 'editPreviewSSD'
        };

        Object.entries(components).forEach(([selectId, previewId]) => {
            const select = document.getElementById(selectId);
            const preview = document.getElementById(previewId);
            
            if (select && preview) {
                select.addEventListener('change', function() {
                    const selectedOption = this.options[this.selectedIndex];
                    preview.textContent = selectedOption.text || 'Не выбран';
                });
            }
        });
    }

    // Вспомогательная функция для получения названия типа компонента
    function getComponentTypeName(type) {
        const typeNames = {
            'cpu': 'процессор',
            'gpu': 'видеокарту',
            'motherboard': 'материнскую плату',
            'body': 'корпус',
            'ram': 'оперативную память',
            'power_unit': 'блок питания',
            'hdd': 'HDD',
            'ssd': 'SSD'
        };
        return typeNames[type] || type;
    }

    // === ЛОГИКА ДЛЯ РЕДАКТИРОВАНИЯ СБОРКИ (editBuildModal) ===

    // Функция для загрузки и заполнения компонентов для редактирования сборки
    async function loadEditBuildComponentsAndSetValues(build) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Требуется авторизация');
        const categories = [
            { key: 'cpu', selectId: 'editBuildCPU', idField: 'cpu_id' },
            { key: 'gpu', selectId: 'editBuildGPU', idField: 'gpu_id' },
            { key: 'motherboard', selectId: 'editBuildMotherboard', idField: 'motherboard_id' },
            { key: 'body', selectId: 'editBuildBody', idField: 'body_id' },
            { key: 'ram', selectId: 'editBuildRAM', idField: 'ram_id' },
            { key: 'power_unit', selectId: 'editBuildPowerUnit', idField: 'power_unit_id' },
            { key: 'hdd', selectId: 'editBuildHDD', idField: 'hdd_id' },
            { key: 'ssd', selectId: 'editBuildSSD', idField: 'ssd_id' }
        ];
        // Загружаем все компоненты параллельно
        const responses = await Promise.all(categories.map(cat =>
            fetch(`${API_CONFIG.BASE_URL}/components?category=${cat.key}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ));
        const data = await Promise.all(responses.map(r => r.json()));
        // Заполняем селекты
        categories.forEach((cat, idx) => {
            const select = document.getElementById(cat.selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Выберите компонент</option>';
            data[idx].forEach(component => {
                const option = document.createElement('option');
                option.value = String(component.data.id);
                let text = `${component.data.name} - ${component.data.price} ₽`;
                if (component.data.cores) text += ` (${component.data.cores} ядер)`;
                if (component.data.vram) text += ` (${component.data.vram}GB VRAM)`;
                if (component.data.capacity) text += ` (${component.data.capacity})`;
                if (component.data.wattage) text += ` (${component.data.wattage})`;
                option.textContent = text;
                select.appendChild(option);
            });
            // Устанавливаем значение из build
            if (build && build[cat.idField]) {
                select.value = String(build[cat.idField]);
            } else {
                select.value = '';
            }
        });
        // Обновляем предпросмотр
        updateEditBuildPreview();
    }

    function updateEditBuildPreview() {
        const map = {
            'editBuildCPU': 'editPreviewCPU',
            'editBuildGPU': 'editPreviewGPU',
            'editBuildMotherboard': 'editPreviewMotherboard',
            'editBuildBody': 'editPreviewBody',
            'editBuildRAM': 'editPreviewRAM',
            'editBuildPowerUnit': 'editPreviewPowerUnit',
            'editBuildHDD': 'editPreviewHDD',
            'editBuildSSD': 'editPreviewSSD'
        };
        Object.entries(map).forEach(([selectId, previewId]) => {
            const select = document.getElementById(selectId);
            const preview = document.getElementById(previewId);
            if (select && preview) {
                const selectedOption = select.options[select.selectedIndex];
                preview.textContent = selectedOption && selectedOption.value ? selectedOption.text : 'Не выбран';
            }
        });
    }

    // Навешиваем обработчики предпросмотра только один раз
    function addEditBuildPreviewHandlers() {
        const map = {
            'editBuildCPU': 'editPreviewCPU',
            'editBuildGPU': 'editPreviewGPU',
            'editBuildMotherboard': 'editPreviewMotherboard',
            'editBuildBody': 'editPreviewBody',
            'editBuildRAM': 'editPreviewRAM',
            'editBuildPowerUnit': 'editPreviewPowerUnit',
            'editBuildHDD': 'editPreviewHDD',
            'editBuildSSD': 'editPreviewSSD'
        };
        Object.entries(map).forEach(([selectId, previewId]) => {
            const select = document.getElementById(selectId);
            if (select && !select.dataset.editPreviewHandler) {
                select.addEventListener('change', updateEditBuildPreview);
                select.dataset.editPreviewHandler = 'true';
            }
        });
    }

    // Основная функция для открытия модального окна редактирования сборки
    window.showEditBuildModal = async function(buildId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Требуется авторизация');
            const modal = document.getElementById('editBuildModal');
            const loadingOverlay = document.getElementById('editBuildLoading');
            if (modal) {
                modal.style.display = 'block';
                if (loadingOverlay) loadingOverlay.style.display = 'flex';
            }
            // Получаем данные сборки
            const response = await fetch(`${API_CONFIG.BASE_URL}/builds/${buildId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка при загрузке сборки');
            const build = await response.json();
            // Заполняем основные поля
            document.getElementById('editBuildName').value = build.name || '';
            document.getElementById('editBuildDescription').value = build.description || '';
            document.getElementById('editBuildPrice').value = build.total_price || '';
            // Загружаем и заполняем компоненты
            await loadEditBuildComponentsAndSetValues(build);
            addEditBuildPreviewHandlers();
            // === Только теперь навешиваем обработчики и считаем стоимость ===
            addEditBuildCostHandlers();
            calculateEditBuildCost();
            // Скрываем индикатор загрузки
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            // Навешиваем обработчик submit только один раз
            const form = document.getElementById('editBuildForm');
            if (form) {
                if (!form.dataset.editHandlerAdded) {
                    form.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const data = {
                            name: document.getElementById('editBuildName').value,
                            description: document.getElementById('editBuildDescription').value,
                            total_price: document.getElementById('editBuildPrice').value,
                            cpu_id: document.getElementById('editBuildCPU').value ? parseInt(document.getElementById('editBuildCPU').value) : null,
                            gpu_id: document.getElementById('editBuildGPU').value ? parseInt(document.getElementById('editBuildGPU').value) : null,
                            motherboard_id: document.getElementById('editBuildMotherboard').value ? parseInt(document.getElementById('editBuildMotherboard').value) : null,
                            body_id: document.getElementById('editBuildBody').value ? parseInt(document.getElementById('editBuildBody').value) : null,
                            ram_id: document.getElementById('editBuildRAM').value ? parseInt(document.getElementById('editBuildRAM').value) : null,
                            power_unit_id: document.getElementById('editBuildPowerUnit').value ? parseInt(document.getElementById('editBuildPowerUnit').value) : null,
                            hdd_id: document.getElementById('editBuildHDD').value ? parseInt(document.getElementById('editBuildHDD').value) : null,
                            ssd_id: document.getElementById('editBuildSSD').value ? parseInt(document.getElementById('editBuildSSD').value) : null
                        };
                        try {
                            const resp = await fetch(`${API_CONFIG.BASE_URL}/builds/${buildId}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            });
                            if (!resp.ok) throw new Error('Ошибка при обновлении сборки');
                            showToast('Сборка успешно обновлена', 'success');
                            window.closeEditBuildModal();
                            // Обновить список сборок, если нужно
                        } catch (error) {
                            showToast('Ошибка при обновлении сборки', 'error');
                        }
                    });
                    form.dataset.editHandlerAdded = 'true';
                }
            }
        } catch (error) {
            showToast('Ошибка при загрузке сборки: ' + error.message, 'error');
            const loadingOverlay = document.getElementById('editBuildLoading');
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
    };

    // Обновляем функцию закрытия модального окна
    window.closeEditBuildModal = function() {
        const modal = document.getElementById('editBuildModal');
        const loadingOverlay = document.getElementById('editBuildLoading');
        if (modal) {
            modal.style.display = 'none';
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
        // Сброс стоимости после закрытия
        document.getElementById('editComponentsCost').textContent = '0 ₽';
        document.getElementById('editMarkupCost').textContent = '0 ₽';
        document.getElementById('editTotalCalculatedCost').textContent = '0 ₽';
    };

    // Функция для показа подтверждения удаления
    function showDeleteConfirmation(userId, userName) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Подтверждение удаления</h2>
                <p>Вы действительно хотите удалить пользователя "${userName}"?</p>
                <div class="modal-buttons">
                    <button class="btn btn-danger" data-action="delete">Да, удалить</button>
                    <button class="btn btn-secondary" data-action="cancel">Нет, отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Добавляем обработчики для кнопок модального окна
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
        modal.querySelector('[data-action="delete"]').addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Требуется авторизация');
                }

                const response = await fetch(API_CONFIG.BASE_URL + '/users/' + userId, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении пользователя');
                }

                modal.remove();
                await loadUsers(); // Перезагружаем список пользователей
                showToast('Пользователь успешно удален', 'success');
            } catch (error) {
                console.error('Ошибка при удалении пользователя:', error);
                showToast('Ошибка при удалении пользователя: ' + error.message, 'error');
            }
        });
    }

    // Добавляем делегирование событий для действий с пользователями
    document.addEventListener('click', function(e) {
        // Находим ближайшую кнопку действия
        const actionButton = e.target.closest('.action-btn');
        if (!actionButton) return;

        // Получаем данные пользователя
        const userId = actionButton.getAttribute('data-id');
        const userName = actionButton.getAttribute('data-name');

        // Определяем тип действия
        if (actionButton.classList.contains('delete')) {
            // Показываем модальное окно подтверждения удаления
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Подтверждение удаления</h2>
                    <p>Вы действительно хотите удалить пользователя "${userName}"?</p>
                    <div class="modal-buttons">
                        <button class="btn btn-danger" data-action="delete">Да, удалить</button>
                        <button class="btn btn-secondary" data-action="cancel">Нет, отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Обработчики для кнопок модального окна
            modal.querySelector('.close').addEventListener('click', () => modal.remove());
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.remove());
            modal.querySelector('[data-action="delete"]').addEventListener('click', async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('Требуется авторизация');
                    }

                    const response = await fetch(API_CONFIG.BASE_URL + '/users/' + userId, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Ошибка при удалении пользователя');
                    }

                    modal.remove();
                    await loadUsers();
                    showToast('Пользователь успешно удален', 'success');
                } catch (error) {
                    console.error('Ошибка при удалении пользователя:', error);
                    showToast('Ошибка при удалении пользователя: ' + error.message, 'error');
                }
            });
        } else if (actionButton.classList.contains('edit')) {
            // Обработка редактирования пользователя
            updateUserRole(userId);
        }
    });

    function updateCategoriesList(categories) {
        const categoriesTableBody = document.getElementById('categoriesTableBody');
        if (categoriesTableBody) {
            categoriesTableBody.innerHTML = categories.map(category => `
                <tr>
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    <td>${category.description}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editCategory(${category.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    window.editUser = async function(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS + `/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке данных пользователя');
            }

            const user = await response.json();
            
            // Создаем модальное окно для редактирования
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Редактирование пользователя</h2>
                    <form id="editUserForm">
                        <div class="form-group">
                            <label for="editName">Имя:</label>
                            <input type="text" id="editName" value="${user.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editEmail">Email:</label>
                            <input type="email" id="editEmail" value="${user.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editPhone">Телефон:</label>
                            <input type="tel" id="editPhone" value="${user.phone || ''}" placeholder="+7 (XXX) XXX-XX-XX">
                        </div>
                        <div class="form-group">
                            <label for="editRole">Роль:</label>
                            <select id="editRole">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                            </select>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="btn btn-primary">Сохранить</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // Добавляем обработчик закрытия модального окна
            modal.querySelector('.close').addEventListener('click', () => modal.remove());

            // Добавляем обработчик отправки формы
            modal.querySelector('#editUserForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    name: document.getElementById('editName').value,
                    email: document.getElementById('editEmail').value,
                    phone: document.getElementById('editPhone').value,
                    role: document.getElementById('editRole').value
                };

                try {
                    const updateResponse = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS + `/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formData)
                    });

                    if (!updateResponse.ok) {
                        throw new Error('Ошибка при обновлении данных пользователя');
                    }

                    modal.remove();
                    showToast('Данные пользователя успешно обновлены', 'success');
                    loadUsers(); // Перезагружаем список пользователей
                } catch (error) {
                    console.error('Ошибка при обновлении пользователя:', error);
                    showToast('Ошибка при обновлении данных пользователя: ' + error.message, 'error');
                }
            });
        } catch (error) {
            console.error('Ошибка при загрузке пользователя:', error);
            showToast('Ошибка при загрузке данных пользователя: ' + error.message, 'error');
        }
    };

    // Функция для отображения сборок
    function displayBuilds(builds) {
        const buildsContainer = document.getElementById('buildsContainer');
        if (!buildsContainer) return;

        buildsContainer.innerHTML = builds.map(build => `
            <tr>
                <td>${build.name}</td>
                <td>${build.total_price} ₽</td>
                <td>
                    <button class="action-btn view" onclick="viewBuild(${build.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" data-id="${build.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteBuild(${build.id}, '${build.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Обработчики для кнопок действий
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const button = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
            const id = button.getAttribute('data-id');
            console.log('[DEBUG] Клик по кнопке редактирования, id:', id);
            if (id) {
                await window.showEditBuildModal(id.toString());
            } else {
                console.error('[DEBUG] Не найден id для редактирования сборки');
            }
        }
    });

    // Функция для просмотра деталей заказа
    window.viewOrderDetails = async function(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке данных заказа');
            }

            const order = await response.json();
            showOrderDetailsModal(order);
        } catch (error) {
            console.error('Ошибка при загрузке заказа:', error);
            showToast('Ошибка', 'Не удалось загрузить данные заказа', 'error');
        }
    };

    // Функция для показа модального окна с деталями заказа
    function showOrderDetailsModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        console.log('Order data:', order); // Отладочная информация
        
        // Форматируем дату (используем created_at из GORM)
        const orderDate = new Date(order.created_at || order.CreatedAt);
        const formattedDate = orderDate.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Форматируем сумму (используем total_amount из модели)
        const formattedAmount = new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(order.total_amount || 0);

        // Формируем список товаров
        const itemsList = order.items && order.items.length > 0 ? order.items.map(item => `
            <div style="border: 1px solid #eee; padding: 10px; margin: 5px 0; border-radius: 4px;">
                <strong>${item.build ? item.build.name : 'Товар'}</strong><br>
                Количество: ${item.quantity}<br>
                Цена: ${new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(item.price)}
            </div>
        `).join('') : '<p>Товары не найдены</p>';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <span class="close" onclick="closeOrderDetailsModal()">&times;</span>
                <h3>Детали заказа #${order.id || order.ID}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4>Основная информация</h4>
                        <p><strong>Дата заказа:</strong> ${formattedDate}</p>
                        <p><strong>Статус:</strong> ${getOrderStatusText(order.status || order.Status)}</p>
                        <p><strong>Сумма:</strong> ${formattedAmount}</p>
                        <p><strong>ID пользователя:</strong> ${order.user_id || order.UserID}</p>
                    </div>
                    <div>
                        <h4>Информация о доставке</h4>
                        <p><strong>Адрес:</strong> ${order.shipping_address || order.ShippingAddress || 'Не указан'}</p>
                        <p><strong>Способ доставки:</strong> ${(order.delivery_method || order.DeliveryMethod) === 'courier' ? 'Курьер' : 'Самовывоз'}</p>
                        <p><strong>Способ оплаты:</strong> ${(order.payment_method || order.PaymentMethod) === 'card' ? 'Банковская карта' : 'Наличные'}</p>
                        <p><strong>Комментарий:</strong> ${order.comment || order.Comment || 'Нет комментария'}</p>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <h4>Товары в заказе</h4>
                    ${itemsList}
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="closeOrderDetailsModal()" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                        Закрыть
                    </button>
                    <button onclick="editOrder(${order.id || order.ID})" style="padding: 8px 16px; border: none; background: #3498db; color: white; border-radius: 4px; cursor: pointer;">
                        Редактировать
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Функция для закрытия модального окна с деталями заказа
    window.closeOrderDetailsModal = function() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    };

    // Открыть модальное окно редактирования пользователя
    window.showEditUserModal = function(user) {
        console.log('[DEBUG] Открывается модалка пользователя', user);
        // Закрыть модалку сборки, если она открыта
        const buildModal = document.getElementById('editBuildModal');
        if (buildModal) buildModal.style.display = 'none';
        const modal = document.getElementById('editUserModal');
        if (!modal) return;
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name || '';
        document.getElementById('editUserSurname').value = user.surname || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserPhone').value = user.phone || '';
        document.getElementById('editUserRole').value = user.role || 'user';
        modal.style.display = 'block';
    };

    // Закрыть модальное окно редактирования пользователя
    window.closeEditUserModal = function() {
        const modal = document.getElementById('editUserModal');
        if (modal) modal.style.display = 'none';
    };

    // Обработчик отправки формы редактирования пользователя
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('editUserId').value;
            const data = {
                name: document.getElementById('editUserName').value,
                surname: document.getElementById('editUserSurname').value,
                email: document.getElementById('editUserEmail').value,
                phone: document.getElementById('editUserPhone').value,
                role: document.getElementById('editUserRole').value
            };
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_CONFIG.BASE_URL}/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Ошибка при сохранении пользователя');
                showToast('Пользователь успешно обновлен', 'success');
                window.closeEditUserModal();
                loadUsers();
            } catch (error) {
                showToast('Ошибка при сохранении пользователя', 'error');
            }
        });
    }

    // === Удаление пользователя ===
    window.deleteUser = async function(userId) {
        if (!userId) return;
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Ошибка при удалении пользователя');
            showToast('Пользователь успешно удалён', 'success');
            // Обновляем список пользователей
            if (typeof loadUsers === 'function') loadUsers();
        } catch (error) {
            showToast('Ошибка при удалении пользователя', 'error');
        }
    };

    // === Предпросмотр изображения для формы редактирования сборки ===
    const editBuildImageInput = document.getElementById('editBuildImage');
    const editBuildImagePreview = document.getElementById('editBuildImagePreview');
    if (editBuildImageInput && editBuildImagePreview) {
      editBuildImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function(ev) {
            editBuildImagePreview.style.display = 'flex';
            editBuildImagePreview.querySelector('img').src = ev.target.result;
          };
          reader.readAsDataURL(file);
        } else {
          editBuildImagePreview.style.display = 'none';
          editBuildImagePreview.querySelector('img').src = '';
        }
      });
    }

    // В обработчике submit формы добавляем отладочный вывод
    const editBuildForm = document.getElementById('editBuildForm');
    if (editBuildForm) {
        editBuildForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const idInput = this.querySelector('input[name="id"]');
            console.log('[DEBUG] Скрытое поле id:', idInput);
            console.log('[DEBUG] Значение id:', idInput ? idInput.value : 'idInput не найден');
            const buildId = idInput ? idInput.value : undefined;
            console.log('[DEBUG] submit editBuildForm, buildId:', buildId);

            // Собираем данные формы
            const name = document.getElementById('editBuildName').value;
            const description = document.getElementById('editBuildDescription').value;
            const price = document.getElementById('editBuildPrice').value;
            const cpu_id = document.getElementById('editBuildCPU').value ? parseInt(document.getElementById('editBuildCPU').value) : null;
            const gpu_id = document.getElementById('editBuildGPU').value ? parseInt(document.getElementById('editBuildGPU').value) : null;
            const motherboard_id = document.getElementById('editBuildMotherboard').value ? parseInt(document.getElementById('editBuildMotherboard').value) : null;
            const body_id = document.getElementById('editBuildBody').value ? parseInt(document.getElementById('editBuildBody').value) : null;
            const ram_id = document.getElementById('editBuildRAM').value ? parseInt(document.getElementById('editBuildRAM').value) : null;
            const power_unit_id = document.getElementById('editBuildPowerUnit').value ? parseInt(document.getElementById('editBuildPowerUnit').value) : null;
            const hdd_id = document.getElementById('editBuildHDD').value ? parseInt(document.getElementById('editBuildHDD').value) : null;
            const ssd_id = document.getElementById('editBuildSSD').value ? parseInt(document.getElementById('editBuildSSD').value) : null;

            const data = {
                name,
                description,
                total_price: price,
                cpu_id,
                gpu_id,
                motherboard_id,
                body_id,
                ram_id,
                power_unit_id,
                hdd_id,
                ssd_id
            };

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_CONFIG.BASE_URL}/builds/${buildId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Ошибка при обновлении сборки');
                showToast('Сборка успешно обновлена', 'success');
                window.closeEditBuildModal();
                // Обновите список сборок, если нужно
            } catch (error) {
                showToast('Ошибка при обновлении сборки', 'error');
            }
        });
    }

    // === Примерная стоимость для editBuildModal ===
    function calculateEditBuildCost() {
        const selectIds = [
            'editBuildCPU', 'editBuildGPU', 'editBuildMotherboard',
            'editBuildBody', 'editBuildRAM', 'editBuildPowerUnit',
            'editBuildHDD', 'editBuildSSD'
        ];
        let total = 0;
        selectIds.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select && select.value) {
                const selectedOption = select.options[select.selectedIndex];
                // Извлекаем цену из текста опции
                const match = selectedOption.textContent.match(/-\s*([\d\.]+)\s*₽/);
                if (match) {
                    total += parseFloat(match[1]);
                }
            }
        });
        const markup = Math.round(total * 0.15);
        const final = total + markup;
        document.getElementById('editComponentsCost').textContent = `${total.toLocaleString()} ₽`;
        document.getElementById('editMarkupCost').textContent = `${markup.toLocaleString()} ₽`;
        document.getElementById('editTotalCalculatedCost').textContent = `${final.toLocaleString()} ₽`;
        const priceInput = document.getElementById('editBuildPrice');
        if (priceInput) priceInput.value = final;
    }

    // Навешиваем расчет стоимости на все селекты editBuild*
    function addEditBuildCostHandlers() {
        const selectIds = [
            'editBuildCPU', 'editBuildGPU', 'editBuildMotherboard',
            'editBuildBody', 'editBuildRAM', 'editBuildPowerUnit',
            'editBuildHDD', 'editBuildSSD'
        ];
        selectIds.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select && !select.dataset.costHandlerAdded) {
                select.addEventListener('change', calculateEditBuildCost);
                select.dataset.costHandlerAdded = 'true';
            }
        });
    }

    // Вызов расчета стоимости при открытии модального окна и после заполнения селектов
    // (добавить в showEditBuildModal после заполнения селектов и предпросмотра)
    // ... existing code ...
    // Внутри window.showEditBuildModal после addEditBuildPreviewHandlers();
    addEditBuildCostHandlers();
    calculateEditBuildCost();
    // ... existing code ...

    // === ОТРИСОВКА И УПРАВЛЕНИЕ ОБРАЩЕНИЯМИ ===
    async function loadTickets() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.BASE_URL + '/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка при загрузке обращений');
            const tickets = await response.json();
            updateTicketsList(tickets);
        } catch (error) {
            showToast('Ошибка', 'Не удалось загрузить обращения', 'error');
        }
    }

    function updateTicketsList(tickets) {
        const tbody = document.getElementById('ticketsTableBody');
        if (!tbody) return;
        tbody.innerHTML = tickets.map(ticket => `
            <tr>
                <td>${ticket.name}</td>
                <td>${ticket.phone}</td>
                <td>${ticket.message}</td>
                <td>${ticket.status}</td>
            </tr>
        `).join('');
    }

    window.deleteTicket = async function(id) {
        if (!id) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/requests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка при удалении обращения');
            showToast('Обращение удалено', 'success');
            await loadTickets();
        } catch (error) {
            showToast('Ошибка при удалении обращения', 'error');
        }
    };

    document.getElementById('deleteCompletedRequestsBtn').onclick = async function() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/requests/completed`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка при удалении завершённых обращений');
            showToast('Завершённые обращения удалены', 'success');
            await loadTickets();
        } catch (error) {
            showToast('Ошибка при удалении завершённых обращений', 'error');
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        // ... existing code ...
        // Добавляем обработчик для кнопки массового удаления завершённых обращений
        const delCompletedBtn = document.getElementById('deleteCompletedRequestsBtn');
        if (delCompletedBtn) {
            delCompletedBtn.onclick = async function() {
                if (!confirm('Удалить все завершённые обращения?')) return;
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(API_CONFIG.BASE_URL + '/requests/completed', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Ошибка при удалении завершённых обращений');
                    showToast('Успешно', 'Завершённые обращения удалены', 'success');
                    loadTickets();
                } catch (error) {
                    showToast('Ошибка', 'Не удалось удалить завершённые обращения', 'error');
                }
            };
        }
        // ... существующий код ...
        // Загружаем обращения при открытии секции
        const ticketsTab = document.querySelector('a[data-section="tickets"]');
        if (ticketsTab) {
            ticketsTab.addEventListener('click', loadTickets);
        }
        // Если секция обращений активна по умолчанию
        if (document.getElementById('tickets').style.display !== 'none') {
            loadTickets();
        }
    });
    // ... existing code ...

    // ... существующий код ...
    const addBuildForm = document.getElementById('addBuildForm');
    if (addBuildForm) {
        addBuildForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('buildName').value;
            const description = document.getElementById('buildDescription').value;
            const total_price = String(document.getElementById('buildPrice').value); // всегда строка
            const cpu_id = document.getElementById('buildCPU').value ? parseInt(document.getElementById('buildCPU').value) : null;
            const gpu_id = document.getElementById('buildGPU').value ? parseInt(document.getElementById('buildGPU').value) : null;
            const motherboard_id = document.getElementById('buildMotherboard').value ? parseInt(document.getElementById('buildMotherboard').value) : null;
            const body_id = document.getElementById('buildBody').value ? parseInt(document.getElementById('buildBody').value) : null;
            const ram_id = document.getElementById('buildRAM').value ? parseInt(document.getElementById('buildRAM').value) : null;
            const power_unit_id = document.getElementById('buildPowerUnit').value ? parseInt(document.getElementById('buildPowerUnit').value) : null;
            const hdd_id = document.getElementById('buildHDD').value ? parseInt(document.getElementById('buildHDD').value) : null;
            const ssd_id = document.getElementById('buildSSD').value ? parseInt(document.getElementById('buildSSD').value) : null;
            const data = {
                name,
                description,
                total_price,
                cpu_id,
                gpu_id,
                motherboard_id,
                body_id,
                ram_id,
                power_unit_id,
                hdd_id,
                ssd_id
            };
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_CONFIG.BASE_URL}/builds`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Ошибка при создании сборки');
                showToast('Сборка успешно создана', 'success');
                addBuildForm.reset();
                loadProducts();
            } catch (error) {
                showToast('Ошибка при создании сборки: ' + error.message, 'error');
            }
        });
    }
    // ... существующий код ...
}); 