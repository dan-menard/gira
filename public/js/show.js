(function() {
  const githubApi = 'https://api.github.com/';
  const projectId = window.location.pathname.slice(1);

  function getColumnsAndCards(headers) {
    fetch(githubApi + `projects/${projectId}/columns`, {headers})
      .then(function(columnResponse) {
        columnResponse.json().then(function(columnData) {
          console.log('columns');
          console.log(columnData);
          console.log('');
          console.log('cards:');
          console.log('');

          columnData.forEach(function(datum) {
            fetch(datum.cards_url, {headers})
              .then(function(cardResponse) {
                cardResponse.json().then(function(cardData) {
                  console.log(cardData);
                  console.log('');
                });
              });
          });
        });
      });
  }

  function getTokenAndData() {
    fetch(new Request('/githubToken'))
      .then(function(response) {
        response.json().then(function(data) {
          const headers = {
            'Accept': 'application/vnd.github.inertia-preview+json',
            'Authorization': `token ${data.token}`,
          };

          getColumnsAndCards(headers);
        });
      });
  }

  window.onload = function() {
    getTokenAndData();
  };
})();
