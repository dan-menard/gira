(function() {  const githubApi = 'https://api.github.com/';
  const projectId = window.location.pathname.slice(1);

  const columnNames = [];
  const columnTransitionEvents = [];

  let loader;

  const issueOpenDates = [];
  const issueClosedDates = [];

  // Track when we're "done" fetching data.
  let requestCount = 0;
  let responseCount = 0;

  const interestingEventTypes = [
    'added_to_project',
    'converted_note_to_issue',
    'moved_columns_in_project',
  ];

  function getTransitionReportData() {
    const data = {
      labels: columnNames.reverse(),
      datasets: columnTransitionEvents.map((eventDataSet) => {
        const eventData = eventDataSet.eventData;
        const dayZero = new Date(eventData[0].timestamp) * 1;

        const columnData = columnNames.map((columnName) => {
          const matchingEvent = eventData.filter((eventDatum) => {
            return eventDatum.toColumn === columnName;
          });

          if (!matchingEvent.length) {
            return undefined;
          }

          const happenedAt = new Date(matchingEvent[0].timestamp) * 1;
          const dayCount = Math.round((happenedAt - dayZero) / 1000 / 60 / 60 / 24);

          return dayCount;
        });

        return {
          data: columnData,
          fill: true,
          lineTension: 0,
          spanGaps: true,
          steppedLine: 'middle',
        };
      }).reverse()
    };

    return data;
  }

  function generateTransitionReport() {
    const chartNode = document.querySelector('#transitionChart');

    const transitionChart = new Chart(chartNode, {
      type: 'line',
      data: getTransitionReportData(),
      options: {
        animation: {
          duration: 0,
        },
        aspectRatio: 0.5,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            position: 'top',
            ticks: {
              reverse: true,
            },
          }],
          yAxes: [{
            scaleLabel: {
              display: false,
              labelString: 'Number of days',
            },
            ticks: {
              reverse: true,
              beginAtZero: true,
            },
          }]
        },
      }
    });
  }

  // If first date is within an hour of midnight,
  // this will report slightly incorrectly if DST starts/ends between first and last date.
  function generateOpenVsClosedReport() {
    const chartNode = document.querySelector('#openVsClosedChart');

    const sortedOpenDates = issueOpenDates.sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    const sortedClosedDates = issueClosedDates.sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    const lastOpenDate = new Date(sortedOpenDates[sortedOpenDates.length - 1]);
    const lastClosedDate = new Date(sortedClosedDates[sortedClosedDates.length - 1]);

    const lastDate = lastOpenDate - lastClosedDate > 0 ? lastOpenDate : lastClosedDate;
    const firstDate = new Date(sortedOpenDates[0]);

    const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

    const formatDate = (date) => {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    };

    let nextDate = new Date((firstDate * 1) + oneDayInMilliseconds);
    let allDates = [firstDate];

    while (nextDate * 1 < lastDate * 1) {
      allDates.push(nextDate);
      nextDate = new Date((nextDate * 1) + oneDayInMilliseconds);
    }

    allDates.push(lastDate);

    const dateLabels = allDates.map((date) => {
      return formatDate(date);
    });

    let lastOpenCount = 0;

    const openDataset = dateLabels.map((dateString) => {
      let count = 0;

      if (issueOpenDates.length) {
        while (formatDate(new Date(issueOpenDates[0])) === dateString) {
          count++;
          issueOpenDates.shift();
        }
      }

      lastOpenCount += count;
      return lastOpenCount;
    });

    let lastClosedCount = 0;

    const closedDataset = dateLabels.map((dateString) => {
      let count = 0;

      if (issueClosedDates.length) {
        while (formatDate(new Date(issueClosedDates[0])) === dateString) {
          count++;
          issueClosedDates.shift();
        }
      }

      lastClosedCount += count;
      return lastClosedCount;
    });

    const transitionChart = new Chart(chartNode, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [{
          data: openDataset,
          fill: false,
          label: 'Open',
          borderColor: '#ffff66',
        }, {
          data: closedDataset,
          fill: false,
          label: 'Closed',
          borderColor: '#66ffff',
        }]
      },
      options: {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: false,
            },
            ticks: {
              beginAtZero: true,
            },
          }]
        }
      }
    });
  }

  function generateReports() {
    if (requestCount && requestCount !== responseCount) {
      return;
    }

    requestCount = 0;
    responseCount = 0;

    generateTransitionReport();
    generateOpenVsClosedReport();

    loader.stopLoading();

    document.querySelectorAll('.report').forEach((report) => {
      report.classList.remove('hide');
    });
  }

  function getEventStream(card, headers) {
    const eventStreamUrl = githubApi + card.content_url.split('com/')[1] + '/timeline';

    const eventStreamHeaders = {
      'Accept': 'application/vnd.github.starfox-preview+json, application/vnd.github.mockingbird-preview',
      'Authorization': headers.Authorization,
    };

    requestCount++;
    issueOpenDates.push(card.created_at);

    fetch(eventStreamUrl, {headers: eventStreamHeaders})
      .then((response) => {
        responseCount++;

        response.json().then((data) => {
          const events = data.filter((datum) => {
            if (datum.event === 'closed') {
              issueClosedDates.push(datum.created_at);
            }

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

          generateReports();
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

  function getProjectInfo(headers) {
    fetch(githubApi + `projects/${projectId}`, {headers})
      .then((projectInfoResponse) => {
        projectInfoResponse.json().then((projectInfoData) => {
          const link = document.createElement('a');
          link.href = projectInfoData.html_url;
          link.innerHTML = projectInfoData.name;

          const h1 = document.querySelector('h1');
          h1.appendChild(link);
          h1.parentElement.classList.remove('hide');
        });
      });
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
          getProjectInfo(headers);
        });
      });
  }

  window.onload = function() {
    Chart.platform.disableCSSInjection = true;

    loader = new Loader();
    loader.startLoading();

    getTokenAndData();
  };
})();
