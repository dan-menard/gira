(function() {
  function getToken() {
    fetch(new Request('/githubToken'))
      .then(function(response) {
        response.json().then(function(data) {
          console.log(data);
        });
      });
  }

  getToken();
})();
