'use strict';

(function () {

  Map.RegionFilter = function () {
    Map.BaseFilter.apply(this, arguments);
    this.collection = new ymaps.GeoObjectCollection();
    this.addCollectionEvent('dblclick', 'dblclick');
    this.init();
  };

  $.extend(Map.RegionFilter.prototype, Map.BaseFilter.prototype, {
    constructor: Map.RegionFilter,

    getDefaultParams: function () {
      return {
        enabled: false,
        url: 'geomap/api/regions',
        osmIds: [],
        activeOsmId: null,
        button: {
          caption: 'Районы',
          hint: 'Фильтр по районам',
          resetHint: 'Сбросить фильтр',
          maxWidth: 100
        },
        levels: {
          4: {
            strokeWidth: 3,
            strokeColor: '#0ff',
            strokeStyle: 'solid',
            strokeOpacity: 1.0,
            fillColor: '#afe',
            fillOpacity: 0.1
          },
          6: {
            strokeWidth: 1,
            strokeColor: '#f0f',
            strokeStyle: 'solid',
            strokeOpacity: 1.0,
            fillColor: "#afe",
            fillOpacity: 0.1
          }
        },
        activeLevels: {
          6: {
            strokeWidth: 2,
            strokeColor: '#f00',
            strokeStyle: 'solid',
            strokeOpacity: 0.8,
            fillColor: '#ff0',
            fillOpacity: 0.2
          }
        }
      };
    },

    init: function () {
      if (this.params.osmIds) {
        $.get(this.params.url, {
          id: this.params.osmIds
        }).done(function (data) {
          this.parseData(data);
          this.createToggle();
          if (this.params.enabled) {
            if (this.regions[this.params.activeOsmId]) {
              this.show();
              this.setActiveRegion(this.regions[this.params.activeOsmId]);
            } else {
              this.enable();
            }
          }
        }.bind(this));
      }
    },

    createToggle: function () {
      this.panel ? this.createPanelToggle() : this.createYmapToggle();
    },

    createPanelToggle: function () {
      var section = new Map.Panel.Section(this.panel);
      var result = section.createButtonHtml({
        cssClass: 'panel-btn region-toggle',
        caption: this.params.button.caption,
        hint: this.params.button.hint
      });
      result += section.createResetButtonHtml({
        cssClass: 'region-reset',
        hint: this.params.button.resetHint
      });
      result = section.createResetGroupHtml({
        content: result
      });
      result = section.createHtml({
        cssClass: 'region-panel-section',
        content: result,
        orderNumber: this.params.panel.orderNumber
      });
      this.panel.insertByOrder(result);
      this.toggleBtn = this.panel.find('.region-toggle');
      this.resetBtn = this.panel.find('.region-reset');
      this.toggleBtn.click(function () {
        this.setToggleSelected() ? this.enable(true) : this.disable();
      }.bind(this));
      this.resetBtn.click(this.reset.bind(this));
      this.panelSection = section;
    },

    createYmapToggle: function () {
      this.toggleBtn = new ymaps.control.Button({
        data: {
          content: this.params.button.caption,
          title: this.params.button.hint
        },
        options: {
          maxWidth: this.params.button.maxWidth
        }
      });
      this.resetBtn = Map.BaseFilter.createYmapResetBtn(this.params.button.resetHint);
      this.ymap.controls.add(this.toggleBtn, { position: {left:10, top:10}});
      this.ymap.controls.add(this.resetBtn, { position: {left:90, top:10}});
      this.toggleBtn.events.add('select', this.enable, this);
      this.toggleBtn.events.add('deselect', this.disable, this);
      this.resetBtn.events.add('click', this.reset, this);
    },

    parseData: function (data) {
      this.data = data;
      this.collection.removeAll();
      this.maxRegionLevel = data.metaData.levels[data.metaData.levels.length - 1] + 1;
      this.regions = Map.Region.createRegions(this, data, this.params);
      this.regionList = Helper.object.getValues(this.regions);
      this.rootRegion = this.getRootRegion();
      this.activeRegion = this.rootRegion;
    },

    show: function () {
      this.active = true;
      this.setToggleSelected(true);
      this.ymap.geoObjects.add(this.collection);
    },

    enable: function (notBound) {
      this.show();
      notBound ? this.update() : this.setBounds().then(this.update.bind(this));
      this.event.trigger('enable');
    },

    disable: function () {
      this.active = false;
      this.setToggleSelected(false);
      this.collection.setParent(null);
      this.update();
      this.event.trigger('disable');
    },

    reset: function () {
      this.disable();
      this.collection.removeAll();
      Helper.array.each(this.regionList, function (region) {
        this.collection.add(region.geoObject);
      }.bind(this));
      this.activeRegion = this.rootRegion;
    },

    filter: function (loader, geoObject) {
      if (this.active && this.activeRegion) {
        return this.activeRegion.geoObject.geometry.contains(geoObject.geometry.coordinates);
      }
      return true;
    },

    // REGIONS

    setActiveRegion: function (region) {
      region = this.activeRegion === region ? region.getParent() || region : region;
      region = region || this.rootRegion;
      if (region !== this.activeRegion) {
        if (this.activeRegion) {
          this.activeRegion.deactivate();
        }
        this.activeRegion = region;
        this.activeRegion.activate();
        this.collection.removeAll();
        this.addRegionToCollection(this.activeRegion);
        this.setBounds().then(this.update.bind(this));
        this.event.trigger('active');
      }
    },

    getRootRegion: function () {
      var root = null;
      for (var i = 0; i < this.regionList.length; ++i) {
        if (!root || root.level > this.regionList[i].level) {
          root = this.regionList[i];
        }
      }
      return root;
    },

    // COLLECTION

    setBounds: function () {
      return this.ymap.setBounds(this.collection.getBounds(), {duration: 300});
    },

    addRegionToCollection: function (region) {
      this.collection.add(region.geoObject);
      var items = region.getChildren();
      for (var i = 0; i < items.length; ++i) {
        this.collection.add(items[i].geoObject);
      }
    },

    addCollectionEvent: function (eventName, handler) {
      this.collection.events.add(eventName, function (event) {
        var target = event.get('target');
        var id = target.properties.get('osmId');
        if (typeof handler === 'function') {
          handler(this.regions[id], eventName, event);
        } else {
          this.regions[id][handler](event);
        }
      }.bind(this));
    },

    removeCollectionEvent: function (event) {
      this.collection.events.remove(event);
    }

  });
})();
