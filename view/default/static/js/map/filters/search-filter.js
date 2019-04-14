'use strict';

(function () {

  Map.SearchFilter = function () {
    Map.BaseFilter.apply(this, arguments);
    this.$filter = this.map.$zone.find('.map-search-filter');
    this.$execute = this.$filter.find('.map-search-filter-execute');
    this.$reset = this.$filter.find('.map-search-filter-reset');
    this.$value = this.$filter.find('.map-search-filter-value');
    this.$list = this.$filter.find('.map-search-filter-list');
    this.xhr = null;
    this.items = [];
    this.$execute.click(this.execute.bind(this));
    this.$reset.click(this.reset.bind(this));
    if (this.params.enabled) {
      this.init();
    }
  };

  $.extend(Map.SearchFilter.prototype, Map.BaseFilter.prototype, {
    constructor: Map.SearchFilter,

    init: function () {
      if (this.panel) {
        var section = new Map.Panel.Section(this.panel);
        this.panel.insertByOrder(section.createHtml({
          cssClass: 'search-panel-section',
          orderNumber: this.params.panel.orderNumber
        }));
        this.panel.find('.search-panel-section .map-panel-section-body').append(this.$filter);
      }
      this.$filter.show();

      $(document.body).mousedown(function (event) {
        if (!$(event.target).closest('.map-search-filter').length) {
          this.panel || this.close();
        }
      }.bind(this));

      this.$value.focus(function () {
        if (!this.$filter.hasClass('empty')) {
          this.$filter.addClass('opened');
        }
      }.bind(this));

      this.$value.keypress(function (event) {
        if (event.which === 13) {
          this.execute();
        }
      }.bind(this));

      this.$value.keyup(function (event) {
        if (event.which !== 13) {
          this.startTimer();
        }
      }.bind(this));

      this.$list.on('click', '.map-search-filter-item', function (event) {
        var $item = $(event.target);
        var item = this.items[$item.data('index')];
        this.$list.children('.active').removeClass('active');
        if (item) {
          this.selectItem(item);
          $item.addClass('active');
        }
      }.bind(this));
    },

    show: function () {
      this.$filter.addClass('opened');
    },

    close: function () {
      this.$filter.removeClass('opened');
    },

    empty: function () {
      this.$filter.addClass('empty');
      this.$list.empty();
      this.items = [];
      this.$filter.removeClass('active');
    },

    reset: function () {
      this.$value.val('');
      if (this.xhr) {
        this.xhr.abort();
        this.xhr = null;
      }
      this.mapLayers(this.disableSearchLayer.bind(this));
      this.empty();
      this.close();
      this.update();
    },

    startTimer: function () {
      clearTimeout(this.timer);
      if (this.params.timeout) {
        this.timer = setTimeout(function () {
          if (this.$value.val().length) {
            this.execute(true);
          } else {
            this.reset();
          }
        }.bind(this), this.params.timeout);
      }
    },

    execute: function (stay) {
      clearTimeout(this.timer);
      this.timer = null;
      var navs = this.map.getActiveNavs();
      var codes = navs.map(function (nav) {
        return nav.params.code +'@'+ nav.params.ns;
      });
      this.mapLayers(this.ensureSearchLayer.bind(this));
      var value = this.$value.val().trim().toLowerCase();
      if (!value.length) {
        this.mapLayers(this.disableSearchLayer.bind(this));
        return;
      }
      if (this.xhr) {
        this.xhr.abort();
      }
      this.empty();
      this.show();
      this.$filter.addClass('loading');
      this.xhr = $.get('geomap/api/search', {value: value, codes: codes}).always(function () {
        this.$filter.removeClass('loading');
      }.bind(this)).done(function (data) {
        this.items = data;
        var items = this.createItems(data);
        if (items.length) {
          this.$filter.removeClass('empty');
          this.$list.html(items.join('')).scrollTop(0);
          this.panel || this.close();
          this.$filter.addClass('active');
          this.setBounds(this.items);
          this.mapLayers(this.enableSearchLayer.bind(this));
          this.event.trigger('found');
        }
        if (stay) {
          this.$filter.addClass('opened');
        }
      }.bind(this)).fail(processAjaxError);
      if (!stay) {
        this.$execute.focus();
      }
      this.update();
    },

    ensureSearchLayer: function (layer) {
      if (!(layer instanceof Map.SearchLayer) && !layer.searchLayer) {
        layer.nav.layers.push(new Map.SearchLayer(layer, this));
      }
    },

    enableSearchLayer: function (layer) {
      if (layer instanceof Map.SearchLayer) {
        Map.Layer.prototype.enable.call(layer);
      }
    },

    disableSearchLayer: function (layer) {
      if (layer instanceof Map.SearchLayer) {
        layer.disable();
      }
    },

    mapLayers: function (handler) {
      if (this.params.highlightFoundObjects) {
        var navs = this.map.getActiveNavs();
        for (var i = 0; i < navs.length; ++i) {
          for (var j = 0; j < navs[i].layers.length; ++j) {
            handler(navs[i].layers[j]);
          }
        }
      }
    },

    createItems: function (data) {
      var items = [];
      data = data instanceof Array ? data : [];
      for (var i = 0; i < data.length; ++i) {
        items.push('<div class="map-search-filter-item" data-index="'+ i +'">'+ data[i].label +'</div>');
      }
      return items;
    },

    selectItem: function (item) {
      this.setBounds(item);
      this.panel || this.close();
    },

    setBounds: function (items) {
      items = items instanceof Array ? items : items ? [items] : null;
      if (items && items.length) {
        var collection = new ymaps.GeoObjectCollection;
        Helper.array.each(items, function (item) {
          this.map.addGeoItemToCollection(item, collection);
        }.bind(this));
        this.map.setBoundsByCollection(collection, {maxZoom: 13});
      }
    },

    filter: function (loader, geoObject) {
      if (this.items.length) {
        return this.params.highlightFoundObjects
          ? this.filterLayer(loader, geoObject)
          : this.filterSimple(geoObject);
      }
      return true;
    },

    filterSimple: function (geoObject) {
      for (var i = 0; i < this.items.length; ++i) {
        if (this.items[i].id === geoObject.properties.itemId) {
          return true;
        }
      }
      return false;
    },

    filterLayer: function (loader, geoObject) {
      var isSearchLayer = loader.properties.get('layer') instanceof Map.SearchLayer;
      for (var i = 0; i < this.items.length; ++i) {
        if (this.items[i].id === geoObject.properties.itemId) {
          return isSearchLayer;
        }
      }
      return !isSearchLayer;
    },

    filterHighlight: function (loader, geoObject) {
      var options = loader.options.get('searchOptions') || {'preset': 'islands#redCircleDotIcon'};
      for (var i = 0; i < this.items.length; ++i) {
        if (this.items[i].id === geoObject.properties.itemId) {
          loader.objects.setObjectOptions(geoObject.properties.itemId, options);
          return true;
        }
      }
      return true;
    }
  });
})();
