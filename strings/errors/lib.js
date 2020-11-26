const codes = require('../../errors/lib');
const {w: t} = require('core/i18n');

module.exports = {
  [codes.NO_DS]: t('Data source for coordinate dictionary is not set.'),
  [codes.WRONG_QUERY]: t('Incorrect layer data description object.'),
  [codes.DENIED]: t('Access denied!')
};
