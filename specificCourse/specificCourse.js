const courseId = window.currentCourseId || localStorage.getItem('currentCourseId');
const apiUrl = `https://camp-courses.api.kreosoft.space/courses/${courseId}/details`;
let isTeacherOnCourse=false;

function updateCourseStatus(status) {
    const statusElement = document.getElementById("courseStatus");
    switch (status) {
        case "OpenForAssigning":
            statusElement.className = "badge bg-success";
            statusElement.textContent = "Открыт для записи";
            break;
        case "Created":
            statusElement.className = "badge bg-secondary";
            statusElement.textContent = "Создан";
            break;
        case "Started":
            statusElement.className = "badge bg-primary"; 
            statusElement.textContent = "В процессе обучения";
            break;
        case "Finished":
            statusElement.className = "badge bg-danger";
            statusElement.textContent = "Закрыт";
            break;
        default:
            statusElement.className = "badge bg-warning";
            statusElement.textContent = "Неизвестный статус";
            break;
    }
}

async function fetchCourseDetails() {
    try {
        const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const course = await response.json();
        console.log(course);
        isTeacherOnCourse = course.teachers.some(teacher => teacher.email === localStorage.getItem('email'));
        document.getElementById("courseName").textContent = course.name;

        const mainYear = `${course.startYear}-${course.startYear + 1}`;
        document.getElementById("courseYear").textContent = mainYear;

        updateCourseStatus(course.status);

        const semesterMapping = {
            Spring: "Весенний",
            Fall: "Осенний",
        };
        const semester = semesterMapping[course.semester] || course.semester;
        document.getElementById("semester").textContent = semester;

        document.getElementById("availableSpots").textContent = course.maximumStudentsCount;
        document.getElementById("studentsEnrolled").textContent = course.studentsEnrolledCount;
        document.getElementById("studentsInQueue").textContent = course.studentsInQueueCount;

        document.getElementById("courseRequirements").innerHTML = course.requirements;

        document.getElementById("courseAnnotations").innerHTML = course.annotations;

        const notificationsList = document.getElementById("notificationsList");
        notificationsList.innerHTML = "";
        course.notifications.forEach(notification => {
            const listItem = document.createElement("li");
            listItem.className = `list-group-item ${notification.isImportant ? "list-group-item-danger" : ""}`;
            listItem.textContent = notification.text;
            notificationsList.appendChild(listItem);
        });

        const teachersList = document.getElementById("teachersList");
        teachersList.innerHTML = "";
        course.teachers.forEach(teacher => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.innerHTML = `<strong>${teacher.name}</strong> (${teacher.email}) ${teacher.isMain ? "<span class='badge bg-primary'>Главный</span>" : ""}`;
            teachersList.appendChild(listItem);
        });

const studentsList = document.getElementById("studentsList");
studentsList.innerHTML = ""; 
course.students.forEach(student => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    
    let studentHtml = `
        <strong>${student.name}</strong> (${student.email})<br>
        Статус: ${student.status}<br>
    `;

    if (student.midtermResult !== null) {
        studentHtml += `
            Результат в середине: <button class="btn btn-warning btn-sm editMarkBtn" data-type="Midterm" data-student-id="${student.id}">${student.midtermResult}</button><br>
        `;
    }

    if (student.finalResult !== null) {
        studentHtml += `
            Итоговый результат: <button class="btn btn-warning btn-sm editMarkBtn" data-type="Final" data-student-id="${student.id}">${student.finalResult}</button><br>
        `;
    }

    listItem.innerHTML = studentHtml;

    if (student.status === "InQueue") {
        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Принять";
        acceptButton.className = "btn btn-success btn-sm";
        acceptButton.addEventListener("click", () => changeStudentStatus(student.id, "Accepted"));

        const declineButton = document.createElement("button");
        declineButton.textContent = "Отклонить";
        declineButton.className = "btn btn-danger btn-sm";
        declineButton.addEventListener("click", () => changeStudentStatus(student.id, "Declined"));

        listItem.appendChild(acceptButton);
        listItem.appendChild(declineButton);
    }

    studentsList.appendChild(listItem);
});
document.querySelectorAll('.editMarkBtn').forEach(button => {
    button.addEventListener('click', async (event) => {
        const markType = event.target.getAttribute('data-type');
        const studentId = event.target.getAttribute('data-student-id');
        
        const modal = new bootstrap.Modal(document.getElementById('markModal'));
        const markTypeLabel = document.getElementById('markTypeLabel');
        const studentName = document.getElementById('studentName');

        const student = course.students.find(s => s.id === studentId);
        studentName.textContent = student.name; 
        markTypeLabel.textContent = `Изменение отметки для ${markType === 'Midterm' ? 'промежуточной' : 'итоговой'} оценки`;

        document.getElementById('markPassedBtn').onclick = () => updateStudentMark(studentId, markType, 'Passed');
        document.getElementById('markFailedBtn').onclick = () => updateStudentMark(studentId, markType, 'Failed');

        modal.show();
    });
});




        return course; 

    } catch (error) {
        console.error("Ошибка при получении данных о курсе:", error);
    }
}

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
async function changeStudentStatus(studentId, newStatus) {
    try {
        const courseId = window.currentCourseId || localStorage.getItem('currentCourseId');
        const apiUrl = `https://camp-courses.api.kreosoft.space/courses/${courseId}/student-status/${studentId}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить статус студента');
        }

        Swal.fire('Успех', `Статус студента изменен на ${newStatus}`, 'success');
        fetchCourseDetails();
    } catch (error) {
        console.error('Ошибка при изменении статуса студента:', error);
        Swal.fire('Ошибка', 'Не удалось изменить статус студента', 'error');
    }
}

async function updateStudentMark(studentId, markType, mark) {
    try {
        const courseId = window.currentCourseId || localStorage.getItem('currentCourseId');
        const apiUrl = `https://camp-courses.api.kreosoft.space/courses/${courseId}/marks/${studentId}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
                markType: markType,  
                mark: mark  
            })
        });

        if (!response.ok) {
            throw new Error('Не удалось обновить отметку');
        }

        Swal.fire('Успех', 'Отметка успешно обновлена', 'success');
        fetchCourseDetails();
    } catch (error) {
        console.error('Ошибка при обновлении отметки:', error);
        Swal.fire('Ошибка', 'Не удалось обновить отметку', 'error');
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
        const roles = await getUserRoles(); 
        const isAdmin = roles.isAdmin;
        const isTeacher = isTeacherOnCourse;

        const modalFile = isTeacher ? 'CourseModalForTeacher.html' : 'CourseModal.html';
        const response = await fetch(modalFile);

        if (!response.ok) {
            throw new Error('Не удалось загрузить модальное окно');
        }

        modalContainer.innerHTML = await response.text();

        const modalElement = document.getElementById('courseModal');
        if (!modalElement) {
            throw new Error('Модальное окно не найдено');
        }
        const newCourseModal = new bootstrap.Modal(modalElement);

        const courseRequirementsInput = document.getElementById('requirement');
        const courseAnnotationInput = document.getElementById('annotation');

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

        const course = await fetchCourseDetails();

        if (isAdmin) {
            const courseNameInput = document.getElementById('name');
            const startYearInput = document.getElementById('startYear');
            const maximumStudentsCountInput = document.getElementById('maximumStudentsCount');
            const semesterSelect = document.getElementById('semester');
            const courseInstructorSelect = document.getElementById('instructor');

            courseNameInput.value = course.name;
            startYearInput.value = course.startYear;
            maximumStudentsCountInput.value = course.maximumStudentsCount;
            semesterSelect.value = course.semester;
            $(courseRequirementsInput).summernote('code', course.requirements);
            $(courseAnnotationInput).summernote('code', course.annotations);

            const users = await fetchUsers();
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.fullName;
                courseInstructorSelect.appendChild(option);
            });
        } else if (isTeacher) {
            $(courseRequirementsInput).summernote('code', course.requirements);
            $(courseAnnotationInput).summernote('code', course.annotations);
        }

        document.getElementById(isTeacher ? 'courseForm2' : 'courseForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            if (isAdmin) {
                const courseData = {
                    name: courseNameInput.value,
                    startYear: parseInt(startYearInput.value),
                    maximumStudentsCount: parseInt(maximumStudentsCountInput.value),
                    semester: semesterSelect.value,
                    requirements: $(courseRequirementsInput).summernote('code'),
                    annotations: $(courseAnnotationInput).summernote('code'),
                    mainTeacherId: courseInstructorSelect.value
                };

                try {
                    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify(courseData)
                    });

                    if (!response.ok) {
                        throw new Error(await response.text());
                    }

                    Swal.fire('Успех', 'Курс успешно обновлен', 'success');
                    newCourseModal.hide();
                    fetchCourseDetails();
                } catch (error) {
                    Swal.fire('Ошибка', error.message || 'Не удалось обновить курс', 'error');
                }
            } else if (isTeacher) {
                const courseData = {
                    requirements: $(courseRequirementsInput).summernote('code'),
                    annotations: $(courseAnnotationInput).summernote('code'),
                };

                try {
                    const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/requirements-and-annotations`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify(courseData)
                    });

                    if (!response.ok) {
                        throw new Error(await response.text());
                    }

                    Swal.fire('Успех', 'Аннотация и требования успешно обновлены', 'success');
                    newCourseModal.hide();
                    fetchCourseDetails();
                } catch (error) {
                    Swal.fire('Ошибка', error.message || 'Не удалось обновить аннотацию и требования', 'error');
                }
            }
        });

        newCourseModal.show();
    } catch (error) {
        console.error('Ошибка при загрузке модального окна:', error);
        Swal.fire('Ошибка', 'Не удалось загрузить модальное окно', 'error');
    }
}

async function checkUserRole() {
    try {
        const roles = await getUserRoles();
        const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/sign-up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            }
            
        });

        if (!response.ok) {
            document.getElementById("signUpCourseBtn").style.display = "block"; 
        }
        if (roles.isAdmin) {
            document.getElementById("deleteCourseBtn").style.display = "block";
        }
        if (roles.isAdmin || isTeacherOnCourse) {
            document.getElementById("editCourseBtn").style.display = "block";
            document.getElementById("changeStatusBtn").style.display = "block"; 
            document.getElementById("createNotificationBtn").style.display = "block"; 
        } 
    } catch (error) {
        console.error('Ошибка при проверке доступности записи на курс:', error);
    }
}



document.getElementById("saveStatusBtn").addEventListener("click", async () => {
    const statusSelect = document.getElementById("courseStatusSelect");
    const newStatus = statusSelect.value;

    try {
        const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${await response.text()}`);
        }

        Swal.fire('Успех', 'Статус курса успешно обновлен', 'success');
        updateCourseStatus(newStatus); 
        const modal = bootstrap.Modal.getInstance(document.getElementById("statusModal"));
        modal.hide(); 
    } catch (error) {
        Swal.fire('Ошибка', error.message || 'Не удалось обновить статус курса', 'error');
    }
});

