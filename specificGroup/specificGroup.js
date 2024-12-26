const groupId = window.currentCommunityId || localStorage.getItem('currentGroupId');
if (!groupId) {
    console.error("Идентификатор группы отсутствует");
    Swal.fire('Ошибка', 'Идентификатор группы отсутствует', 'error');

}
const apiUrl = `https://camp-courses.api.kreosoft.space/groups/${groupId}`;
const groupNameElement = document.getElementById('groupName');
const coursesContainer = document.getElementById('coursesContainer');
const createCourseButton = document.getElementById('createCourseButton');
const modalContainer = document.getElementById('modalContainer'); 

async function getUserRoles() {
    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/roles', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Не удалось загрузить роли пользователя');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке ролей пользователя:', error);
        return null;
    }
}

async function fetchUsers() {
    try {
        const response = await fetch('https://camp-courses.api.kreosoft.space/users', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) {
            throw new Error('Ошибка при загрузке списка преподавателей');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении списка преподавателей:', error);
        return [];
    }
}

async function loadModal() {
    try {
        const response = await fetch('CourseModal.html');
        if (!response.ok) {
            throw new Error('Не удалось загрузить модальное окно');
        }
        modalContainer.innerHTML = await response.text();

        const modalElement = document.getElementById('courseModal');
        if (!modalElement) {
            throw new Error('Модальное окно не найдено');
        }
        const newCourseModal = new bootstrap.Modal(modalElement);

        const courseNameInput = document.getElementById('name');
        const startYearInput = document.getElementById('startYear');
        const maximumStudentsCountInput = document.getElementById('maximumStudentsCount');
        const semesterSelect = document.getElementById('semester');
        const courseRequirementsInput = document.getElementById('requirement');
        const courseAnnotationInput = document.getElementById('annotation');
        const courseInstructorSelect = document.getElementById('instructor');

        $(courseRequirementsInput).summernote({
            height: 150,
            placeholder: 'Введите требования для курса...',
            tabsize: 2
        });
        $(courseAnnotationInput).summernote({
            height: 150,
            placeholder: 'Введите аннотацию для курса...',
            tabsize: 2
        });

        const users = await fetchUsers();
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.fullName;
            courseInstructorSelect.appendChild(option);
        });

        document.getElementById('courseForm').addEventListener('submit', async (event) => {
            event.preventDefault();
        
            const courseData = {
                name: courseNameInput.value,
                startYear: parseInt(startYearInput.value),
                maximumStudentsCount: parseInt(maximumStudentsCountInput.value),
                semester: semesterSelect.value,
                requirements: $(courseRequirementsInput).summernote('code'),
                annotations: $(courseAnnotationInput).summernote('code'),
                mainTeacherId: courseInstructorSelect.value
            };

            if (!courseNameInput.value || !startYearInput.value || !maximumStudentsCountInput.value || 
                !courseInstructorSelect.value) {
                Swal.fire('Ошибка', 'Все поля должны быть заполнены', 'error');
                return;
            }
        
            try {
                const response = await fetch(`${apiUrl}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(courseData)
                });
        
                if (!response.ok) {
                    const errorResponse = await response.json();
        
                    if (errorResponse.errors?.StartYear?.[0] === "Campus course start year must be between 2000 and 2029.") {
                        Swal.fire('Ошибка', 'Год начала курса должен быть между 2000 и 2029.', 'error');
                    } else {
                        throw new Error(errorResponse.title || 'Ошибка при создании курса');
                    }
                    return;
                }
        
                Swal.fire('Успех', 'Курс успешно создан', 'success');
                newCourseModal.hide();
                loadGroupAndCourses();
            } catch (error) {
                console.error('Ошибка при создании курса:', error);
                Swal.fire('Ошибка', error.message || 'Не удалось создать курс', 'error');
            }
        });
        

        newCourseModal.show();
    } catch (error) {
        console.error('Ошибка при загрузке модального окна:', error);
        Swal.fire('Ошибка', 'Не удалось загрузить модальное окно', 'error');
    }
}

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

async function setupCreateCourseButton() {
    const roles = await getUserRoles();
    if (roles?.isAdmin) {
        createCourseButton.classList.remove('d-none');
        createCourseButton.addEventListener('click', loadModal);
    }
}

const groupName = localStorage.getItem('groupName');
if (groupName) {
    groupNameElement.textContent = `Группа - ${groupName}`;
}

loadGroupAndCourses();
setupCreateCourseButton();
