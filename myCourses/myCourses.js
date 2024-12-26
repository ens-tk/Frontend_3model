
const apiUrl = `https://camp-courses.api.kreosoft.space/courses/my`;
const groupNameElement = document.getElementById('groupName');
const coursesContainer = document.getElementById('coursesContainer');
const modalContainer = document.getElementById('modalContainer');

async function loadGroupAndCourses() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
        }

        const courses = await response.json();
        renderCourses(courses);
    } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
        Swal.fire('Ошибка', error.message || 'Не удалось загрузить курсы', 'error');
    }
}

function renderCourses(courses) {
    coursesContainer.innerHTML = '';
    if (!courses.length) {
        coursesContainer.innerHTML = '<p class="text-muted">Курсы для этой группы не найдены.</p>';
        return;
    }

    courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'col-12 mb-3';

        const statusInfo = {
            Created: { text: 'Создан', color: 'text-secondary' },
            OpenForAssigning: { text: 'Открыт для записи', color: 'text-success' },
            Finished: { text: 'Закрыт', color: 'text-danger' },
            Started: { text: 'В процессе обучения', color: 'text-info' }
        }[course.status] || { text: 'Неизвестный статус', color: 'text-muted' };

        const semesterName = {
            Spring: 'Весенний',
            Autumn: 'Осенний'
        }[course.semester] || 'Неизвестный';

        courseElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title mb-0">
                    <a href="#specificCourse/${course.id}" class="text-decoration-none text-dark" >${course.name}</a>
                </h5>
                        <span class="${statusInfo.color} fw-bold">${statusInfo.text}</span>
                    </div>
                    <p class="card-text">
                        <strong>Учебный год:</strong> ${course.startYear} - ${course.startYear + 1} <br>
                        <strong>Семестр:</strong> ${semesterName} <br>
                        <span class="text-muted">Мест всего: ${course.maximumStudentsCount}</span> <br>
                        <span class="text-muted">Мест свободно: ${course.remainingSlotsCount}</span>
                    </p>
                </div>
            </div>
        `;
        coursesContainer.appendChild(courseElement);
    });
}




loadGroupAndCourses();