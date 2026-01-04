function getCleanShareUrl() {
    try {
        const url = new URL(window.location.href);
        const keyName = url.searchParams.get('key_name');

        if (!keyName) {
            return url.origin + url.pathname;
        }

        const cleanUrl = url.origin + url.pathname + '?key_name=' + encodeURIComponent(keyName);
        return cleanUrl;
    } catch (err) {
        console.error('Failed to parse URL:', err);
        return window.location.origin + window.location.pathname;
    }
}

let shareDropdownMenu = null;
let isShareDropdownOpen = false;

function buildTelegramShareUrl(url, text) {
    const message = `${text}\n\n${url}`.trim();
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
}

async function sharePageLink() {
    const pageUrl = getCleanShareUrl();
    const projectName = window.appSettings?.project_name || 'VPN Subscription';
    let shareMessage = window.t?.('share_message') || '';

    if (shareMessage === 'share_message' || !shareMessage.trim()) {
        shareMessage = '';
    }

    const fullText = shareMessage ? `${shareMessage}\n\n${pageUrl}` : pageUrl;
    const tg = window.telegram?.getWebApp?.();
    const isTelegramWebApp = tg && window.telegram?.isAvailable?.();

    if (navigator.share) {
        const shareData = {
            title: projectName,
            text: fullText
        };

        try {
            await navigator.share(shareData);
            console.log('Shared successfully via navigator.share');
            return;
        } catch (err) {
            console.error('Share error:', err.name, err.message);
            if (err.name === 'AbortError') {
                console.log('User cancelled sharing');
                return;
            }
        }
    }

    if (isTelegramWebApp && /Android/i.test(navigator.userAgent)) {
        toggleShareDropdown(pageUrl, shareMessage || projectName);
    } else {
        await copyToClipboard(pageUrl, shareMessage);
        window.showSuccess?.('Link copied! Share it with your friends');
    }
}

function toggleShareDropdown(url, text) {
    if (isShareDropdownOpen && shareDropdownMenu) {
        closeShareDropdown();
        return;
    }

    if (window.lightImpact) {
        window.lightImpact();
    }

    const shareButton = document.getElementById('share-btn');
    if (!shareButton) {
        console.error('Share button not found');
        return;
    }

    if (!shareDropdownMenu) {
        shareDropdownMenu = createShareDropdownMenu(url, text);
        shareButton.parentElement.style.position = 'relative';
        shareButton.parentElement.appendChild(shareDropdownMenu);
    } else {
        updateShareDropdownData(url, text);
    }

    requestAnimationFrame(() => {
        shareDropdownMenu.classList.add('show');
        isShareDropdownOpen = true;
    });

    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 0);
}

function createShareDropdownMenu(url, text) {
    const menu = document.createElement('div');
    menu.className = 'share-dropdown-menu';
    menu.id = 'share-dropdown-menu';

    const telegramOption = createShareDropdownOption(
        'fab fa-telegram',
        window.t?.('share_telegram') || 'Telegram',
        () => {
            if (window.mediumImpact) {
                window.mediumImpact();
            }

            const shareUrl = buildTelegramShareUrl(url, text);
            window.telegram.openTelegramLink(shareUrl);
            closeShareDropdown();
        }
    );

    const browserOption = createShareDropdownOption(
        'fas fa-globe',
        window.t?.('share_browser') || 'Open in Browser',
        () => {
            if (window.mediumImpact) {
                window.mediumImpact();
            }

            const shareUrl = new URL(url);
            shareUrl.searchParams.set('auto_share', '1');
            shareUrl.searchParams.set('share_text', text);
            window.telegram.openLink(shareUrl.toString());
            closeShareDropdown();
        }
    );

    const copyOption = createShareDropdownOption(
        'fas fa-copy',
        window.t?.('share_copy') || 'Copy Link',
        async () => {
            const copySuccess = await copyToClipboard(url, text);
            if (copySuccess) {
                if (window.successNotification) {
                    window.successNotification();
                }
                window.showSuccess?.(window.t?.('link_copied') || 'Link copied!');
            } else {
                if (window.errorNotification) {
                    window.errorNotification();
                }
            }
            closeShareDropdown();
        }
    );

    menu.appendChild(telegramOption);
    menu.appendChild(browserOption);
    menu.appendChild(copyOption);

    return menu;
}

