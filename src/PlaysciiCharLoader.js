// load and parse a playscii char file

class PlaysciiCharLoader
{
  constructor()
  {
  }
  LoadFromURL(url, onLoad)
  {

    fetch(url) // Call the fetch function passing the url of the API as a parameter
    .then(function(resp) {
      resp.text().then(function(data) {
        // handle data response
      });
    })
    .catch(function() {
        // This is where you run code if the server returns any errors
    });
  }
}