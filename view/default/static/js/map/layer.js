'use strict';

(function () {

  Map.Layer = function (nav, data) {
    this.nav = nav;
    this.map = nav.map;
    this.ymap = nav.map.ymap;
    this.data = data;
    this.active = false;
    this.objectLoaders = [];
    this.event = new Helper.Event(this, nav.map);
    this.init();
  };

  Map.Layer.prototype = {
    constructor: Map.Layer,

    init: function () {},

    // OBJECT LOADER

    removeObjectLoaders: function () {
      Helper.array.each(this.objectLoaders, 'setParent', null);
      this.objectLoaders = [];
    },

    createObjectLoaders: function () {
      this.removeObjectLoaders();
      for (var i = 0; i < this.data.data.length; ++i) {
        this.objectLoaders.push(this.createObjectLoader(this.data.data[i], i));
      }
    },

    createObjectLoader: function (data, index) {
      var options = $.extend({
        splitRequests: false,
        clusterize: true,
        clusterBalloonContentLayout: data.clusterBalloonContentLayout || 'cluster#balloonCarousel',
        url: this.createUrlTemplate()
      }, data.options);

      Map.Layer.assignParamHandlers(data.params, options);
      var loader = new this.map.CustomLoadingObjectManager(options.url, options);
      loader.options.set('loading', true);
      loader.events.add('dataloadbefore', function () {
        loader.options.set('loading', true);
        this.map.updateLoading();
      }, this);
      loader.events.add('dataloadafter', function () {
        loader.options.set('loading', false);
        if (!this.isLoading()) {
          this.map.updateLoading();
        }
      }, this);
      if (options.clusterPreset) {
        loader.clusters.options.set('preset', options.clusterPreset);
      } else if (options.customCluster) {
        loader.clusters.options.set(options.customCluster);
      }
      if (options.geoObjectPreset) {
        loader.objects.options.set('preset', options.geoObjectPreset);
      } else if (options.customGeoObject) {
        loader.objects.options.set(options.customGeoObject);
      }
      Map.Layer.assignHandlers(loader, data);
      loader.setFilter(this.nav.filter.bind(this.nav, loader));
      loader.properties.set('layer', this);
      return loader;
    },

    updateUrlTemplate: function () {
      for (var i = 0; i < this.objectLoaders.length; ++i) {
        this.objectLoaders[i].setUrlTemplate(this.createUrlTemplate(i));
      }
    },

    createUrlTemplate: function (index) {
      return '/'+ this.map.zoneParams.module +'/'
        + (this.data.namespace ? this.data.namespace +'/' : '')
        + this.data.code +'/objects/' + (index || 0)
        +'?bbox=%b'+ this.getEagerLoadingParams();
    },

    getEagerLoadingParams: function () {
      var data = this.nav.getFilterEagerLoadingData();
      return data instanceof Array ? '&eager='+ data.join(',') : '';
    },

    enable: function () {
      if (!this.active) {
        this.createObjectLoaders();
        for (var i = 0; i < this.objectLoaders.length; ++i) {
          if (this.ymap) {
            this.ymap.geoObjects.add(this.objectLoaders[i]);
          }
        }
        this.active = true;
      }
    },

    disable: function () {
      this.active = false;
      this.removeObjectLoaders();
    },

    isLoading: function () {
      for (var i = 0; i < this.objectLoaders.length; ++i) {
        if (this.objectLoaders[i].options.get('loading')) {
          return true;
        }
      }
      return false;
    },

    // FILTER

    filter: function (geoObject) {
      if (this.nav.filter(geoObject)) {
        return this.layerFilter ? this.layerFilter.filter(geoObject) : true;
      }
      return false;
    },

    execFilter: function () {
      //this.createObjectLoaders();
      if (this.active) {
        this.updateUrlTemplate();
        Helper.array.each(this.objectLoaders, 'reloadData');
        //this.enable();
      }
    }
  };
})();
