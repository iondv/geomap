'use strict';

(function () {

  Map.Nav = function (map, url, params) {
    this.map = map;
    this.url = url;
    this.params = params || {};
    this.active = true;
    this.layers = [];
    this.viewers = [];
    this.navFilter = null;
    this.event = new Helper.Event(this, map);
    this.init();
  };

  Map.Nav.prototype = {
    constructor: Map.Nav,

    init: function () {
      if (this.params.hasFilter) {
        this.loadNavFilter();
      }
      $.getJSON(this.url, {}, function (layers) {
        for (var i = 0; i < layers.length; ++i) {
          this.layers.push(new Map.Layer(this, layers[i]));
        }
        if (this.active) {
          Helper.array.each(this.layers, 'enable');
          this.map.legend && this.map.legend.render();
        }
      }.bind(this)).fail(processAjaxError);
      this.viewers = Map.Viewer.create(this, this.params.viewer);
      Helper.array.each(this.viewers, 'show');
    },

    enable: function () {
      this.active = true;
      this.attachFilter();
      //this.execFilter();
      Helper.array.each(this.layers, 'enable');
      this.map.updateLoading();
      Helper.array.each(this.viewers, 'show');
    },

    disable: function () {
      this.active = false;
      Helper.array.each(this.layers, 'disable');
      this.detachFilter();
      this.map.updateLoading();
      Helper.array.each(this.viewers, 'hide');
    },

    isLoading: function () {
      if (this.active) {
        for (var i = 0; i < this.layers.length; ++i) {
          if (this.layers[i].isLoading()) {
            return true;
          }
        }
      }
      return false;
    },

    // FILTER

    loadNavFilter: function () {
      $.get('geomap/api/filter', {
        ns: this.params.ns,
        code: this.params.code
      }).done(function (data) {
        this.navFilter = new Map.NavFilter(this, data);
        this.attachFilter();
      }.bind(this)).fail(processAjaxError);
    },

    filter: function (loader, geoObject) {
      if (this.map.filter(loader, geoObject)) {
        return this.navFilter ? this.navFilter.filter(loader, geoObject) : true;
      }
      return false;
    },

    execFilter: function () {
      if (this.active) {
        Helper.array.each(this.layers, 'execFilter');
      }
    },

    attachFilter: function () {
      if (this.navFilter && this.active && this.map.filterForm) {
        this.map.filterForm.attach(this.navFilter);
      }
    },

    detachFilter: function () {
      if (this.navFilter && this.map.filterForm) {
        this.map.filterForm.detach(this.navFilter);
        this.navFilter.reset();
      }
    },

    getFilterEagerLoadingData: function () {
      return this.navFilter ? this.navFilter.getEagerLoadingData() : null;
    }
  };
})();
