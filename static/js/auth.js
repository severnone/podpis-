(function () {
    const params = new URLSearchParams(window.location.search);
    const direct = params.get('url');
    if (direct) {
        window.location.replace(direct);
        return;
    }

    const tg = window.Telegram && window.Telegram.WebApp;
    const insideTelegram =
        !!(tg && ((tg.initData && tg.initData.length > 0) ||
                  (tg.initDataUnsafe && (tg.initDataUnsafe.query_id || tg.initDataUnsafe.user))));

    if (insideTelegram) {
        document.documentElement.classList.add('tg');
        var initData = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
        try {
            fetch((window.BASE_PATH || '/connect/') + 'auth/start?init_data=' + encodeURIComponent(initData), {
                method: 'POST',
                credentials: 'include'
            })
            .catch(function(){})
            .finally(function(){});
        } catch (e) {}
        return;
    }

    document.documentElement.classList.add('browser');
})();
