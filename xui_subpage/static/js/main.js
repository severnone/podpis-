let appSettings = null;
let currentSubscriptionLink = '';
let currentSelectedApp = null;

window.currentSelectedApp = null;
window.currentSubscriptionLink = '';
window.appSettings = null;

function applyMobileOptimizations() {
  const isMobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  if (isMobileUA) {
    document.body.classList.add('mobile-lite');
  } else {
    document.body.classList.remove('mobile-lite');
  }
}

async function loadAppSettings() {
  try {
    appSettings = await window.api.getSettings();
    window.appSettings = appSettings;

    if (appSettings.base_path && window.updateBasePath) {
      window.updateBasePath(appSettings.base_path);
    }

    if (appSettings.language) {
      window.setCurrentLanguage(window.detectUserLanguage(appSettings.language));
    } else {
      window.setCurrentLanguage(window.detectUserLanguage());
    }

    await window.loadAppTexts(window.getCurrentLanguage());

    window.buildPlatformConfigs(appSettings);

    if (window.setGradientColors) {
      window.setGradientColors(appSettings.gradient_colors);
    }

    const baseTheme = appSettings.color_theme || 'dark';
    const initialTheme = window.getPreferredTheme ? window.getPreferredTheme(baseTheme) : baseTheme;

    window.applyColorTheme(initialTheme);

    if (window.initThemeToggle) {
      window.initThemeToggle(initialTheme);
    }

    if (window.setHapticEnabled) {
      window.setHapticEnabled(appSettings.haptic_enabled !== false);
    }

    // Инициализируем праздничные темы
    if (window.initHolidays) {
      window.initHolidays(appSettings);
    }

    // Инициализируем анимации появления
    if (window.initAnimations) {
      window.initAnimations();
    }

  } catch (err) {
    window.setCurrentLanguage(window.detectUserLanguage());
    await window.loadAppTexts(window.getCurrentLanguage());
    const fallbackTheme = window.getPreferredTheme ? window.getPreferredTheme('dark') : 'dark';
    window.applyColorTheme(fallbackTheme);

    if (window.initThemeToggle) {
      window.initThemeToggle(fallbackTheme);
    }
  }
}

async function initializeApp() {
  try {
    applyMobileOptimizations();

    await loadAppSettings();

    window.initializeLanguage();

    window.initLanguageToggle();

    await loadSubscriptionData();

    initializeUI();

    await new Promise(resolve => setTimeout(resolve, 300));

    hidePageLoader();
    document.body.classList.add('page-ready');

    window.onPageLoad?.();

  } catch (error) {
    console.error('Failed to load:', error);
    hidePageLoader();
    document.body.classList.add('page-ready');
  }
}

async function loadSubscriptionData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const keyName = params.get('key_name');

    if (!keyName) {
      throw new Error('key_name is required');
    }

    window.currentKeyName = keyName;

    const data = await window.loadSubscription(keyName);

    currentSubscriptionLink = data.link;
    window.currentSubscriptionLink = data.link;

    if (window.isCryptoLink && appSettings && appSettings.apps) {
      Object.keys(appSettings.apps).forEach(platform => {
        appSettings.apps[platform] = { "Happ": 1 };
      });
    }

    window.updateSubscriptionUI(data, keyName);

    if (typeof window.initVlessSelector === 'function') {
      await window.initVlessSelector(keyName);
    }

    const detectedOS = window.detectOperatingSystem();

    if (window.setPlatform) {
      window.setPlatform(detectedOS);
    }

    window.updatePlatform(detectedOS);

    const platformSelect = document.getElementById('platform-select');
    if (platformSelect) {
      platformSelect.value = detectedOS;
    }

  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}

function showPageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.remove('hidden');
  }
}

function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('hidden');

    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  }
}

function initializeUI() {
  const platformSelect = document.getElementById('platform-select');
  if (platformSelect) {
    platformSelect.addEventListener('change', (e) => {
      window.updatePlatform(e.target.value);
    });
  }


  const getLinkBtn = document.getElementById('get-link-btn');
  if (getLinkBtn) {
    getLinkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.copyKey();
    });
  }
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.onLinkCopy?.();
      window.sharePageLink();
    });
  }

  setupLinkHandler();

  setupSupportLinks();

  if (window.initQRScanner) {
    window.initQRScanner();
  }
}

function setupLinkHandler() {
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    window.telegram.openLink(href);
  });
}

function setupSupportLinks() {
  document.querySelectorAll('.support-chat-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const supportUrl = link.getAttribute('data-support-url');
      if (supportUrl) {
        window.telegram.openTelegramLink(supportUrl);
      }

      return false;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
