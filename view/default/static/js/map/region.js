'use strict';

(function () {

  Map.Region = function (filter, data) {
    this.filter = filter;
    this.data = data;
    this.id = data.properties.osmId;
    this.level = data.properties.level;
    this.oktmo = data.properties.oktmo;
    this.title = data.properties.title;
    this.createGeoObject();
    this.init();
  };

  Map.Region.prototype = {
    constructor: Map.Region,

    createGeoObject: function () {
      this.geoObject = new ymaps.GeoObject(this.data, {
        zIndex: this.level,
        zIndexHover: this.level,
        simplificationFixedPoints: this.data.geometry.fixedPoints
      });
      this.setGeoOptions(this.filter.params.levels && this.filter.params.levels[this.level]);
    },

    init: function () {
      this.filter.collection.add(this.geoObject);
    },

    activate: function () {
      var params = this.filter.params.activeLevels && this.filter.params.activeLevels[this.level];
      if (params) {
        this.setGeoOptions(params);
      }
    },

    deactivate: function () {
      this.setGeoOptions(this.filter.params.levels && this.filter.params.levels[this.level]);
    },

    setGeoOptions: function (data) {
      data = data || {};
      this.geoObject.options.set('strokeWidth', data.strokeWidth === undefined ? 1 : data.strokeWidth);
      this.geoObject.options.set('strokeColor', data.strokeColor || '#000');
      this.geoObject.options.set('strokeStyle', data.strokeStyle || 'solid');
      this.geoObject.options.set('strokeOpacity', data.strokeOpacity === undefined ? 1 : data.strokeOpacity);
      this.geoObject.options.set('fillColor', data.fillColor || '#ff0');
      this.geoObject.options.set('fillOpacity', data.fillOpacity === undefined ? 0.1 : data.fillOpacity);
    },

    // RELATIONS

    getParent: function () {
      var parents = this.data.properties.parents;
      return parents && parents.length ? this.filter.regions[parents[0].id] : null;
    },

    getChildren: function () {
      var items = [];
      for (var i = 0; i < this.filter.regionList.length; ++i) {
        if (this.filter.regionList[i].getParent() === this) {
          items.push(this.filter.regionList[i]);
        }
      }
      return items;
    },

    hasAncestor: function (ancestor) {
      var parents = this.data.properties.parents;
      if (parents) {
        for (var i = 0; i < parents.length; ++i) {
          if (parents[i].id === ancestor.id) {
            return true;
          }
        }
      }
      return false;
    },

    getDescendants: function () {
      var items = [];
      for (var i = 0; i < this.filter.regionList.length; ++i) {
        if (this.filter.regionList[i].hasAncestor(this)) {
          items.push(this.filter.regionList[i]);
        }
      }
      return items;
    },

    // EVENTS

    dblclick: function (event) {
      event.preventDefault();
      this.filter.setActiveRegion(this);
    },

    click: function (event) {
      //console.log('click');
    }
  };

  // PARSE

  Map.Region.createRegions = function (filter, geoJson, options) {
    options = $.extend({
      latLongOrder: true
    }, options);
    var regions = {};
    for (var i = 0; i < geoJson.features.length; ++i) {
      var line = geoJson.features[i];
      if (line.geometry) {
        var region = new Map.Region(filter, options.latLongOrder ? line : convertCoordinate(line));
        regions[region.id] = region;
      } else {
        console.error('Osm line fail', line);
      }
    }
    return regions;
  };

  function convertCoordinate (feature) {
    return {
      type: "Feature",
      geometry: {
        type: 'Polygon',
        fillRule: feature.geometry.coordinates.length > 1 ? 'evenOdd' : 'nonZero',
        coordinates: flip(feature.geometry.coordinates)
      },
      properties: feature.properties
    };
  }

  function flip (a) {
    var b = [];
    for (var i = 0, l = a.length; i < l; ++i) {
      b[i] = flipa(a[i]);
    }
    return b;
  }

  function flipa (a) {
    var b = [];
    for (var i = 0, l = a.length; i < l; ++i) {
      b[i] = [a[i][1], a[i][0]];
    }
    return b;
  }

})();
