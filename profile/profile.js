const profileForm = document.getElementById('profile-form');
const apiUrl = 'https://camp-courses.api.kreosoft.space/profile';

async function loadProfile() {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (response.status === 400) {
            const error = await response.json();
            console.error('Ошибка 400 при загрузке профиля:', error);

            showToast('Ошибка загрузки профиля: Некорректные данные. Проверьте авторизацию.', 'error');

            setTimeout(() => {
                window.location.href = '/login.html'; 
            }, 3000);

            return;
        }

        if (!response.ok) {
            throw new Error('Ошибка загрузки профиля');
        }

        const data = await response.json();
        console.log('Профиль загружен:', data);

        document.getElementById('fullName').value = data.fullName;
        document.getElementById('birthDate').value = data.birthDate.split('T')[0]; 
        document.getElementById('emailDisplay').textContent = data.email;

    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        showToast('Не удалось загрузить профиль. Проверьте подключение.', 'error');
    }
}

async function saveProfile(event) {
    event.preventDefault();

    const updatedProfile = {
        fullName: document.getElementById('fullName').value,
        birthDate: document.getElementById('birthDate').value,
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(updatedProfile),
        });

        if (response.status === 400) {
            const error = await response.json();
            console.error('Ошибка 400 при сохранении профиля:', error);

            if (error.errors) {
                const errorMessages = Object.entries(error.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
                showToast(`Ошибка сохранения профиля:\n${errorMessages}`, 'error');
            } else {
                showToast('Ошибка сохранения профиля: Некорректные данные.', 'error');
            }

            return;
        }

        if (!response.ok) {
            throw new Error('Ошибка сохранения профиля');
        }

        showToast('Профиль успешно сохранён!', 'success');

    } catch (error) {
        console.error('Ошибка при сохранении профиля:', error);
        showToast('Не удалось сохранить изменения. Проверьте подключение.', 'error');
    }
}

if (profileForm) {
    profileForm.addEventListener('submit', saveProfile);
}

function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toastNotification');

    toastElement.querySelector('.toast-body').textContent = message;

    toastElement.classList.remove('text-bg-success', 'text-bg-danger');
    if (type === 'success') {
        toastElement.classList.add('text-bg-success');
    } else if (type === 'error') {
        toastElement.classList.add('text-bg-danger');
    }

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

loadProfile();
