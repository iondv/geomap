const codes = require('../../errors/lib');
const {w: t} = require('core/i18n');

module.exports = {
  [codes.NO_DS]: t('Не настроен источник данных словаря координат.'),
  [codes.WRONG_QUERY]: t('Некорректный объект описания данных слоя.'),
  [codes.DENIED]: t('Access denied!')
};
