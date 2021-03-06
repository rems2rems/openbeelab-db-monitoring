// Generated by CoffeeScript 1.9.2
(function() {
  var config, db, dbConfig, moment;

  moment = require('moment');

  config = require('./config');

  dbConfig = config.services.database;

  db = require('../../openbeelab-db-util/javascript/dbUtil').database(dbConfig);

  db.exists(function(err, exists) {
    var admin, i, len, ref, results;
    if (err || !exists) {
      ref = config.admins;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        admin = ref[i];
        results.push((function(admin) {
          var mailOptions, mailer;
          mailer = require('./mailTransporter');
          mailOptions = {
            from: 'openbeelab beehouse monitoring ✔ <remy.openbeelab@gmail.com>',
            to: admin.email,
            subject: 'db down',
            text: 'openbeelab db seems to be down...'
          };
          return mailer.sendMail(mailOptions, function(error, info) {
            if (error) {
              return console.log(error);
            } else {
              return console.log('Message sent: ' + info.response);
            }
          });
        })(admin));
      }
      return results;
    } else {
      return db.get('_design/apiaries/_view/by_name', function(err, apiaries) {
        var apiary, j, len1, results1;
        results1 = [];
        for (j = 0, len1 = apiaries.length; j < len1; j++) {
          apiary = apiaries[j];
          results1.push((function(apiary) {
            var beehouse_id, k, len2, ref1, results2;
            apiary = apiary.value;
            if (apiary.beehouses != null) {
              ref1 = apiary.beehouses;
              results2 = [];
              for (k = 0, len2 = ref1.length; k < len2; k++) {
                beehouse_id = ref1[k];
                results2.push((function(beehouse_id) {
                  return db.get(beehouse_id, function(err, beehouse) {
                    var lastMeasureUrl;
                    if (!err && (beehouse != null ? beehouse.isActive : void 0)) {
                      lastMeasureUrl = '_design/' + beehouse.name + '/_view/weight?descending=true&limit=1';
                      return db.get(lastMeasureUrl, function(err, lastMeasure) {
                        var alertTime, beekeeper_id, l, lastMeasureTime, len3, now, ref2, results3, trigger;
                        if (!err && (lastMeasure != null)) {
                          lastMeasure = lastMeasure.rows[0].value;
                          now = moment(new Date());
                          lastMeasureTime = moment(new Date(lastMeasure.timestamp));
                          trigger = config.alerts.connectionTrigger;
                          alertTime = lastMeasureTime.add(trigger.value, trigger.unit);
                          if (now.isAfter(alertTime)) {
                            if ((apiary.beekeepers != null) && apiary.beekeepers.length > 0) {
                              ref2 = apiary.beekeepers;
                              results3 = [];
                              for (l = 0, len3 = ref2.length; l < len3; l++) {
                                beekeeper_id = ref2[l];
                                results3.push((function(beekeeper_id) {
                                  return db.get(beekeeper_id, function(err, beekeeper) {
                                    var diff, mailOptions, mailer;
                                    mailer = require('./mailTransporter');
                                    diff = now.diff(lastMeasureTime, 'minutes');
                                    mailOptions = {
                                      from: 'openbeelab beehouse monitoring ✔ <remy.openbeelab@gmail.com>',
                                      to: beekeeper.email,
                                      subject: 'beehouse disconnected',
                                      text: 'beehouse ' + beehouse.name + ' from apiary ' + apiary.name + ' didn\'t send data since ' + diff + ' minutes.'
                                    };
                                    return mailer.sendMail(mailOptions, function(error, info) {
                                      if (error) {
                                        return console.log(error);
                                      } else {
                                        return console.log('Message sent: ' + info.response);
                                      }
                                    });
                                  });
                                })(beekeeper_id));
                              }
                              return results3;
                            }
                          }
                        }
                      });
                    }
                  });
                })(beehouse_id));
              }
              return results2;
            }
          })(apiary));
        }
        return results1;
      });
    }
  });

}).call(this);
