(function() {
  const githubApi = 'https://api.github.com/';
  const projectId = window.location.pathname.slice(1);
  const columnTransitionEvents = [];
  const columnNames = [];

  // Track when we're "done" fetching data.
  let requestCount = 0;
  let responseCount = 0;

  const interestingEventTypes = [
    'added_to_project',
    // 'closed', TODO: handle this in the future
    'converted_note_to_issue',
    'moved_columns_in_project',
    // 'reopened', TODO: handle this in the future
  ];

  function getChartFriendlyData() {
  }

  function generateTransitionReport() {
    if (requestCount && requestCount !== responseCount) {
      return;
    }

    requestCount = 0;
    responseCount = 0;

    const chartNode = document.querySelector('#transitionChart');

    const transitionChart = new Chart(chartNode, {
      type: 'line',
      data: getChartFriendlyData(),
      options: {
      }
    });
  }

  function getEventStream(card, headers) {
    const eventStreamUrl = githubApi + card.content_url.split('com/')[1] + '/timeline';

    const eventStreamHeaders = {
      'Accept': 'application/vnd.github.starfox-preview+json, application/vnd.github.mockingbird-preview',
      'Authorization': headers.Authorization,
    };

    requestCount++;

    fetch(eventStreamUrl, {headers: eventStreamHeaders})
      .then((response) => {
        responseCount++;

        response.json().then((data) => {
          const events = data.filter((datum) => {
            return interestingEventTypes.includes(datum.event);
          });

          if (events.length) {
            const eventData = events.map((event) => {
              const projectCard = event.project_card;

              return {
                type: event.event,
                timestamp: event.created_at,
                fromColumn: projectCard.previous_column_name,
                toColumn: projectCard.column_name,
              };
            });

            columnTransitionEvents.push({
              id: card.content_url.split('/').concat([]).pop(),
              eventData: eventData
            });
          }

          generateTransitionReport();
        });
      });
  }

  function getColumnsAndCards(headers) {
    fetch(githubApi + `projects/${projectId}/columns`, {headers})
      .then((columnResponse) => {
        columnResponse.json().then((columnData) => {
          columnData.forEach((datum) => {
            columnNames.push(datum.name);

            fetch(datum.cards_url, {headers})
              .then((cardResponse) => {
                cardResponse.json().then((cardData) => {
                  cardData.forEach((card) => {
                    getEventStream(card, headers);
                  });
                });
              });
          });
        });
      })
  }

  function getTokenAndData() {
    fetch(new Request('/githubToken'))
      .then((response) => {
        response.json().then((data) => {
          const headers = {
            'Accept': 'application/vnd.github.inertia-preview+json',
            'Authorization': `token ${data.token}`,
          };

          getColumnsAndCards(headers);
        });
      });
  }

  window.onload = function() {
    Chart.platform.disableCSSInjection = true;

    getTokenAndData();
  };
})();
