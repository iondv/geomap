'use strict';

module.exports = {
  api: {
    fetch: require('./controllers/api/fetch'),
    filter: require('./controllers/api/filter'),
    regions: require('./controllers/api/regions'),
    search: require('./controllers/api/search'),
    object: require('./controllers/api/object')
  },
  index: require('./controllers/index'),
  layers: require('./controllers/layers'),
  fetch: require('./controllers/fetch'),
  render: require('./controllers/render'),
  renderList: require('./controllers/render-list')
};
