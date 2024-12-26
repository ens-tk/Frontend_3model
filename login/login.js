console.log('Скрипт подключён.');
const LOGIN_URL = 'https://camp-courses.api.kreosoft.space/login';
const ROLES_URL = 'https://camp-courses.api.kreosoft.space/roles';

const form = document.getElementById('login-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email7').value;
    const password = document.getElementById('password').value;

    console.log('email:', email, 'password:', password);

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            localStorage.setItem('authToken', token);
            localStorage.setItem('email', email);

            console.log('Данные сохранены в localStorage:');
            console.log('Токен:', token);
            console.log('Email:', email);

            const rolesResponse = await fetch(ROLES_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            });

            if (rolesResponse.ok) {
                const roles = await rolesResponse.json();
                console.log('Роли пользователя:', roles);

                if (roles.isAdmin) {
                    console.log('Пользователь является администратором.');
                }
                if (roles.isTeacher) {
                    console.log('Пользователь является учителем.');
                }
                if (roles.isStudent) {
                    console.log('Пользователь является студентом.');
                }
            } else {
                console.error('Не удалось получить роли пользователя:', rolesResponse.status);
                alert('Ошибка при получении ролей пользователя.');
            }
            
            window.location.href = `#courseGroups`;

        } else if (response.status === 400) {
            alert('Пароль или логин неверны. Попробуйте ещё раз.');
        } else {
            const error = await response.json();
            console.error('Ошибка при авторизации:', error);
            alert(`Ошибка: ${error.message}`);
        }
    } catch (err) {
        console.error('Ошибка при авторизации:', err);
        alert('Не удалось выполнить авторизацию. Проверьте подключение.');
    }
});
