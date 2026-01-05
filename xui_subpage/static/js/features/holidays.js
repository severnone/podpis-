// ========================================
// 🎄 ПРАЗДНИЧНЫЕ ТЕМЫ
// ========================================

let holidayConfig = null;
let currentHoliday = null;
const HOLIDAY_DISABLED_KEY = 'holiday_disabled';
const HOLIDAY_GREETING_SHOWN_KEY = 'holiday_greeting_shown';

/**
 * Инициализирует праздничные темы
 */
function initHolidays(settings) {
    console.log('[Holidays] Init called, settings:', settings);
    
    // Если праздники отключены на сервере — очищаем все данные
    if (!settings || !settings.holidays || !settings.holidays.enabled) {
        console.log('[Holidays] Disabled or no settings');
        clearHolidayData();
        return;
    }
    
    holidayConfig = settings.holidays;
    console.log('[Holidays] Config loaded:', holidayConfig);
    
    // Проверяем, отключил ли пользователь праздники
    if (isHolidayDisabledByUser()) {
        console.log('[Holidays] Disabled by user');
        return;
    }
    
    // Определяем текущий праздник
    currentHoliday = detectCurrentHoliday();
    console.log('[Holidays] Current holiday:', currentHoliday);
    
    if (currentHoliday) {
        applyHolidayTheme(currentHoliday);
        createHolidayEffects(currentHoliday);
        showHolidayGreeting(currentHoliday);
        
        if (holidayConfig.user_can_disable) {
            createDisableButton();
        }
    } else {
        console.log('[Holidays] No holiday detected for current date');
    }
}

/**
 * Определяет текущий праздник по дате
 */
function detectCurrentHoliday() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    const year = now.getFullYear();
    
    // Проверяем Пасху (динамическая дата)
    const easterHoliday = checkEaster(year, month, day);
    if (easterHoliday) {
        return easterHoliday;
    }
    
    // Проверяем обычные праздники
    const holidays = holidayConfig.list;
    
    for (const [key, holiday] of Object.entries(holidays)) {
        // Пропускаем выключенные праздники
        if (holiday.enabled === false) {
            continue;
        }
        
        if (isDateInRange(month, day, holiday)) {
            return {
                key: key,
                ...holiday
            };
        }
    }
    
    return null;
}

/**
 * Проверяет, попадает ли дата в диапазон праздника
 */
function isDateInRange(month, day, holiday) {
    const startMonth = holiday.start_month;
    const startDay = holiday.start_day;
    const endMonth = holiday.end_month;
    const endDay = holiday.end_day;
    
    // Создаём даты для сравнения (используем фиктивный год)
    const currentDate = month * 100 + day;
    const startDate = startMonth * 100 + startDay;
    const endDate = endMonth * 100 + endDay;
    
    // Обычный случай (в пределах одного года)
    if (startDate <= endDate) {
        return currentDate >= startDate && currentDate <= endDate;
    }
    
    // Переход через новый год (например, 25 декабря - 10 января)
    return currentDate >= startDate || currentDate <= endDate;
}

/**
 * Проверяет Пасху
 */
function checkEaster(year, month, day) {
    if (!holidayConfig.easter_dates || !holidayConfig.easter_config) {
        return null;
    }
    
    const config = holidayConfig.easter_config;
    
    // Пропускаем если Пасха выключена
    if (config.enabled === false) {
        return null;
    }
    
    const easterDate = holidayConfig.easter_dates[year];
    if (!easterDate) {
        return null;
    }
    
    const [easterMonth, easterDay] = easterDate;
    
    // Вычисляем диапазон
    const easterDateObj = new Date(year, easterMonth - 1, easterDay);
    const currentDateObj = new Date(year, month - 1, day);
    
    const daysDiff = Math.round((currentDateObj - easterDateObj) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= -config.days_before && daysDiff <= config.days_after) {
        return {
            key: 'easter',
            theme: config.theme,
            emoji: config.emoji,
            greeting: config.greeting,
            effects: config.effects
        };
    }
    
    return null;
}

/**
 * Применяет праздничную тему
 */
function applyHolidayTheme(holiday) {
    document.body.classList.add('holiday-' + holiday.theme);
    
    // Добавляем эмодзи к логотипу (опционально)
    const logo = document.querySelector('.header-logo');
    if (logo && holiday.emoji) {
        const badge = document.createElement('span');
        badge.className = 'holiday-logo-badge';
        badge.textContent = holiday.emoji;
        badge.style.cssText = 'position: absolute; top: -8px; right: -8px; font-size: 16px;';
        logo.parentElement.style.position = 'relative';
        logo.parentElement.appendChild(badge);
    }
}

/**
 * Создаёт визуальные эффекты
 */
