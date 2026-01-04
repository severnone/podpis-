// ========================================
// 🎬 АНИМАЦИИ ПОЯВЛЕНИЯ
// ========================================

/**
 * Инициализирует анимации появления элементов
 */
function initAnimations() {
    // Небольшая задержка чтобы DOM был готов
    requestAnimationFrame(function() {
        animateElements();
    });
}

/**
 * Запускает анимации для основных элементов страницы
 */
function animateElements() {
    const elementsToAnimate = [
        { selector: '.header', delay: 1 },
        { selector: '.subscription-card', delay: 2 },
        { selector: '.installation-header', delay: 3 },
        { selector: '#app-selector', delay: 4 },
        { selector: '.share-menu', delay: 5 },
        { selector: '.language-selector', delay: 6 }
    ];
    
    elementsToAnimate.forEach(function(item) {
        const element = document.querySelector(item.selector);
        if (element) {
            element.classList.add('animate-on-load');
            // Запускаем анимацию
            requestAnimationFrame(function() {
                element.classList.add('animate-in', 'animate-delay-' + item.delay);
            });
        }
    });
}

/**
 * Анимирует шаги установки (вызывается после их создания)
 */
function animateSteps() {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach(function(step, index) {
        step.style.opacity = '0';
        step.style.transform = 'translateY(15px)';
        
        setTimeout(function() {
            step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, 50 + (index * 80));
    });
}

/**
 * Анимирует кнопки приложений (вызывается после их создания)
 */
function animateAppButtons() {
    const buttons = document.querySelectorAll('.app-button');
    
    buttons.forEach(function(btn, index) {
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0.9)';
        
        setTimeout(function() {
            btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        }, 30 + (index * 50));
    });
}

/**
 * Анимация для одного элемента
 */
function animateElement(element, type, delay) {
    if (!element) return;
    
    type = type || 'fadeSlideUp';
    delay = delay || 0;
    
    element.style.opacity = '0';
    
    setTimeout(function() {
        element.classList.add('animate-in');
    }, delay);
}

// Экспорт
window.initAnimations = initAnimations;
window.animateSteps = animateSteps;
window.animateAppButtons = animateAppButtons;
window.animateElement = animateElement;
