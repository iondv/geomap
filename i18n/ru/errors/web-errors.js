const codes = require('../../../errors/web-errors');

module.exports = {
  [codes.RENDER_FAIL]: 'Ошибка рендера шаблона %template',
  [codes.NO_LAYER]: 'Ошибка получения объекта',
  [codes.NO_LAYERS]: 'Ошибка получения объектов',
  [codes.LAYERS_404]: 'Объекты не найдены',
  [codes.NO_REPO]: 'Не указан репозиторий метаданных гео-модуля.'
};