async function createNotification() {
    const notificationText = document.getElementById("notificationText").value;
    const isImportant = document.getElementById("isImportant").checked;

    const notificationData = {
        text: notificationText,
        isImportant: isImportant
    };

    try {
        const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(notificationData)
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${await response.text()}`);
        }

        Swal.fire('Успех', 'Уведомление успешно создано', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById("createNotificationModal"));
        modal.hide();

        fetchCourseDetails();
    } catch (error) {
        Swal.fire('Ошибка', error.message || 'Не удалось создать уведомление', 'error');
    }
}

document.getElementById("createNotificationBtn").addEventListener("click", () => {

    document.getElementById("notificationText").value = '';
    document.getElementById("isImportant").checked = false; 

    const modal = new bootstrap.Modal(document.getElementById("createNotificationModal"));
    modal.show();
});

document.getElementById("saveNotificationBtn").addEventListener("click", async () => {
    await createNotification();
});
document.getElementById("signUpCourseBtn").addEventListener("click", async () => {
    try {
        const courseId = window.currentCourseId || localStorage.getItem('currentCourseId');
        const apiUrl = `https://camp-courses.api.kreosoft.space/courses/${courseId}/sign-up`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            }
            
        });

        if (!response.ok) {
            throw new Error('Не удалось записаться на курс');
        }

        Swal.fire('Успех', 'Вы успешно записались на курс', 'success');
    } catch (error) {
        console.error('Ошибка при записи на курс:', error);
        Swal.fire('Ошибка', 'Не удалось записаться на курс', 'error');
    }
});

document.getElementById("deleteCourseBtn").addEventListener("click", async () => {
    try {
        const confirmation = await Swal.fire({
            title: 'Вы уверены?',
            text: 'Это действие удалит курс и его нельзя будет восстановить.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена'
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        const response = await fetch(`https://camp-courses.api.kreosoft.space/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${await response.text()}`);
        }

        Swal.fire('Удалено!', 'Курс успешно удален.', 'success');
        const groupId = window.currentCommunityId || localStorage.getItem('currentGroupId');
        window.location.href = `#courseGroups`;

    } catch (error) {
        console.error('Ошибка при удалении курса:', error);
        Swal.fire('Ошибка', 'Не удалось удалить курс', 'error');
    }
});

fetchCourseDetails();
checkUserRole();
document.getElementById("editCourseBtn").addEventListener("click", loadModal);