function createHolidayEffects(holiday) {
    if (!holiday.effects || holiday.effects.length === 0) {
        return;
    }
    
    const container = document.createElement('div');
    container.className = 'holiday-effects';
    container.id = 'holiday-effects';
    document.body.appendChild(container);
    
    holiday.effects.forEach(function(effect) {
        switch (effect) {
            case 'snow':
                createSnowEffect(container);
                break;
            case 'hearts':
                createHeartsEffect(container);
                break;
            case 'petals':
                createPetalsEffect(container);
                break;
            case 'confetti':
                createConfettiEffect(container);
                break;
            case 'bats':
                createBatsEffect(container);
                break;
            case 'fireworks':
                createFireworksEffect(container);
                break;
        }
    });
}

/**
 * Снежинки (постоянный снегопад)
 */
function createSnowEffect(container) {
    const snowflakes = ['❄', '❅', '❆', '✻', '✼'];
    const isMobile = window.innerWidth < 480;
    
    function createSnowflake() {
        const flake = document.createElement('div');
        flake.className = 'holiday-particle snowflake';
        flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        const duration = Math.random() * 5 + 8; // 8-13 секунд
        flake.style.cssText = 
            'left: ' + (Math.random() * 100) + '%; ' +
            'font-size: ' + (Math.random() * 8 + 12) + 'px; ' +
            'animation-duration: ' + duration + 's; ' +
            'opacity: ' + (Math.random() * 0.3 + 0.5) + ';';
        
        container.appendChild(flake);
        
        // Удаляем снежинку после окончания анимации
        setTimeout(function() {
            if (flake.parentNode) {
                flake.parentNode.removeChild(flake);
            }
        }, duration * 1000);
    }
    
    // Начальная порция снежинок
    const initialCount = isMobile ? 15 : 30;
    for (let i = 0; i < initialCount; i++) {
        setTimeout(function() {
            createSnowflake();
        }, Math.random() * 3000);
    }
    
    // Постоянно создаём новые снежинки
    const interval = isMobile ? 800 : 400; // мс между снежинками
    setInterval(createSnowflake, interval);
}

/**
 * Сердечки
 */
function createHeartsEffect(container) {
    const hearts = ['❤', '💕', '💗', '💖', '💝'];
    const count = window.innerWidth < 480 ? 12 : 25;
    
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'holiday-particle heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.cssText = 
            'left: ' + (Math.random() * 100) + '%; ' +
            'font-size: ' + (Math.random() * 8 + 14) + 'px; ' +
            'animation-duration: ' + (Math.random() * 4 + 6) + 's; ' +
            'animation-delay: ' + (Math.random() * 6) + 's;';
        container.appendChild(heart);
    }
}

/**
 * Лепестки
 */
function createPetalsEffect(container) {
    const count = window.innerWidth < 480 ? 15 : 30;
    
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'holiday-particle petal';
        const size = Math.random() * 8 + 10;
        petal.style.cssText = 
            'left: ' + (Math.random() * 100) + '%; ' +
            'width: ' + size + 'px; ' +
            'height: ' + size + 'px; ' +
            'animation-duration: ' + (Math.random() * 4 + 6) + 's; ' +
            'animation-delay: ' + (Math.random() * 6) + 's;';
        container.appendChild(petal);
    }
}

/**
 * Конфетти
 */
function createConfettiEffect(container) {
    const count = window.innerWidth < 480 ? 20 : 40;
    
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'holiday-particle confetti';
        const size = Math.random() * 6 + 6;
        confetti.style.cssText = 
            'left: ' + (Math.random() * 100) + '%; ' +
            'width: ' + size + 'px; ' +
            'height: ' + size + 'px; ' +
            'animation-duration: ' + (Math.random() * 3 + 4) + 's; ' +
            'animation-delay: ' + (Math.random() * 5) + 's;';
        container.appendChild(confetti);
    }
}

/**
 * Летучие мыши
 */
function createBatsEffect(container) {
    const count = window.innerWidth < 480 ? 3 : 6;
    
    for (let i = 0; i < count; i++) {
        const bat = document.createElement('div');
        bat.className = 'holiday-particle bat';
        bat.textContent = '🦇';
        bat.style.left = Math.random() * 80 + '%';
        bat.style.top = Math.random() * 30 + 10 + '%';
        bat.style.animationDuration = (Math.random() * 4 + 6) + 's';
        bat.style.animationDelay = (Math.random() * 3) + 's';
        container.appendChild(bat);
    }
}

/**
 * Фейерверки (периодические)
 */
