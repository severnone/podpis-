
function normalizePath(path) {
    if (!path) {
        return '/';
    }

    let normalized = path;

    if (!normalized.startsWith('/')) {
        normalized = `/${normalized}`;
    }

    if (!normalized.endsWith('/')) {
        normalized = `${normalized}/`;
    }

    return normalized;
}

let BASE_PATH = normalizePath(window.BASE_PATH || '/connect/');
let REDIRECT_BASE = `${window.location.origin}${BASE_PATH}?url=`;

function syncGlobals() {
    window.BASE_PATH = BASE_PATH;
    window.REDIRECT_BASE = REDIRECT_BASE;
}

function updateBasePath(newPath) {
    if (!newPath) {
        return;
    }

    const normalized = normalizePath(newPath);
    if (normalized === BASE_PATH) {
        return;
    }

    BASE_PATH = normalized;
    REDIRECT_BASE = `${window.location.origin}${BASE_PATH}?url=`;
    syncGlobals();
}

syncGlobals();
window.updateBasePath = updateBasePath;
