'use strict';

const moduleName = require('../../../module-name');
const di = require('core/di');
const path = require('path');
const fs = require('fs');

const regions = {};
var dir = path.normalize(path.join(__dirname, '../../../data/regions'));
var files = fs.readdirSync(dir);
for (let i = 0; i < files.length; i++) {
  let data = require(path.join(dir, files[i]));
  regions[path.parse(files[i]).name] = data;
}

module.exports = function (req, res) {
  let scope = di.context(moduleName);
  try {
    if (req.query.id) {
      let result = [];
      let ids = req.query.id;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach(id => {
        if (regions.hasOwnProperty(id)) {
          result.push(regions[id]);
        }
      });
      res.json(result.length ? result[0] : null);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    scope.sysLog.error(err);
    res.sendStatus(500);
  }
};
