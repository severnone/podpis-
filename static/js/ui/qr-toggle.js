let qrToggleState = false;

function initQRToggle() {
    const toggleBtn = document.getElementById('qr-toggle-btn');
    const qrWrapper = document.getElementById('qr-code-wrapper');
    const qrImage = document.getElementById('qr-code-image');
    const subscriptionCard = document.querySelector('.subscription-card');

    if (!toggleBtn || !qrWrapper || !qrImage || !subscriptionCard) {
        return;
    }

    toggleBtn.addEventListener('click', async function() {
        qrToggleState = !qrToggleState;

        if (qrToggleState) {
            const keyName = window.getCurrentSubscription()?.email;
            if (!keyName) {
                console.error('No subscription email found');
                qrToggleState = false;
                return;
            }

            const basePath = window.BASE_PATH || '';
            const qrUrl = basePath + 'api/qr?key_name=' + encodeURIComponent(keyName);
            qrImage.src = qrUrl;

            subscriptionCard.classList.add('qr-expanded');
            qrWrapper.style.display = 'flex';

            toggleBtn.title = 'Скрыть QR код';
            
            const qrHint = document.querySelector('.qr-code-hint');
            if (qrHint && window.t) {
                qrHint.innerHTML = window.t('qr_hint');
            }

            lightImpact();
        } else {
            subscriptionCard.classList.remove('qr-expanded');
            qrWrapper.style.display = 'none';

            toggleBtn.title = 'Показать QR код';

            lightImpact();
        }
    });
    
    if (window.updatePageLanguage) {
        window.updatePageLanguage();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initQRToggle, 500);
});

window.initQRToggle = initQRToggle;
