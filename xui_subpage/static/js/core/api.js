
const API_CONFIG = {
    timeout: 30000,
    defaultHeaders: {
        'Content-Type': 'application/json'
    }
};

async function apiRequest(endpoint, options = {}) {
    const basePath = window.BASE_PATH || '/connect/';
    const url = `${basePath}${endpoint}`;

    const config = {
        timeout: API_CONFIG.timeout,
        headers: { ...API_CONFIG.defaultHeaders },
        ...options,
        headers: { ...API_CONFIG.defaultHeaders, ...options.headers }
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(url, {
            ...config,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.detail || 'Too many requests. Please try again in 5 minutes.';
                window.showError?.(message);
                throw new Error(message);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${config.timeout}ms`);
        }
        throw error;
    }
}

async function apiGet(endpoint, params = {}, options = {}) {
    let url = endpoint;

    if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                searchParams.append(key, value);
            }
        });
        url += `?${searchParams.toString()}`;
    }

    const response = await apiRequest(url, { method: 'GET', ...options });
    return await response.json();
}

async function apiPost(endpoint, data = null, options = {}) {
    const config = {
        method: 'POST',
        ...options
    };

    if (data !== null) {
        config.body = JSON.stringify(data);
    }

    const response = await apiRequest(endpoint, config);
    return await response.json();
}

async function apiPut(endpoint, data, options = {}) {
    const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    });
    return await response.json();
}

async function apiDelete(endpoint, options = {}) {
    const response = await apiRequest(endpoint, { method: 'DELETE', ...options });
    return await response.json();
}

async function getSettings() {
    return await apiGet('api/settings');
}

async function getSubscription(keyName) {
    if (!keyName) {
        throw new Error('key_name is required');
    }

    return await apiGet('api/sub', { key_name: keyName });
}

async function getCountryLinks(keyName) {
    if (!keyName) {
        throw new Error('key_name is required');
    }

    return await apiGet('api/country-links', { key_name: keyName });
}

async function getTexts(language = 'ru') {
    return await apiGet('api/texts', { language });
}

async function startAuth(initData) {
    const basePath = window.BASE_PATH || '/connect/';
    return await fetch(`${basePath}auth/start?init_data=${encodeURIComponent(initData)}`, {
        method: 'POST',
        credentials: 'include'
    });
}

async function getHealth() {
    return await apiGet('health');
}

async function sendToTV(code, subscriptionData) {
    return await apiPost('api/tv', {
        code: code,
        data: subscriptionData
    });
}

window.api = {
    request: apiRequest,
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,

    getSettings,
    getSubscription,
    getCountryLinks,
    getTexts,
    startAuth,
    getHealth,
    sendToTV
};
