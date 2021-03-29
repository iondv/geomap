'use strict';

const locale = require('locale');
const { di } = require('@iondv/core');

module.exports = function (req, res) {
  let scope = di.context(req.moduleName);
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
