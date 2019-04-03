(function() {
  const githubApi = 'https://api.github.com/';
  let token = '';

  function getProjects() {
    const orgSlashRepo = document.querySelector('#projectLocation').value;

    fetch(githubApi + `repos/${orgSlashRepo}/projects`, {
      headers: {
        'Accept': 'application/vnd.github.inertia-preview+json',
        'Authorization': `token ${token}`,
      }
    })
      .then(function(response) {
        response.json().then(function(data) {
          console.log(data);
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
  }

  window.onload = function() {
    setEventHandlers();
    getToken();
  };
})();