function createFireworksEffect(container) {
    function launchFirework() {
        const colors = ['#ff0000', '#ffd700', '#00ff00', '#00bfff', '#ff69b4', '#ffffff'];
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight / 3) + 50;
        
        for (let i = 0; i < 12; i++) {
            const spark = document.createElement('div');
            spark.className = 'firework';
            spark.style.left = x + 'px';
            spark.style.top = y + 'px';
            
            // Разлёт в разные стороны
            const angle = (i / 12) * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            spark.style.setProperty('--fx', Math.cos(angle) * distance + 'px');
            spark.style.setProperty('--fy', Math.sin(angle) * distance + 'px');
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            spark.style.background = color;
            spark.style.color = color;
            container.appendChild(spark);
            
            setTimeout(function() {
                if (spark.parentNode) {
                    spark.parentNode.removeChild(spark);
                }
            }, 1300);
        }
    }
    
    // Запускаем фейерверк каждые 4-7 секунд
    setInterval(function() {
        launchFirework();
    }, 4000 + Math.random() * 3000);
    
    // Первый залп через 2 секунды
    setTimeout(launchFirework, 2000);
}

/**
 * Показывает поздравление
 */
function showHolidayGreeting(holiday) {
    if (!holiday.greeting) {
        return;
    }
    
    // Проверяем, показывали ли уже сегодня
    const today = new Date().toDateString();
    const shownDate = localStorage.getItem(HOLIDAY_GREETING_SHOWN_KEY);
    
    if (shownDate === today) {
        return;
    }
    
    // Создаём баннер
    const greeting = document.createElement('div');
    greeting.className = 'holiday-greeting';
    greeting.id = 'holiday-greeting';
    greeting.innerHTML = 
        '<div class="holiday-greeting-emoji">' + holiday.emoji + '</div>' +
        '<div class="holiday-greeting-text">' + holiday.greeting + '</div>' +
        '<button class="holiday-greeting-close" onclick="closeHolidayGreeting()">Спасибо! 🎉</button>';
    
    document.body.appendChild(greeting);
    
    // Сохраняем что показали
    localStorage.setItem(HOLIDAY_GREETING_SHOWN_KEY, today);
}

/**
 * Закрывает поздравление
 */
function closeHolidayGreeting() {
    const greeting = document.getElementById('holiday-greeting');
    if (greeting) {
        greeting.style.animation = 'greetingAppear 0.3s ease reverse forwards';
        setTimeout(function() {
            if (greeting.parentNode) {
                greeting.parentNode.removeChild(greeting);
            }
        }, 300);
    }
    
    if (window.triggerHaptic) {
        window.triggerHaptic('light');
    }
}

/**
 * Создаёт кнопку отключения
 */
function createDisableButton() {
    const btn = document.createElement('button');
    btn.className = 'holiday-disable-btn';
    btn.innerHTML = '<i class="fas fa-times"></i> Отключить ' + currentHoliday.emoji;
    btn.onclick = disableHoliday;
    document.body.appendChild(btn);
}

/**
 * Отключает праздничную тему
 */
function disableHoliday() {
    localStorage.setItem(HOLIDAY_DISABLED_KEY, 'true');
    
    // Удаляем все праздничные элементы
    document.body.className = document.body.className.replace(/holiday-\S+/g, '');
    
    var effects = document.getElementById('holiday-effects');
    if (effects) effects.parentNode.removeChild(effects);
    
    var greeting = document.getElementById('holiday-greeting');
    if (greeting) greeting.parentNode.removeChild(greeting);
    
    var badge = document.querySelector('.holiday-logo-badge');
    if (badge) badge.parentNode.removeChild(badge);
    
    // Удаляем кнопку
    var btn = document.querySelector('.holiday-disable-btn');
    if (btn) btn.parentNode.removeChild(btn);
    
    if (window.triggerHaptic) {
        window.triggerHaptic('medium');
    }
}

/**
 * Проверяет, отключил ли пользователь праздники
 */
function isHolidayDisabledByUser() {
    return localStorage.getItem(HOLIDAY_DISABLED_KEY) === 'true';
}

/**
 * Сбрасывает отключение праздников (для нового праздника)
 */
function resetHolidayDisabled() {
    localStorage.removeItem(HOLIDAY_DISABLED_KEY);
}

/**
 * Полная очистка данных праздников (когда отключены на сервере)
 */
function clearHolidayData() {
    // Очищаем localStorage
    localStorage.removeItem(HOLIDAY_DISABLED_KEY);
    localStorage.removeItem(HOLIDAY_GREETING_SHOWN_KEY);
    
    // Удаляем все праздничные классы с body
    document.body.className = document.body.className.replace(/holiday-\S+/g, '');
    
    // Удаляем все праздничные элементы если есть
    var effects = document.getElementById('holiday-effects');
    if (effects && effects.parentNode) effects.parentNode.removeChild(effects);
    
    var greeting = document.getElementById('holiday-greeting');
    if (greeting && greeting.parentNode) greeting.parentNode.removeChild(greeting);
    
    var badge = document.querySelector('.holiday-logo-badge');
    if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
    
    var btn = document.querySelector('.holiday-disable-btn');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

// Экспорт
window.initHolidays = initHolidays;
window.closeHolidayGreeting = closeHolidayGreeting;
window.disableHoliday = disableHoliday;
window.resetHolidayDisabled = resetHolidayDisabled;
window.clearHolidayData = clearHolidayData;