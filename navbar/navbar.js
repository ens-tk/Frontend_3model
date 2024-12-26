export function initializeNavbar() {
    console.log('Инициализация navbar');

    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('email');
    const rolesUrl = 'https://camp-courses.api.kreosoft.space/roles';

    const setupNavbar = async () => {
        const courseGroups = document.getElementById('courseGroups');
        const myCourses = document.getElementById('myCourses');
        const teachingCourses = document.getElementById('teachingCourses');
        const register = document.getElementById('register');
        const login = document.getElementById('login');
        const emailButton = document.getElementById('emailButton');
        const emailDisplay = document.getElementById('email');
        const btnLogout = document.getElementById('btnLogout');

        if (token) {
            try {
                const response = await fetch(rolesUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*',
                    },
                });

                if (response.ok) {
                    const roles = await response.json();

                    if (courseGroups) courseGroups.style.display = 'block';

                    if (roles.isStudent && myCourses) {
                        myCourses.style.display = 'block';
                    }

                    if (roles.isTeacher && teachingCourses) {
                        teachingCourses.style.display = 'block';
                    }

                    if (emailButton) emailButton.style.display = 'block';
                    if (emailDisplay) emailDisplay.textContent = email || 'Email не найден';

                    if (register) register.style.display = 'none';
                    if (login) login.style.display = 'none';

                    if (btnLogout) {
                        btnLogout.addEventListener('click', () => {
                            console.log('Выход пользователя');
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('email');
                            window.location.href = `#login`;
                            window.location.reload();

                        });
                    }
                } else {
                    console.error('Не удалось получить роли:', response.status);
                }
            } catch (error) {
                console.error('Ошибка при запросе ролей:', error);
            }
        } else {
            if (register) register.style.display = 'block';
            if (login) login.style.display = 'block';
            if (emailButton) emailButton.style.display = 'none';
            if (courseGroups) courseGroups.style.display = 'none';
            if (myCourses) myCourses.style.display = 'none';
            if (teachingCourses) teachingCourses.style.display = 'none';
        }
    };

    setTimeout(setupNavbar, 0);
}
