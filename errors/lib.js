const { IonError } = require('@iondv/core');
const { w: t } = require('@iondv/i18n');

const PREFIX = 'lib';

const codes = module.exports = {
  NO_DS: `${PREFIX}.nods`,
  WRONG_QUERY: `${PREFIX}.wq`,
  DENIED: `${PREFIX}.ad`
};

IonError.registerMessages({
  [codes.NO_DS]: t('Data source for coordinate dictionary is not set.'),
  [codes.WRONG_QUERY]: t('Incorrect layer data description object.'),
  [codes.DENIED]: t('Access denied!')
});

