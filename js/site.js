// ============================================================
//  NORVINSK — site.js
//  Задание 5: динамика сайта на JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 1. Переключение вкладок в навигации
    // ========================================================
    const navLinks = document.querySelectorAll('#navLinks li');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            const offset = document.querySelector('.navbar').offsetHeight + 10;
            const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ========================================================
    // 2. Автоподсветка вкладки при прокрутке
    // ========================================================
    const sectionMap = [
        { id: 'home',      el: document.getElementById('home') },
        { id: 'news',      el: document.getElementById('news') },
        { id: 'archive',   el: document.getElementById('archive') },
        { id: 'account',   el: document.getElementById('account') },
        { id: 'chat',      el: document.getElementById('chat') }
    ];

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 120;
        let current = 'home';
        sectionMap.forEach(s => {
            if (s.el && s.el.offsetTop <= scrollPos) current = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.target === current);
        });
    });

    // ========================================================
    // 3. Кнопка поиска
    // ========================================================
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value.trim();
            const news = document.getElementById('news');
            if (!news) return;

            const offset = document.querySelector('.navbar').offsetHeight + 10;
            const top = news.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });

            news.classList.remove('flash');
            void news.offsetWidth;
            news.classList.add('flash');

            if (q) {
                const cards = document.querySelectorAll('.news-card');
                cards.forEach(card => {
                    const match = card.textContent.toLowerCase().includes(q.toLowerCase());
                    card.style.opacity = match ? '1' : '0.35';
                });
            } else {
                document.querySelectorAll('.news-card').forEach(c => c.style.opacity = '1');
            }
        });

        searchInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') searchBtn.click();
        });
    }

    // ========================================================
    // 4. Фильтрация в архиве
    // ========================================================
    const archiveTabs = document.querySelectorAll('#archiveTabs span');
    const newsFeedItems = document.querySelectorAll('#newsFeed p');

    archiveTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            archiveTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;

            newsFeedItems.forEach(item => {
                if (filter === 'all') {
                    item.style.display = 'block';
                } else {
                    if (item.classList.contains(`feed-${filter}`)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    });

    // ========================================================
    // 5. Обработка формы аккаунта
    // ========================================================
    const accountForm = document.forms.accountForm;

    if (accountForm) {
        accountForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = new FormData(accountForm);
            const values = Object.fromEntries(data.entries());

            console.log('Данные формы:', values);

            const name     = (values.username || '').trim();
            const email    = (values.email    || '').trim();
            const password = values.password  || '';
            const chatNick = (values.chatNick || '').trim();

            if (name.length < 2) {
                Swal.fire({ icon: 'error', title: 'Ошибка', text: 'Имя должно содержать минимум 2 символа.' });
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                Swal.fire({ icon: 'error', title: 'Ошибка', text: 'Введите корректный email.' });
                return;
            }
            if (password.length < 6) {
                Swal.fire({ icon: 'error', title: 'Ошибка', text: 'Пароль слишком короткий (минимум 6 символов).' });
                return;
            }
            if (chatNick.length < 3 || chatNick.length > 15) {
                Swal.fire({ icon: 'error', title: 'Ошибка', text: 'Никнейм в чате должен быть от 3 до 15 символов.' });
                return;
            }

            // Сохраняем данные пользователя в localStorage
            localStorage.setItem('norvinsk_user', JSON.stringify({ name: name, nick: chatNick }));

            Swal.fire({
                icon: 'success',
                title: 'Аккаунт создан!',
                text: `Добро пожаловать, ${chatNick}!`
            }).then(() => {
                updateProfileUI();
                accountForm.reset();
                document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ========================================================
    // 6. Логика живого чата
    // ========================================================
    const profileNameEl = document.getElementById('profileName');
    const onlineUsersEl = document.getElementById('onlineUsers');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    function updateProfileUI() {
        const userJson = localStorage.getItem('norvinsk_user');
        if (userJson) {
            const user = JSON.parse(userJson);
            profileNameEl.textContent = user.nick;
            onlineUsersEl.innerHTML = `<div style="font-weight: bold; margin-bottom: 10px; color: #fff;">Онлайн:</div>
                                       <div style="color: #4CAF50; font-size: 12px;">🟢 ${user.nick} (вы)</div>`;
        } else {
            profileNameEl.textContent = 'Гость';
            onlineUsersEl.innerHTML = `<div style="font-weight: bold; margin-bottom: 10px; color: #fff;">Онлайн:</div>
                                       <div style="color: #888; font-size: 12px;">Пока никого нет</div>`;
        }
    }

    // Восстанавливаем профиль при загрузке страницы
    updateProfileUI();

    function addMessage(text, author) {
        // Убираем заглушку "Чат пуст", если она есть
        if (chatMessages.children.length === 1 && chatMessages.children[0].textContent.includes('Чат пуст')) {
            chatMessages.innerHTML = '';
        }

        const msgDiv = document.createElement('div');
        const isMine = localStorage.getItem('norvinsk_user') && JSON.parse(localStorage.getItem('norvinsk_user')).nick === author;
        
        msgDiv.style.padding = '8px';
        msgDiv.style.borderRadius = '4px';
        msgDiv.style.backgroundColor = isMine ? '#3a3a3a' : '#252525';
        msgDiv.style.borderLeft = isMine ? '3px solid #c9a227' : '3px solid #555';
        
        msgDiv.innerHTML = `<span style="color: #c9a227; font-weight: bold; margin-right: 5px;">${author}:</span> <span style="color: #ddd;">${text}</span>`;
        chatMessages.appendChild(msgDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        const userJson = localStorage.getItem('norvinsk_user');

        if (!userJson) {
            Swal.fire({ icon: 'warning', title: 'Внимание', text: 'Сначала создайте аккаунт!' });
            return;
        }

        if (!text) return;

        const user = JSON.parse(userJson);
        addMessage(text, user.nick);
        chatInput.value = '';

        // Имитация ответа от другого пользователя
        setTimeout(() => {
            const fakeResponses = [
                "Согласен, брат.",
                "А я слышал, что USEC опять слились.",
                "Когда рейд?",
                "Продам гвозди, недорого.",
                "Тарков ждет нас!"
            ];
            const randomResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
            addMessage(randomResponse, "Бот_Сводка");
        }, 1500);
    }

    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

});