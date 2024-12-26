const apiUrl = 'https://camp-courses.api.kreosoft.space/groups';
const adminActions = document.getElementById('adminActions');
const groupsContainer = document.getElementById('groupsContainer');
const createGroupButton = document.getElementById('createGroupButton');
const groupModal = new bootstrap.Modal(document.getElementById('groupModal'));
const groupNameInput = document.getElementById('groupName');
const groupIdInput = document.getElementById('groupId');
const groupForm = document.getElementById('groupForm');

async function getUserRoles() {
    const rolesApiUrl = 'https://camp-courses.api.kreosoft.space/roles';
    try {
        const response = await fetch(rolesApiUrl, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Не удалось загрузить роли пользователя');
        }
        const roles = await response.json();
        return roles;
    } catch (error) {
        console.error('Ошибка при получении ролей пользователя:', error);
        return null;
    }
}

async function loadGroups() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        const groups = await response.json();
        renderGroups(groups);
    } catch (error) {
        console.error('Ошибка загрузки групп:', error);
        Swal.fire('Ошибка', 'Не удалось загрузить группы', 'error');
    }
}

function saveGroupName(name) {
    localStorage.setItem('groupName', name);
}

function renderGroups(groups) {
    groupsContainer.classList.add('p-0');
    groupsContainer.innerHTML = '';
    groups.forEach((group) => {
        const groupElement = document.createElement('div');
        groupElement.className = 'col-12 p-0';

        groupElement.innerHTML = `
        <div class="card border-0 border-bottom m-0 rounded-0">
            <div class="card-body">
                <h5 class="card-title mb-0">
                    <a href="#specificGroup/${group.id}" class="text-decoration-none text-dark" data-group-name="${group.name}">${group.name}</a>
                </h5>
                ${
                    adminActions.style.display === 'block'
                        ? `<div class="d-flex justify-content-end mt-2">
                            <button class="btn btn-sm btn-secondary me-2 editGroupButton" data-id="${group.id}" data-name="${group.name}">Редактировать</button>
                            <button class="btn btn-sm btn-danger deleteGroupButton" data-id="${group.id}">Удалить</button>
                           </div>`
                        : ''
                }
            </div>
        </div>
    `;

    const groupLink = groupElement.querySelector('a');
    groupLink.addEventListener('click', function() {
        saveGroupName(group.name);
    });

    groupsContainer.appendChild(groupElement);
});

    if (adminActions.style.display === 'block') {
        document.querySelectorAll('.editGroupButton').forEach((button) =>
            button.addEventListener('click', openEditModal)
        );
        document.querySelectorAll('.deleteGroupButton').forEach((button) =>
            button.addEventListener('click', deleteGroup)
        );
    }
}

function openEditModal(event) {
    const button = event.target;
    const groupId = button.dataset.id || '';
    const groupName = button.dataset.name || '';

    groupIdInput.value = groupId;
    groupNameInput.value = groupName;

    groupModal.show();
}

createGroupButton.addEventListener('click', () => {
    groupIdInput.value = ''; 
    groupNameInput.value = '';
    groupModal.show();
});

groupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const groupId = groupIdInput.value;
    const groupName = groupNameInput.value;

    try {
        const method = groupId ? 'PUT' : 'POST';
        const url = groupId ? `${apiUrl}/${groupId}` : apiUrl;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ name: groupName }),
        });

        if (!response.ok) {
            throw new Error('Ошибка сохранения группы');
        }

        Swal.fire('Успех', 'Группа успешно сохранена', 'success');
        groupModal.hide();
        loadGroups();
    } catch (error) {
        console.error('Ошибка при сохранении группы:', error);
        Swal.fire('Ошибка', 'Не удалось сохранить группу', 'error');
    }
});

async function deleteGroup(event) {
    const button = event.target;
    const groupId = button.dataset.id;

    const confirm = await Swal.fire({
        title: 'Вы уверены?',
        text: 'Удаление группы нельзя отменить!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена',
    });

    if (!confirm.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${groupId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка удаления группы');
        }

        Swal.fire('Успех', 'Группа успешно удалена', 'success');
        loadGroups();
    } catch (error) {
        console.error('Ошибка при удалении группы:', error);
        Swal.fire('Ошибка', 'Не удалось удалить группу', 'error');
    }
}

    const roles = await getUserRoles();

    if (!roles) {
        Swal.fire('Ошибка', 'Не удалось загрузить роли пользователя', 'error');
    }

    if (roles.isAdmin) {
        adminActions.style.display = 'block';
    } else {
        adminActions.style.display = 'none';
    }

    loadGroups();

