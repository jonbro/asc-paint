//
// prior to this migration, the shares are stored as json in the db
// after this migration, stored as base64 encodes of the rexpaint format.
//
// migration also adds a version column to the db so we can automate migrations later
//
import {Drawing} from "../src/Drawing.js"
import {RexPaintCodec} from "../src/RexPaintCodec"
let drawing = new Drawing(64,40);

const sqlite3 = require("sqlite3");

var db = new sqlite3.Database('.data/database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

db.all("SELECT ROWID as rowid, data FROM saves", function(err, rows) {  
    rows.forEach(function(row) {  
      drawing.setData(JSON.parse(row.data));
      let rp = new RexPaintCodec();
      // rebuild the graphics with the correct setup... this is actually handled already, yay
      rp.layers = drawing.layers;
      rp.width = drawing.width;
      rp.height = drawing.height;
      let data = rp.encode();
      db.run("UPDATE saves SET data = ? WHERE rowid = ?", [data.toString('base64'), row.rowid], function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
      });
    });
});
