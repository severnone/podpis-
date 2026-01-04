let gradientColors = null;

const normalizeColorValue = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

function applyGradientOverrides() {
    const root = document.documentElement;
    if (!root) return;

    const start = normalizeColorValue(gradientColors?.start || gradientColors?.from || gradientColors?.primary);
    const end = normalizeColorValue(gradientColors?.end || gradientColors?.to || gradientColors?.secondary);

    if (!start && !end) {
        root.style.removeProperty('--gradient-start');
        root.style.removeProperty('--gradient-end');
        return;
    }

    if (start) {
        root.style.setProperty('--gradient-start', start);
    } else {
        root.style.removeProperty('--gradient-start');
    }

    if (end) {
        root.style.setProperty('--gradient-end', end);
    } else {
        root.style.removeProperty('--gradient-end');
    }
}

function setGradientColors(colors) {
    gradientColors = colors || null;
    applyGradientOverrides();
}

function applyColorTheme(theme) {
    const body = document.body;

    body.classList.remove('theme-dark', 'theme-cyberpunk', 'theme-ocean', 'theme-light', 'theme-fox', 'theme-gradient');

    body.classList.add(`theme-${theme}`);

    if (theme === 'gradient') {
        applyGradientOverrides();
    }

    try {
        const computed = getComputedStyle(document.body);
        const bgPrimary = computed.getPropertyValue('--bg-primary')?.trim();
        const isGradient = (bgPrimary || '').includes('gradient');

        const fallbackMap = {
            dark: '#1e2329',
            cyberpunk: '#0a0a0f',
            ocean: '#0a1628',
            light: '#f8fafc',
            fox: '#1a0f0a',
            gradient: '#05131a'
        };
        const headerColor = !isGradient && bgPrimary ? bgPrimary : fallbackMap[theme] || '#1e2329';

        const tg = window.Telegram?.WebApp;
        if (tg && tg.setHeaderColor) {
            tg.setHeaderColor(headerColor);
        }
        if (tg && tg.setBackgroundColor) {
            tg.setBackgroundColor(headerColor);
        }
    } catch (_) {}
}

window.applyColorTheme = applyColorTheme;
window.setGradientColors = setGradientColors;