function createShareDropdownOption(iconClass, text, onClick) {
    const option = document.createElement('div');
    option.className = 'share-dropdown-option';

    const icon = document.createElement('i');
    icon.className = iconClass;

    const textSpan = document.createElement('span');
    textSpan.className = 'share-dropdown-option-text';
    textSpan.textContent = text;

    option.appendChild(icon);
    option.appendChild(textSpan);

    option.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });

    return option;
}

function updateShareDropdownData(url, text) {
    if (!shareDropdownMenu) return;

    const options = shareDropdownMenu.querySelectorAll('.share-dropdown-option');

    if (options[0]) {
        const newHandler = () => {
            if (window.mediumImpact) {
                window.mediumImpact();
            }
            const shareUrl = buildTelegramShareUrl(url, text);
            window.telegram.openTelegramLink(shareUrl);
            closeShareDropdown();
        };
        options[0].replaceWith(createShareDropdownOption('fab fa-telegram', window.t?.('share_telegram') || 'Telegram', newHandler));
    }

    if (options[1]) {
        const newHandler = () => {
            if (window.mediumImpact) {
                window.mediumImpact();
            }
            const shareUrl = new URL(url);
            shareUrl.searchParams.set('auto_share', '1');
            shareUrl.searchParams.set('share_text', text);
            window.telegram.openLink(shareUrl.toString());
            closeShareDropdown();
        };
        options[1].replaceWith(createShareDropdownOption('fas fa-globe', window.t?.('share_browser') || 'Open in Browser', newHandler));
    }

    if (options[2]) {
        const newHandler = async () => {
            const copySuccess = await copyToClipboard(url, text);
            if (copySuccess) {
                if (window.successNotification) {
                    window.successNotification();
                }
                window.showSuccess?.(window.t?.('link_copied') || 'Link copied!');
            } else {
                if (window.errorNotification) {
                    window.errorNotification();
                }
            }
            closeShareDropdown();
        };
        options[2].replaceWith(createShareDropdownOption('fas fa-copy', window.t?.('share_copy') || 'Copy Link', newHandler));
    }
}

function closeShareDropdown() {
    if (shareDropdownMenu) {
        shareDropdownMenu.classList.remove('show');
    }
    isShareDropdownOpen = false;
    document.removeEventListener('click', handleOutsideClick);
}

function handleOutsideClick(e) {
    const shareButton = document.getElementById('share-btn');
    if (shareDropdownMenu && !shareDropdownMenu.contains(e.target) && e.target !== shareButton) {
        closeShareDropdown();
    }
}

async function copyToClipboard(url, shareMessage) {
    const textToCopy = shareMessage ? `${shareMessage}\n\n${url}` : url;

    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
            console.log('Copied to clipboard');
            return true;
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.top = '-1000px';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            console.log('Copied via execCommand:', success);
            return success;
        }
    } catch (err) {
        console.error('Copy failed:', err);
        window.showError?.('Failed to copy link');
        return false;
    }
}

function sharePageLinkFallback(url, shareMessage) {
    const textToCopy = shareMessage ? `${shareMessage}\n\n${url}` : url;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            window.showSuccess?.('Link copied! Share it with your friends');
        }).catch(() => {
            copyPageLinkFallback(textToCopy);
        });
    } else {
        copyPageLinkFallback(textToCopy);
    }
}

function copyPageLinkFallback(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        window.showSuccess?.('Link copied! Share it with your friends');
    } catch (err) {
        window.showError?.('Failed to copy link');
    }
}

window.sharePageLink = sharePageLink;
