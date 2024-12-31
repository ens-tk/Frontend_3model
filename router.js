import { initializeNavbar } from '/navbar/navbar.js'; 
const routes = {
    courseGroups: {
      template: '/courseGroups/courseGroups.html',
      script: '/courseGroups/courseGroups.js',
    },
    login: {
      template: '/login/login.html',
      script: '/login/login.js'
    },
    registration: {
      template: '/registration/registration.html',
      script: '/registration/registration.js'
    },
    profile: {
      template: '/profile/profile.html',
      script: '/profile/profile.js'
    },
    groupList: {
      template: '/groupList.html',
      script: '/groupList.js'
    },
    specificGroup: {
      template: '/specificGroup/specificGroup.html',
      script: '/specificGroup/specificGroup.js'
    },
    specificCourse: {
        template: '/specificCourse/specificCourse.html',
        script: '/specificCourse/specificCourse.js'
      },
      myCourses: {
      template: '/myCourses/myCourses.html',
      script: '/myCourses/myCourses.js'
    },
    specificPost: {
      template: '/specificPost/specificPost.html',
      script: '/specificPost/specificPost.js'
    },
    teachingCourses: {
      template: '/teachingCourses/teachingCourses.html',
      script: '/teachingCourses/teachingCourses.js'
    },
    main: {
      template: '/main.html'
    }
  };
  
function loadPage() {
    const contentDiv = document.getElementById('content');
    const hash = window.location.hash.substring(1) || 'main';

    const [routeName, params] = hash.split('/');

    const route = routes[routeName];

    if (route) {
        fetch(route.template)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка загрузки HTML');
                }
                return response.text();
            })
            .then(html => {
                contentDiv.innerHTML = html;

                const existingScript = document.getElementById('dynamic-script');
                if (existingScript) {
                    existingScript.remove();
                }

                const script = document.createElement('script');
                script.src = `${route.script}?=${new Date().getTime()}`;
                script.id = 'dynamic-script';
                script.type = "module";
                document.body.appendChild(script);

                console.log(`Скрипт ${route.script} подключён.`);

                if (routeName === 'specificGroup' && params) {
                    window.currentCommunityId = params;
                }
                
                if (routeName === 'specificCourse' && params) {
                  window.currentCourseId = params;
              }


                if (routeName === 'createPost' && params) {
                  window.currentGroupId = params; 
              }

                if (routeName === 'main' && params) {
                  const urlParams = new URLSearchParams(params);
                  const authorFilter = urlParams.get('author');
                  if (authorFilter) {
                      window.currentAuthorFilter = authorFilter;
                  }
              }

                initializeNavbar();
            })
            .catch(error => console.error('Ошибка при загрузке:', error));
    } else {
        console.error(`Маршрут "${hash}" не найден.`);
    }
}

window.addEventListener('hashchange', loadPage);
loadPage();
