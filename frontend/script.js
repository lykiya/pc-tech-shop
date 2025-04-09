document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    
    // Проверяем авторизацию при загрузке страницы
    updateAuthUI();
    
    // Обработчик формы регистрации
    if (registrationForm) {
        const messageDiv = document.getElementById('message');

        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Проверка совпадения паролей
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                showMessage('Пароли не совпадают', 'error');
                return;
            }

            // Собираем данные из формы
            const formData = {
                name: document.getElementById('name').value,
                surname: document.getElementById('surname').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                password: password
            };

            try {
                const response = await fetch('http://localhost:8080/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('Регистрация успешна! Перенаправление на страницу входа...', 'success');
                    // Очистка формы
                    registrationForm.reset();
                    // Перенаправление на страницу входа через 2 секунды
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Ошибка при регистрации', 'error');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage('Произошла ошибка при отправке данных', 'error');
            }
        });

        // Функция для отображения сообщений для страницы регистрации
        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = 'auth-message ' + type;
            messageDiv.style.display = 'block';
        }
    }

    // Обработчик формы логина
    if (loginForm) {
        const messageDiv = document.getElementById('message');

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8080/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Login response:', data);
                    
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('role', data.user.role);
                    
                    console.log('Stored user:', JSON.parse(localStorage.getItem('user')));
                    console.log('Stored role:', localStorage.getItem('role'));
                    
                    // Проверяем роль из токена
                    const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
                    console.log('Token payload:', tokenPayload);
                    
                    if (tokenPayload.role === 'admin') {
                        console.log('User is admin, redirecting to admin page');
                        window.location.href = 'admin.html';
                    } else {
                        console.log('User is not admin, redirecting to index page');
                        window.location.href = 'index.html';
                    }
                } else {
                    const error = await response.json();
                    messageDiv.textContent = error.error || 'Ошибка при входе';
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Login error:', error);
                messageDiv.textContent = 'Ошибка при входе';
                messageDiv.style.color = 'red';
            }
        });

        // Функция для отображения сообщений для страницы логина
        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = 'auth-message ' + type;
            messageDiv.style.display = 'block';
        }
    }

    // Функция для обновления UI в зависимости от статуса авторизации
    function updateAuthUI() {
        const loginLink = document.querySelector('.login-link');
        if (!loginLink) {
            console.log('Login link not found');
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        console.log('updateAuthUI - User:', user);
        console.log('updateAuthUI - Token:', token);
        console.log('updateAuthUI - Role:', role);

        if (user && token) {
            // Создаем выпадающее меню для пользователя
            const userMenu = document.createElement('div');
            userMenu.className = 'user-menu';
            userMenu.innerHTML = `
                <a href="#" class="user-name">${user.name} ▼</a>
                <div class="user-dropdown">
                    <a href="profile.html">Профиль</a>
                    <a href="orders.html">Мои заказы</a>
                    ${role === 'admin' ? '<a href="admin.html">Панель администратора</a>' : ''}
                    <a href="#" class="logout">Выйти</a>
                </div>
            `;

            // Заменяем ссылку на вход на меню пользователя
            loginLink.parentNode.replaceChild(userMenu, loginLink);

            // Добавляем обработчик для выхода
            const logoutButton = document.querySelector('.logout');
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Logout clicked');
                
                // Очищаем все данные авторизации
                localStorage.clear();
                console.log('LocalStorage cleared');
                
                // Перенаправляем на страницу входа
                window.location.href = 'login.html';
            });
        }
    }
});

function displayBuilds(builds) {
    const container = document.getElementById('builds-container');
    
    container.innerHTML = builds.map(build => {
        // Сначала выведем в консоль для отладки
        console.log('Build:', build);
        console.log('CPU name:', build.cpu?.name);
        console.log('GPU name:', build.gpu?.name);
        
        return `
            <div class="category-card">
                <img src="${build.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'}" 
                     alt="${build.name}" 
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1rem;">
                <h3>${build.name}</h3>
                <p>${build.description}</p>
                <div class="component-list" style="text-align: left; margin: 1rem 0;">
                    <p><strong>Процессор:</strong> ${build.cpu ? build.cpu.name : 'Не указан'}</p>
                    <p><strong>Видеокарта:</strong> ${build.gpu ? build.gpu.name : 'Не указана'}</p>
                    <p><strong>Материнская плата:</strong> ${build.motherboard ? build.motherboard.name : 'Не указана'}</p>
                    <p><strong>ОЗУ:</strong> ${build.ram ? build.ram.name : 'Не указано'}</p>
                    <p><strong>Блок питания:</strong> ${build.power_unit ? build.power_unit.name : 'Не указан'}</p>
                    <p><strong>Корпус:</strong> ${build.body ? build.body.name : 'Не указан'}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span style="font-size: 1.2rem; font-weight: bold; color: var(--primary-color);">
                        ${build.total_price ? `${build.total_price.toLocaleString()} ₽` : 'Цена не указана'}
                    </span>
                    <a href="#" class="category-link">Подробнее</a>
                </div>
            </div>
        `;
    }).join('');
}

