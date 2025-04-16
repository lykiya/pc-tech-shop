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
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.STATS, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const stats = await response.json();
                        updateDashboardStats(stats);
                    }
                } catch (error) {
                    console.error('Error loading stats:', error);
                }
                break;
            case 'products':
                // Загрузка товаров
                try {
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS);
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
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ORDERS.LIST);
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
                    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS);
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

    window.updateOrderStatus = async function(orderId, newStatus) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ORDERS.DETAIL.replace(':id', orderId), {
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
    async function loadComponents(category = 'cpu') {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + `?category=${category}`);

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
                const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.DELETE + `?category=${category}&id=${id}`);

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
            let url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST;
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
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке продуктов');
            }
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Ошибка при загрузке продуктов:', error);
            showToast('Не удалось загрузить продукты', 'error');
        }
    }

    async function loadOrders() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ORDERS.LIST);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке заказов');
            }
            const orders = await response.json();
            displayOrders(orders);
        } catch (error) {
            console.error('Ошибка при загрузке заказов:', error);
            showToast('Не удалось загрузить заказы', 'error');
        }
    }

    async function loadUsers() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке пользователей');
            }
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
            showToast('Не удалось загрузить пользователей', 'error');
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
            const categories = ['cpu', 'gpu', 'motherboard', 'body', 'ram', 'power_unit', 'hdd', 'ssd'];
            const components = {};
            
            for (const category of categories) {
                const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + `?category=${category}`);
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

    async function showEditBuildModal(buildId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            // Показываем модальное окно сразу
            const modal = document.getElementById('editBuildModal');
            if (!modal) {
                throw new Error('Модальное окно редактирования не найдено');
            }
            modal.style.display = 'block';

            // Загружаем данные асинхронно
            const [buildResponse, componentsResponse] = await Promise.all([
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BUILDS.DETAIL.replace(':id', buildId), {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                loadComponentsForEdit()
            ]);

            if (!buildResponse.ok) {
                throw new Error('Ошибка при загрузке данных сборки');
            }

            const build = await buildResponse.json();
            console.log('Загруженные данные сборки:', build);

            // Заполняем форму данными сборки
            const form = document.getElementById('editBuildForm');
            if (!form) {
                throw new Error('Форма редактирования не найдена');
            }

            form.querySelector('#editBuildName').value = build.name;
            form.querySelector('#editBuildDescription').value = build.description;
            form.querySelector('#editBuildPrice').value = build.total_price;
            
            // Устанавливаем выбранные компоненты
            form.querySelector('#editBuildCPU').value = build.cpu_id;
            form.querySelector('#editBuildGPU').value = build.gpu_id;
            form.querySelector('#editBuildMotherboard').value = build.motherboard_id;
            form.querySelector('#editBuildBody').value = build.body_id;
            form.querySelector('#editBuildRAM').value = build.ram_id;
            form.querySelector('#editBuildPowerUnit').value = build.power_unit_id;
            form.querySelector('#editBuildHDD').value = build.hdd_id || '';
            form.querySelector('#editBuildSSD').value = build.ssd_id || '';
            
            // Сохраняем ID сборки в форме
            form.dataset.buildId = buildId;
            
            // Обновляем предпросмотр
            updateEditPreview();

            // Фокусируемся на первом поле ввода
            const firstInput = form.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        } catch (error) {
            console.error('Ошибка при открытии модального окна редактирования:', error);
            showToast('Ошибка при загрузке данных сборки: ' + error.message, 'error');
            closeModal('editBuildModal');
        }
    }

    // Обработчик отправки формы редактирования
    document.getElementById('editBuildForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const buildId = this.dataset.buildId;
            const token = localStorage.getItem('token');
            
            // Получаем данные формы
            const formData = {
                name: document.getElementById('editBuildName').value,
                description: document.getElementById('editBuildDescription').value,
                total_price: parseFloat(document.getElementById('editBuildPrice').value),
                cpu_id: parseInt(document.getElementById('editBuildCPU').value),
                gpu_id: parseInt(document.getElementById('editBuildGPU').value),
                motherboard_id: parseInt(document.getElementById('editBuildMotherboard').value),
                body_id: parseInt(document.getElementById('editBuildBody').value),
                ram_id: parseInt(document.getElementById('editBuildRAM').value),
                power_unit_id: parseInt(document.getElementById('editBuildPowerUnit').value),
                hdd_id: document.getElementById('editBuildHDD').value ? parseInt(document.getElementById('editBuildHDD').value) : null,
                ssd_id: document.getElementById('editBuildSSD').value ? parseInt(document.getElementById('editBuildSSD').value) : null
            };

            // Загружаем изображение, если оно выбрано
            const imageFile = document.getElementById('editBuildImage').files[0];
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);

                const imageData = await uploadBuildImage(imageFormData);
                formData.image_url = imageData.image_url;
            }

            // Отправляем данные сборки
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BUILDS.DETAIL.replace(':id', buildId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при обновлении сборки');
            }

            // Закрываем модальное окно и обновляем список сборок
            closeModal('editBuildModal');
            await loadProducts();
            showToast('Сборка успешно обновлена', 'success');
        } catch (error) {
            console.error('Ошибка при обновлении сборки:', error);
            showToast('Ошибка при обновлении сборки: ' + error.message, 'error');
        }
    });

    // Обработчики для кнопок действий
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const button = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
            const id = button.getAttribute('data-id');
            if (id) {
                await showEditBuildModal(id);
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            const table = e.target.closest('table');
            if (!table) return;
            
            const tableId = table.id;
            
            if (tableId === 'products-table') {
                const buildName = e.target.closest('tr').querySelector('td:nth-child(3)').textContent;
                const modal = document.getElementById('deleteConfirmationModal');
                const message = document.getElementById('confirmationMessage');
                const confirmBtn = document.getElementById('confirmDelete');
                const cancelBtn = document.getElementById('cancelDelete');

                // Показываем модальное окно с подтверждением
                message.textContent = `Вы действительно хотите удалить сборку "${buildName}"?`;
                modal.style.display = 'block';

                // Обработчики для кнопок подтверждения
                confirmBtn.onclick = async function() {
                    try {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            throw new Error('Требуется авторизация');
                        }

                        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BUILDS.DETAIL.replace(':id', id), {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Ошибка при удалении сборки');
                        }

                        showToast('Сборка успешно удалена', 'success');
                        await loadProducts();
                        closeModal('deleteConfirmationModal');
                    } catch (error) {
                        console.error('Ошибка при удалении сборки:', error);
                        showToast('Ошибка при удалении сборки: ' + error.message, 'error');
                    }
                };

                // Обработчик отмены удаления
                cancelBtn.onclick = function() {
                    closeModal('deleteConfirmationModal');
                };
            }
        }
    });

    async function loadComponentsForEdit() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            // Загружаем все компоненты параллельно
            const [cpus, gpus, motherboards, bodies, rams, powerUnits, hdds, ssds] = await Promise.all([
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=cpu', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=gpu', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=motherboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=body', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=ram', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=power_unit', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=hdd', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || []),
                fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.COMPONENTS.LIST + '?category=ssd', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()).then(data => data.data || [])
            ]);

            // Заполняем селекты компонентами
            populateSelect('editBuildCPU', cpus);
            populateSelect('editBuildGPU', gpus);
            populateSelect('editBuildMotherboard', motherboards);
            populateSelect('editBuildBody', bodies);
            populateSelect('editBuildRAM', rams);
            populateSelect('editBuildPowerUnit', powerUnits);
            populateSelect('editBuildHDD', hdds);
            populateSelect('editBuildSSD', ssds);

            // Добавляем обработчики изменения для предпросмотра
            addEditPreviewHandlers();

            return true;
        } catch (error) {
            console.error('Ошибка при загрузке компонентов:', error);
            showToast('Ошибка при загрузке компонентов: ' + error.message, 'error');
            return false;
        }
    }

    function populateSelect(selectId, components) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Очищаем селект, оставляя первый option
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Проверяем, что components является массивом
        if (!Array.isArray(components)) {
            console.error(`Компоненты для ${selectId} не являются массивом:`, components);
            return;
        }

        // Добавляем компоненты
        components.forEach(component => {
            const option = document.createElement('option');
            option.value = component.id;
            option.textContent = `${component.name} (${component.price} ₽)`;
            select.appendChild(option);
        });
    }

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
            if (select) {
                select.addEventListener('change', () => updateEditPreview());
            }
        });
    }

    function updateEditPreview() {
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
                const selectedOption = select.options[select.selectedIndex];
                if (selectedOption) {
                    preview.textContent = selectedOption.textContent || 'Не выбран';
                } else {
                    preview.textContent = 'Не выбран';
                }
            }
        });
    }

    // Функция для загрузки пользователей
    async function loadUsers() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Требуется авторизация');
            }

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ADMIN.USERS);

            if (!response.ok) {
                throw new Error('Ошибка при загрузке пользователей');
            }

            const users = await response.json();
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <select class="role-select" data-id="${user.id}">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                        </select>
                    </td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                    <td>
                        <button class="action-btn edit" data-id="${user.id}" title="Изменить роль">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${user.id}" data-name="${user.name}" title="Удалить пользователя">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);

                // Добавляем обработчики событий для кнопок в этой строке
                const deleteBtn = row.querySelector('.action-btn.delete');
                deleteBtn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    const userName = this.getAttribute('data-name');
                    if (userId && userName) {
                        showDeleteConfirmation(userId, userName);
                    }
                });
            });
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
            showToast('Ошибка при загрузке пользователей: ' + error.message, 'error');
        }
    }

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
}); 