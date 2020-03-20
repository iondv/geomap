'use strict';

(function () {

  Map.Viewer = function (nav, params) {
    this.nav = nav;
    this.params = params || {};
    this.handlers = {};
    this.panel = this.nav.map.panels[params.panel];
    this.init();
  };

  Map.Viewer.create = function (nav, params) {
    params = params instanceof Array ? params : params ? [params] : [];
    var viewers = [];
    for (var i = 0; i < params.length; ++i) {
      var Constructor = null;
      switch (params[i].type) {
        case 'regionReport': Constructor = Map.Viewer.RegionReport; break;
        default: Constructor = Map.Viewer;
      }
      if (Constructor) {
        viewers.push(new Constructor(nav, params[i]));
      }
    }
    return viewers;
  };

  Map.Viewer.prototype = {
    constructor: Map.Viewer,

    init: function () {
      this.createHandlers();
    },

    show: function () {
      if (this.panel) {
        this.panel.load(this.nav, this.params.url);
      }
    },

    hide: function () {
      if (this.panel) {
        this.panel.hide(this.nav);
      }
    },

    // HANDLERS

    createHandlers: function () {
      if (this.params.handlers) {
        for (var key in this.params.handlers) {
          if (this.params.handlers.hasOwnProperty(key)) {
            switch (key) {
              case 'centerMapByImodalObject':
                this.createHandlerCenterMapByImodalObject(this.params.handlers[key]);
                break;
              default:
                console.error(__('js.vHandlerNotFound'), key);
            }
          }
        }
      }
    },

    createHandlerCenterMapByImodalObject: function (params) {
      imodal.on('updateById', function (event, data) {
        if (this.nav.active && data) {
          $.get('geomap/api/object/'+ params.className +'/'+ data.id).done(function (item) {
            var map = this.nav.map;
            var collection = new ymaps.GeoObjectCollection;
            var geo = { geometry: item[params.geoPropertyName] };
            map.addGeoItemToCollection(geo, collection);
            map.setBoundsByCollection(collection, {maxZoom: 13});
          }.bind(this)).fail(processAjaxError);
        }
      }.bind(this));
    }
  };
})();
