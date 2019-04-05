(function() {
  const githubApi = 'https://api.github.com/';
  let token = '';
  let loader;

  function validateProjectResultClick(event) {
    const targetId = event.target.id;

    if (targetId.slice(0, 6) !== 'result') {
      return;
    } else {
      const projectId = targetId.split('-')[1];
      document.location.assign(document.location + projectId);
    }
  }

  function clearResults() {
    let resultNode = document.querySelector('#projectResults');

    while(resultNode.lastChild) {
      resultNode.removeChild(resultNode.lastChild);
    }
  }

  function getProjects(event, page = 1) {
    const orgSlashRepo = document.querySelector('#projectLocation').value;
    const orgOrRepo = orgSlashRepo.indexOf('/') === -1 ? 'orgs' : 'repos';

    // page is only 1 if the button was just clicked
    if (page === 1) {
      clearResults();
      loader.startLoading();
      window.localStorage.setItem('orgSlashRepo', orgSlashRepo);
    }

    fetch(githubApi + `${orgOrRepo}/${orgSlashRepo}/projects?state=open&page=${page}`, {
      headers: {
        'Accept': 'application/vnd.github.inertia-preview+json',
        'Authorization': `token ${token}`,
      }
    })
      .then(function(response) {
        response.json().then((data) => {
          if (data.length === 0) {
            loader.stopLoading();
            document.querySelector('#resultsWrapper').classList.remove('hide');
            return;
          }

          let projectList = document.querySelector('#projectResults');

          data.forEach((datum) => {
            let li = document.createElement('li');
            let button = document.createElement('button');

            button.id = `result-${datum.id}`;
            button.innerHTML = datum.name;

            li.appendChild(button);
            projectList.appendChild(li);
          });

          getProjects(event, page + 1);
        });
      });
  }

  function getToken() {
    fetch(new Request('/githubToken'))
      .then((response) => {
        response.json().then((data) => {
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
    loader = new Loader();

    getToken();
    setEventHandlers();
    loadMostRecentProjectSearch();
  };
})();
