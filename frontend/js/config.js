// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://pc-tech-shop-1-backend.onrender.com', // URL вашего бэкенда на Render
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/login',
            REGISTER: '/register',
            ME: '/users/me'
        },
        BUILDS: {
            LIST: '/builds',
            DETAIL: '/builds/:id',
            UPLOAD: '/builds/upload'
        },
        CART: {
            LIST: '/cart',
            ADD: '/cart',
            REMOVE: '/cart/:id',
            CLEAR: '/cart/clear'
        },
        ORDERS: {
            LIST: '/orders',
            CREATE: '/orders',
            DETAIL: '/orders/:id'
        },
        ADMIN: {
            STATS: '/admin/stats',
            USERS: '/admin/users',
            PRODUCTS: '/admin/products'
        },
        COMPONENTS: {
            LIST: '/components',
            DETAIL: '/components/:id'
        }
    }
};

// Helper function to build API URL
function buildApiUrl(endpoint, params = {}) {
    let url = API_CONFIG.BASE_URL + endpoint;
    Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
    });
    return url;
} 