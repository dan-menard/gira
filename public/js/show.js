(function() {
  const githubApi = 'https://api.github.com/';
  const projectId = window.location.pathname.slice(1);

  function getEventStream(cardContentUrl, headers) {
    const eventStreamUrl = githubApi + cardContentUrl.split('com/')[1] + '/timeline';

    const eventStreamHeaders = {
      'Accept': 'application/vnd.github.starfox-preview+json, application/vnd.github.mockingbird-preview',
      'Authorization': headers.Authorization,
    };

    fetch(eventStreamUrl, {headers: eventStreamHeaders})
      .then(function(response) {
        response.json().then(function(data) {
          console.log(data);
        });
      });
  }

  function getColumnsAndCards(headers) {
    fetch(githubApi + `projects/${projectId}/columns`, {headers})
      .then(function(columnResponse) {
        columnResponse.json().then(function(columnData) {
          columnData.forEach(function(datum) {
            fetch(datum.cards_url, {headers})
              .then(function(cardResponse) {
                cardResponse.json().then(function(cardData) {
                  cardData.forEach(function(card) {
                    getEventStream(card.content_url, headers);
                  });
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
