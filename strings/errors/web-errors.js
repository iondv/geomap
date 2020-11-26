const codes = require('../../errors/web-errors');
const {w: t} = require('core/i18n');

module.exports = {
  [codes.RENDER_FAIL]: t('Ошибка рендера шаблона %template'),
  [codes.NO_LAYER]: t('Ошибка получения объекта'),
  [codes.NO_LAYERS]: t('Ошибка получения объектов'),
  [codes.LAYERS_404]: t('Объекты не найдены'),
  [codes.NO_REPO]: t('Не указан репозиторий метаданных гео-модуля.')
};
