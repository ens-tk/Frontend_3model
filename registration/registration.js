const REGISTRATION_URL = 'https://camp-courses.api.kreosoft.space/registration/';

const form = document.getElementById('registration-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const birthDate = document.getElementById('birth-date').value;
    const email = document.getElementById('email2').value.trim();
    const password = document.getElementById('password2').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    errorMessage.classList.add('d-none');
    errorMessage.innerHTML = '';

    if (!fullName || !birthDate || !email || !password || !confirmPassword) {
        errorMessage.innerText = 'Пожалуйста, заполните все поля.';
        errorMessage.classList.remove('d-none');
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.innerText = 'Пароли не совпадают. Повторите ввод.';
        errorMessage.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch(REGISTRATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullName, birthDate, email, password, confirmPassword }),
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            if (token) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('email', email);
                alert('Регистрация успешна!');
                window.location.href = '/'; 
            } else {
                alert('Ошибка регистрации: нет токена.');
            }
        } else if (response.status === 400) {
            const error = await response.json();
            console.error('Ошибка регистрации:', error);

            let errorMessages = [];

            if (error.DuplicateUserName) {
                errorMessages.push('Указанный адрес электронной почты уже зарегистрирован. Используйте другой.');
            }

            if (error.errors && error.errors.Password) {
                errorMessages.push('Пароль должен быть строкой длиной не менее 6 символов.');
            }

            if (error.errors) {
                for (const key in error.errors) {
                    if (error.errors.hasOwnProperty(key)) {
                        if (key !== 'Password') {
                            errorMessages.push(...error.errors[key]);
                        }
                    }
                }
            }

            if (errorMessages.length > 0) {
                errorMessage.innerHTML = errorMessages.map(msg => `<div>${msg}</div>`).join('');
                errorMessage.classList.remove('d-none');
            } else {
                errorMessage.innerText = 'Ошибка регистрации: некорректные данные.';
                errorMessage.classList.remove('d-none');
            }
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.message || 'Неизвестная ошибка'}`);
        }
    } catch (err) {
        console.error('Ошибка при регистрации:', err);
        errorMessage.innerText = 'Не удалось выполнить регистрацию. Проверьте подключение.';
        errorMessage.classList.remove('d-none');
    }
});