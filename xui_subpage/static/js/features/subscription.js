
let subscriptionData = null;

async function loadSubscription(keyName) {
    try {
        if (!keyName) {
            throw new Error('key_name is required');
        }

        subscriptionData = await window.api.getSubscription(keyName);

        const link = subscriptionData.link;
        const isCryptoLink = link && (link.startsWith('happ://crypt3/') || link.startsWith('happ://crypt/'));
        const isVlessLink = link && link.startsWith('vless://');

        window.currentSubscriptionLink = link;
        window.isCryptoLink = isCryptoLink;
        window.isVlessLink = isVlessLink;

        return subscriptionData;
    } catch (error) {
        throw error;
    }
}

function isSubscriptionExpired(expiryDate) {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry <= now;
}

function formatExpiryDate(expiryDate, locale = 'ru-RU') {
    if (!expiryDate) return '';

    const expiry = new Date(expiryDate);
    return expiry.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatRemainingTime(expiryDate) {
    const now = new Date();
    const timeDiff = expiryDate - now;

    if (timeDiff <= 0) {
        return window.t('expired') || 'Истек';
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    const remainingPrefix = window.t('valid_until_date');
    const daysUnit = window.t('time_days');
    const hoursUnit = window.t('time_hours');
    const minutesUnit = window.t('time_minutes');

    if (days > 0) {
        return `${remainingPrefix} ${days}${daysUnit} ${hours}${hoursUnit} ${minutes}${minutesUnit}`;
    }

    if (hours > 0) {
        return `${remainingPrefix} ${hours}${hoursUnit} ${minutes}${minutesUnit}`;
    }

    return `${remainingPrefix} ${minutes}${minutesUnit}`;
}

function checkSubscriptionExpiry() {
    const expiryElement = document.getElementById('subscription-expiry');
    if (!expiryElement) return;

    const expiryDateStr = expiryElement.dataset.expiry;
    if (!expiryDateStr) return;

    const expiryDate = new Date(expiryDateStr);
    const now = new Date();
    const tenHoursFromNow = new Date(now.getTime() + (10 * 60 * 60 * 1000));
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    expiryElement.classList.remove('expiring-soon', 'critical-expiry');

    if (expiryDate <= tenHoursFromNow) {
        expiryElement.classList.add('critical-expiry');
    } else if (expiryDate <= threeDaysFromNow) {
        expiryElement.classList.add('expiring-soon');
    }
}

function updateSubscriptionUI(data, fallbackKeyName = null) {
    const subscriptionKeyname = document.getElementById('subscription-keyname');
    if (subscriptionKeyname) {
        const keyName = data.email || fallbackKeyName || window.t('subscription_active');

        let badges = '';
        if (window.isVlessLink) {
            badges += '<span class="protocol-badge">VLESS</span>';
        }
        if (window.isCryptoLink) {
            badges += '<i class="fas fa-lock crypto-lock-icon"></i>';
        }

        if (badges) {
            subscriptionKeyname.innerHTML = `${keyName} ${badges}`;
        } else {
            subscriptionKeyname.textContent = keyName;
        }
    }

    const subscriptionExpiry = document.getElementById('subscription-expiry');
    const subscriptionStatus = document.getElementById('subscription-status');

    if (data.expiry) {
        const expiryDate = new Date(data.expiry);
        const isExpired = isSubscriptionExpired(data.expiry);

        if (subscriptionExpiry) {
            subscriptionExpiry.dataset.expiry = data.expiry;

            const remainingTimeText = formatRemainingTime(expiryDate);
            subscriptionExpiry.textContent = remainingTimeText;

            setTimeout(() => checkSubscriptionExpiry(), 100);
        }

        if (subscriptionStatus) {
            if (isExpired) {
                subscriptionStatus.classList.add('expired');
                subscriptionStatus.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                subscriptionStatus.classList.remove('expired');
                subscriptionStatus.innerHTML = '<i class="fas fa-check"></i>';
            }
        }
    }

    const keyValue = document.getElementById('key-value');
    if (keyValue) {
        keyValue.textContent = data.link;
    }

    const qrImage = document.getElementById('qr-image');
    if (qrImage && data.link) {
        const qrKeyName = data.email || fallbackKeyName;
        if (qrKeyName) {
            const basePath = window.BASE_PATH || '';
            qrImage.src = `${basePath}api/qr?key_name=${encodeURIComponent(qrKeyName)}`;
        } else {
            qrImage.src = '';
        }
    }
}

function getCurrentSubscription() {
    return subscriptionData;
}

function getSubscriptionLink() {
    return subscriptionData?.link || null;
}

window.loadSubscription = loadSubscription;
window.isSubscriptionExpired = isSubscriptionExpired;
window.formatExpiryDate = formatExpiryDate;
window.formatRemainingTime = formatRemainingTime;
window.checkSubscriptionExpiry = checkSubscriptionExpiry;
window.updateSubscriptionUI = updateSubscriptionUI;
window.getCurrentSubscription = getCurrentSubscription;
window.getSubscriptionLink = getSubscriptionLink;
