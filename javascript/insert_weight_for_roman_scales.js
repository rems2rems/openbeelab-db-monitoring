// Generated by CoffeeScript 1.9.2
(function() {
  var config, db, dbConfig;

  config = require('./config');

  dbConfig = config.services.database;

  db = require('../../openbeelab-db-util/javascript/dbUtil').database(dbConfig);

  db.get('_design/orphan_deltas/_view/by_date?limit=1').then(function(orphans) {
    var lastWeightUrl, orphan, ref;
    if ((orphans != null ? (ref = orphans.rows) != null ? ref.length : void 0 : void 0) > 0) {
      console.log("orphan found");
      orphan = orphans.rows[0].value;
      console.log("orphan=");
      console.log(orphan._id);
      console.log(orphan.beehouse_id);
      console.log(orphan.timestamp);
      console.log("-----");
      lastWeightUrl = '_design/global_weight/_view/by_beehouse_and_date?startkey=["' + orphan.beehouse_id + '",{}]&endkey=["' + orphan.beehouse_id + '"]&descending=true&limit=1';
      return db.get(lastWeightUrl).then(function(lastWeight) {
        var ref1;
        if ((lastWeight != null ? (ref1 = lastWeight.rows) != null ? ref1.length : void 0 : void 0) > 0) {
          lastWeight = lastWeight.rows[0].value;
          console.log("lastWeight=");
          console.log(lastWeight._id);
          console.log(lastWeight.beehouse_id);
          console.log(lastWeight.timestamp);
          console.log("-----");
          delete lastWeight._id;
          delete lastWeight._rev;
          lastWeight.measure_origin = "computed_from_delta";
          lastWeight.value += orphan.value;
          lastWeight.timestamp = orphan.timestamp;
          return db.save(lastWeight).then(function() {
            console.log("measure uploaded to db " + dbConfig.name);
            delete orphan._rev;
            orphan.absolute_weight_inserted = true;
            return db.save(orphan).then(function() {
              return console.log("delta " + orphan._id + " updated as ok");
            });
          });
        }
      });
    } else {
      return console.log("no orphan-delta found. exiting");
    }
  })["catch"](function(err) {
    return console.log(err);
  });

}).call(this);
