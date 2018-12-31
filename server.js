const express = require("express");
const sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');

const app = express();
process.on('uncaughtException', (e) => {
    console.error('uncaughtException: ' + e);
});
app.use(express.static('dist'));
app.use(bodyParser.text({extended:true, limit:'20mb'})); // for parsing application/x-www-form-urlencoded

var db = new sqlite3.Database('.data/database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

// should probably have a better migration solution :0
db.run("CREATE TABLE IF NOT EXISTS saves (data TEXT);");

app.post('/save', async (req, res, next) => {
  db.run("INSERT INTO saves VALUES (?)", req.body, function(e){
    res.end(this.lastID.toString());
  });
});
app.get('/:id', (req, res)=>{
  res.sendFile(__dirname + '/dist/index.html');
});
app.get('/load/:id?', function loaderHandler(req, res) {
  console.log(req.params.id);
  // send the data from that id back to the client
  var dbreq = db.get("SELECT data FROM saves WHERE rowid="+req.params.id, (err, row)=>{
    console.log(err);
    res.send(row.data);
  });
});
const listener = app.listen(process.env.PORT, () => {
    console.log(`server ready. port: ${listener.address().port}`);
});
