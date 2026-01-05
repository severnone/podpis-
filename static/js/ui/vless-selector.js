(function () {
    const state = {
        open: false,
        listenersAttached: false,
        resizeListenerAttached: false,
        elements: {
            container: null,
            trigger: null,
            menu: null,
            chevron: null,
        },
        keyName: null,
    };

    function getText(key, fallback) {
        if (typeof window.t === 'function') {
            const value = window.t(key);
            if (value && typeof value === 'string') {
                return value;
            }
        }
        return fallback;
    }

    function syncMenuWidth() {
        const { container, menu } = state.elements;
        if (!container || !menu) {
            return;
        }

        const subscriptionInfo = container.closest('.subscription-info');
        if (!subscriptionInfo) {
            return;
        }

        const infoRect = subscriptionInfo.getBoundingClientRect();
        const triggerRect = container.getBoundingClientRect();

        if (!infoRect || !triggerRect) {
            return;
        }

        const availableWidth = Math.floor(infoRect.right - triggerRect.left);
        if (availableWidth > 0) {
            menu.style.setProperty('--vless-menu-max-width', `${availableWidth}px`);
        } else {
            menu.style.removeProperty('--vless-menu-max-width');
        }
    }

    function renderPlaceholder(menu, message) {
        if (!menu) {
            return;
        }
        menu.innerHTML = '';
        const placeholder = document.createElement('div');
        placeholder.className = 'vless-empty';
        placeholder.textContent = message;
        menu.appendChild(placeholder);
    }

    function closeDropdown() {
        const { container, menu, trigger } = state.elements;
        if (!container || !menu || !trigger) {
            return;
        }
        state.open = false;
        container.classList.remove('open');
        menu.classList.remove('show');
        trigger.setAttribute('aria-expanded', 'false');
    }

    function openDropdown() {
        const { container, menu, trigger } = state.elements;
        if (!container || !menu || !trigger) {
            return;
        }
        state.open = true;
        container.classList.add('open');
        syncMenuWidth();
        menu.classList.add('show');
        trigger.setAttribute('aria-expanded', 'true');
    }

    function toggleDropdown() {
        if (state.open) {
            closeDropdown();
        } else {
            if (typeof window.lightImpact === 'function') {
                window.lightImpact();
            }
            syncMenuWidth();
            openDropdown();
        }
    }

    function handleDocumentClick(event) {
        const { container } = state.elements;
        if (!state.open || !container) {
            return;
        }
        if (!container.contains(event.target)) {
            closeDropdown();
        }
    }

    function handleKeydown(event) {
        if (!state.open) {
            return;
        }
        if (event.key === 'Escape') {
            closeDropdown();
        }
    }

    function attachGlobalListeners() {
        if (state.listenersAttached) {
            return;
        }
        document.addEventListener('click', handleDocumentClick, { capture: true });
        document.addEventListener('keydown', handleKeydown);
        state.listenersAttached = true;

        if (!state.resizeListenerAttached) {
            window.addEventListener('resize', () => {
                if (state.open) {
                    syncMenuWidth();
                }
            });
            state.resizeListenerAttached = true;
        }
    }

    function attachTriggerListener(trigger) {
        if (!trigger || trigger.dataset.vlessSelectorBound === 'true') {
            return;
        }
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            toggleDropdown();
        });
        trigger.dataset.vlessSelectorBound = 'true';
    }

    function handleOptionSelect(country) {
        if (!country || !country.link) {
            return;
        }
        if (typeof window.mediumImpact === 'function') {
            window.mediumImpact();
        }
        const successTemplate = getText('country_link_copied', 'Link for {country} copied!');
        const successMessage = successTemplate.replace('{country}', country.country || '');
        const errorMessage = getText('failed_to_copy', 'Failed to copy link');
        if (typeof window.copyText === 'function') {
            window.copyText(country.link, successMessage, errorMessage);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(country.link).then(() => {
                if (typeof window.showSuccess === 'function') {
                    window.showSuccess(successMessage);
                }
            }).catch(() => {
                if (typeof window.showError === 'function') {
                    window.showError(errorMessage);
                }
            });
        }
        closeDropdown();
    }

    function createOptionElement(country) {
        const option = document.createElement('div');
        option.className = 'vless-option';
        option.setAttribute('role', 'option');
        option.setAttribute('tabindex', '0');

        const protocolBadge = document.createElement('span');
        protocolBadge.className = 'vless-option-protocol';
        protocolBadge.textContent = 'VLESS';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'vless-option-name';
        nameSpan.textContent = country.country || '';

        option.appendChild(protocolBadge);
        option.appendChild(nameSpan);

        option.addEventListener('click', () => handleOptionSelect(country));
        option.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOptionSelect(country);
            }
        });
        return option;
    }

    function renderCountries(menu, countries) {
        if (!menu) {
            return;
        }
        menu.innerHTML = '';
        countries.forEach((country) => {
            const option = createOptionElement(country);
            menu.appendChild(option);
        });
        syncMenuWidth();
    }

    async function initVlessSelector(keyName) {
        if (window.appSettings && window.appSettings.vless_selector_enabled === false) {
            const container = document.getElementById('vless-selector');
            if (container) {
                container.hidden = true;
                const keyRow = container.closest('.subscription-keyrow');
                if (keyRow) {
                    keyRow.classList.remove('vless-selector-visible');
                }
            }
            return;
        }

        const container = document.getElementById('vless-selector');
        const trigger = document.getElementById('vless-trigger');
        const menu = document.getElementById('vless-menu');
        const chevron = document.getElementById('vless-chevron');

        if (!container || !trigger || !menu || !window.api || typeof window.api.getCountryLinks !== 'function') {
            return;
        }

        state.elements = { container, trigger, menu, chevron };
        state.keyName = keyName;
        state.open = false;
        container.classList.remove('open');
        menu.classList.remove('show');
        trigger.setAttribute('aria-expanded', 'false');

        if (!keyName) {
            container.hidden = true;
            const keyRow = container.closest('.subscription-keyrow');
            if (keyRow) {
                keyRow.classList.remove('vless-selector-visible');
            }
            return;
        }

        renderPlaceholder(menu, getText('country_loading', 'Loading servers...'));
        container.hidden = true;

        try {
            const response = await window.api.getCountryLinks(keyName);
            const countries = Array.isArray(response?.countries) ? response.countries : [];

            if (!countries || countries.length <= 1) {
                container.hidden = true;
                const keyRow = container.closest('.subscription-keyrow');
                if (keyRow) {
                    keyRow.classList.remove('vless-selector-visible');
                }
                menu.innerHTML = '';
                return;
            }

            renderCountries(menu, countries);
            container.hidden = false;
            const keyRow = container.closest('.subscription-keyrow');
            if (keyRow) {
                keyRow.classList.add('vless-selector-visible');
            }
            attachTriggerListener(trigger);
            attachGlobalListeners();
        } catch (error) {
            console.error('vless-selector: failed to load links', error);
            renderPlaceholder(menu, getText('country_not_available', 'Servers are unavailable'));
            container.hidden = true;
            const keyRow = container.closest('.subscription-keyrow');
            if (keyRow) {
                keyRow.classList.remove('vless-selector-visible');
            }
        }
    }

    window.initVlessSelector = initVlessSelector;
    window.closeVlessDropdown = closeDropdown;
})();
