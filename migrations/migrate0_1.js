//
// prior to this migration, the shares are stored as json in the db
// after this migration, stored as base64 encodes of the rexpaint format.
//
// migration also adds a version column to the db so we can automate migrations later
//

const sqlite3 = require("sqlite3");

var db = new sqlite3.Database('.data/database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});