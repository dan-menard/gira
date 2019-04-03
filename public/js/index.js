(function() {
  const githubApi = 'https://api.github.com/';
  let token = '';

  function validateProjectResultClick(event) {
    const targetId = event.target.id;

    if (targetId.slice(0, 6) !== 'result') {
      return;
    } else {
      const projectId = targetId.split('-')[1];
      document.location.assign(document.location + projectId);
    }
  }

  function getProjects() {
    const orgSlashRepo = document.querySelector('#projectLocation').value;
    let url;

    console.log(orgSlashRepo);
    if (orgSlashRepo.indexOf('/') === -1) {
      url = githubApi + `orgs/${orgSlashRepo}/projects?state=open`;
    } else {
      url = githubApi + `repos/${orgSlashRepo}/projects?state=open`;
    }

    fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.inertia-preview+json',
        'Authorization': `token ${token}`,
      }
    })
      .then(function(response) {
        window.localStorage.setItem('orgSlashRepo', orgSlashRepo);

        response.json().then(function(data) {
          let projectList = document.querySelector('#projectResults');

          data.forEach(function(datum) {
            let li = document.createElement('li');
            let button = document.createElement('button');

            button.id = `result-${datum.id}`;
            button.innerHTML = datum.name;

            li.appendChild(button);
            projectList.appendChild(li);
          });
        });
      });
  }

  function getToken() {
    fetch(new Request('/githubToken'))
      .then(function(response) {
        response.json().then(function(data) {
          token = data.token;
        });
      });
  }

  function setEventHandlers() {
    document.querySelector('#loadProjectsButton').addEventListener('click', getProjects);
    document.querySelector('#projectResults').addEventListener('click', validateProjectResultClick);
  }

  function loadMostRecentProjectSearch() {
    const mostRecentSearch = window.localStorage.getItem('orgSlashRepo');

    if (mostRecentSearch) {
      document.querySelector('#projectLocation').value = mostRecentSearch;
    }
  }

  window.onload = function() {
    getToken();
    setEventHandlers();
    loadMostRecentProjectSearch();
  };
})();
