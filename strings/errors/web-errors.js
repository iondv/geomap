const codes = require('../../errors/web-errors');
const {w: t} = require('core/i18n');

module.exports = {
  [codes.RENDER_FAIL]: t('Template %template rendering error'),
  [codes.NO_LAYER]: t('Object reading error'),
  [codes.NO_LAYERS]: t('Objects reading error'),
  [codes.LAYERS_404]: t('Objects were not found'),
  [codes.NO_REPO]: t('Geomap metadata repository is not set.')
};