// Код для страницы сборок
if (window.location.pathname.includes('builds.html')) {
    let allBuilds = [];
    let currentPage = 1;
    const buildsPerPage = 5;

    // Функция для получения параметра из URL
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Функция для загрузки конкретной сборки
    async function loadBuildById(id) {
        try {
            const response = await fetch(`http://localhost:8080/builds/${id}`);
            if (!response.ok) {
                throw new Error('Сборка не найдена');
            }
            const build = await response.json();
            
            // Очищаем контейнер и отображаем только одну сборку
            const container = document.getElementById('builds-container');
            container.innerHTML = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${build.image_url || 'images/placeholder.jpg'}" alt="${build.name}">
                    </div>
                    <div class="product-info">
                        <h2>${build.name}</h2>
                        <p>${build.description}</p>
                        <div class="product-price">
                            <span class="price">${build.total_price.toLocaleString()} ₽</span>
                            <button onclick="addToCart(${build.id})" class="add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i> Добавить в корзину
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Ошибка при загрузке сборки:', error);
            const container = document.getElementById('builds-container');
            container.innerHTML = '<p class="error-message">Ошибка при загрузке сборки. Пожалуйста, попробуйте позже.</p>';
        }
    }

    // Функция для загрузки сборок
    async function loadBuilds() {
        try {
            const response = await fetch('http://localhost:8080/builds');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const builds = await response.json();
            console.log('Полученные сборки:', builds);

            if (!builds || builds.length === 0) {
                throw new Error('Сборки не найдены');
            }

            allBuilds = builds;
            displayBuilds(builds);
        } catch (error) {
            console.error('Ошибка при загрузке сборок:', error);
            const buildsContainer = document.getElementById('builds-container');
            buildsContainer.innerHTML = `
                <div class="error-message">
                    <p>Ошибка при загрузке сборок. Пожалуйста, попробуйте позже.</p>
                    <p>Детали ошибки: ${error.message}</p>
                </div>
            `;
        }
    }

    // Функция для отображения сборок
    function displayBuilds(builds) {
        const buildsContainer = document.getElementById('builds-container');
        buildsContainer.innerHTML = '';

        if (!builds || builds.length === 0) {
            buildsContainer.innerHTML = '<p class="empty-message">Сборки не найдены</p>';
            return;
        }

        builds.forEach(build => {
            const buildCard = document.createElement('div');
            buildCard.className = 'build-card';
            buildCard.innerHTML = `
                <div class="build-image">
                    <img src="${build.image_url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}" 
                         alt="${build.name}">
                </div>
                <div class="build-info">
                    <h3><a href="product-details.html?id=${build.id}&type=build" class="build-link">${build.name}</a></h3>
                    <p>${build.description}</p>
                    <div class="build-price">
                        <span class="price">${build.total_price.toLocaleString()} ₽</span>
                        <button onclick="addToCart(${build.id})" class="add-to-cart-btn">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `;
            buildsContainer.appendChild(buildCard);
        });
    }

    function changePage(page) {
        currentPage = page;
        displayBuilds();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Функция для применения фильтров
    function applyFilters() {
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        const purpose = document.getElementById('purpose').value;
        const processor = document.getElementById('processor').value;
        const vram = document.getElementById('vram').value;

        let filteredBuilds = allBuilds.filter(build => {
            // Фильтр по цене
            if (minPrice && build.total_price < parseFloat(minPrice)) return false;
            if (maxPrice && build.total_price > parseFloat(maxPrice)) return false;

            // Фильтр по назначению (на основе названия)
            if (purpose) {
                const name = build.name.toLowerCase();
                if (purpose === 'gaming' && !name.includes('игровой')) return false;
                if (purpose === 'work' && !name.includes('рабочий')) return false;
                if (purpose === 'universal' && !name.includes('универсальный')) return false;
            }

            // Фильтр по производителю процессора
            if (processor) {
                const cpuName = build.cpu.name.toLowerCase();
                if (processor === 'intel' && !cpuName.includes('intel')) return false;
                if (processor === 'amd' && !cpuName.includes('amd')) return false;
            }

            // Фильтр по объему видеопамяти
            if (vram && build.gpu.vram !== parseInt(vram)) return false;

            return true;
        });

        displayBuilds(filteredBuilds);
    }

    // Функция для сброса фильтров
    function resetFilters() {
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        document.getElementById('purpose').value = '';
        document.getElementById('processor').value = '';
        document.getElementById('vram').value = '';
        displayBuilds(allBuilds);
    }

    // Проверяем, есть ли параметр id в URL
    const buildId = getUrlParameter('id');
    if (buildId) {
        loadBuildById(buildId);
    } else {
        loadBuilds();
    }
}