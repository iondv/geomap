const { IonError } = require('@iondv/core');
const { w: t } = require('@iondv/i18n');

const PREFIX = 'web';

const codes = module.exports = {
  RENDER_FAIL: `${PREFIX}.rf`,
  NO_LAYER: `${PREFIX}.nl`,
  NO_LAYERS: `${PREFIX}.nls`,
  LAYERS_404: `${PREFIX}.l404`,
  NO_REPO: `${PREFIX}.nr`
};

IonError.registerMessages({
  [codes.RENDER_FAIL]: t('Template %template rendering error'),
  [codes.NO_LAYER]: t('Object reading error'),
  [codes.NO_LAYERS]: t('Objects reading error'),
  [codes.LAYERS_404]: t('Objects were not found'),
  [codes.NO_REPO]: t('Geomap metadata repository is not set.')
});
