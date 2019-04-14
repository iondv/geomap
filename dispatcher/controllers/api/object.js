'use strict';

const async = require('async');
const moduleName = require('../../../module-name');
const locale = require('locale');
const di = require('core/di');

module.exports = function (req, res) {
  let scope = di.context(moduleName);
  let locales = new locale.Locales(req.headers['accept-language']);
  try {
    scope.dataRepo.getItem(req.params.class, req.params.id).then(item => {
      item ? res.json(item.base) : res.sendStatus(404);
    }).catch(err => {
      scope.sysLog.error(err);
      res.sendStatus(500);
    });
  } catch (err) {
    scope.sysLog.error(err);
    res.sendStatus(500);
  }
};
