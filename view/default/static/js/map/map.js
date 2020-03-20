'use strict';

(function () {

  window.Map = function (ymaps) {
    this.ymaps = ymaps;
    this.$map = $('#ymap');
    this.$map.data('map', this);
    this.params = this.$map.data('params');
    this.$zone = this.$map.closest('.map-zone');
    this.zoneParams = this.$zone.data('params');
    this.$sideBarNav = $('#sideBarNav');
    this.$imodal = $('#imodal-frame');
    this.$floatContainer = this.$zone.find('.map-float-container');
    this.$loader = this.$zone.find('.map-loader');
    this.navs = {};
    this.loadingCount = -1;
    this.filters = {};
    this.panels = {};
    this.navSections = [];
    this.params.ymapControls = this.params.ymapControls || {};
    this.init();
  };

  Map.prototype = {
    constructor: Map,

    init: function () {
      $(document.body).on('click', '.menu-link-data', this.clickNav.bind(this));
      this.$map.on('click', '.map-modal-link', this.clickModalLink.bind(this));

      ymaps.modules.require(['CustomLoadingObjectManager'], function (CustomLoadingObjectManager) {
        this.CustomLoadingObjectManager = CustomLoadingObjectManager;
        this.ymap = new ymaps.Map(this.$map.get(0), {
          center: this.params.start,
          zoom: this.params.zoom,
          controls: []
        }, {
          suppressMapOpenBlock: true
        });
        this.addYmapControls(this.params.ymapControls);
        this.panels = Map.Panel.create(this, this.params.panels);
        if (this.params.search) {
          this.filters.search = new Map.SearchFilter(this, this.params.search);
        }
        if (this.params.regions) {
          this.filters.region = new Map.RegionFilter(this, this.params.regions);
        }
        if (this.params.stroke) {
          this.filters.stroke = new Map.StrokeFilter(this, this.params.stroke);
        }
        if (this.params.formFilter) {
          this.filterForm = new Map.FilterForm(this, $('#map-filter-form'), this.params.formFilter);
        }
        if (this.params.legend) {
          this.legend = new Map.Legend(this, this.params.legend);
        }
        this.navSections = Map.NavSection.create(this);
        this.initDefaultNav();
      }.bind(this));

      var toggleTimer = null;
      $(window).resize(function (event, data) {
        var $side = $('#imodal-side');
        var active = $side.hasClass('active');
        var width = 0;
        if (active) {
          width = this.$zone.width() - $side.width();
          if (width < 200) {
            width = this.$zone.width();
          }
        }
        this.$map.css('width', active ? (width +'px') : '100%');
        clearTimeout(toggleTimer);
        toggleTimer = setTimeout(function () {
          this.ymap.container.fitToViewport();
        }.bind(this), active ? 350 : 10);
      }.bind(this));

      this.checkActiveLayerAccess();
    },

    addYmapControls: function (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key) && ymaps.control.storage.get(key) && params[key]) {
          this.ymap.controls.add(key, params[key]);
        }
      }
      if (params.loader) {
        if (params.loader.position) {
          this.$loader.css(params.loader.position);
        }
        if (params.loader.cssStyle) {
          this.$loader.css(params.loader.cssStyle);
        }
        if (params.loader.cssClass) {
          this.$loader.addClass(params.loader.cssClass);
        }
      } else {
        this.$loader.remove();
      }
    },

    addGeoItemToCollection: function (item, collection) {
      if (item.geometry.type === 'FeatureCollection') {
        for (var i = 0; i < item.geometry.features.length; ++i) {
          this.addGeoItemToCollection(item.geometry.features[i], collection);
        }
      } else {
        collection.add(new ymaps.GeoObject(item));
      }
    },

    setBoundsByCollection: function (collection, params) {
      params = params || {};
      this.ymap.geoObjects.add(collection);
      this.ymap.setBounds(collection.getBounds(), {
        checkZoomRange: true,
        duration: params.duration || 100
      }).then(function () {
        var zoom = this.ymap.getZoom();
        zoom = params.maxZoom && zoom > params.maxZoom ? params.maxZoom : zoom;
        this.ymap.setZoom(zoom);
      }.bind(this));
      collection.setParent(null);
    },

    // LOADING MARKER

    updateLoading: function () {
      var loading = false;
      for (var id in this.navs) {
        if (this.navs.hasOwnProperty(id) && this.navs[id].isLoading()) {
          return this.toggleLoading(true);
        }
      }
      this.toggleLoading(false);
    },

    toggleLoading: function (state) {
      this.$zone.toggleClass('loading', state);
    },

    // FILTER

    filter: function (loader, geoObject) {
      for (var id in this.filters) {
        if (this.filters.hasOwnProperty(id) && !this.filters[id].filter(loader, geoObject)) {
          return false;
        }
      }
      return true;
    },

    execFilter: function () {
      Helper.object.each(this.navs, 'execFilter');
    },

    // NAV

    initDefaultNav: function () {
      var id = this.$sideBarNav.data('default');
      id = id ? 'n_' + id.replace(/\./g, '_') : null;
      var nav = document.getElementById(id);
      if (nav) {
        $(nav).click().parents('.treeview').addClass('menu-open');
      } else {
        this.$sideBarNav.find('.treeview').eq(0).find('>a .toggler').click();
      } //*/
      Helper.array.each(this.navSections, 'initDefault');
      Helper.array.each(this.navSections, 'openFirstMenu');
    },

    getActiveNavs: function () {
      var navs = [];
      Helper.object.each(this.navs, function (nav) {
        if (nav.active) {
          navs.push(nav);
        }
      });
      return navs;
    },

    clickNav: function (event) {
      var $a = $(event.target).closest('a');
      var url = $a.attr('href');
      if (url) {
        if (this.filters.search) {
          this.filters.search.reset();
        }
        if (event.ctrlKey) {
          $a.toggleClass('active');
        } else {
          $a.closest('.nav-list').find('.active').removeClass('active').each(function (index, elem) {
            var nav = this.navs[$(elem).attr('href')];
            nav && nav.disable();
          }.bind(this));
          $a.addClass('active');
        }
        if ($a.hasClass('active')) {
          if (this.navs[url]) {
            this.navs[url].enable();
          } else {
            this.navs[url] = new Map.Nav(this, url, $a.data('params'));
          }
        } else if (this.navs[url]) {
            this.navs[url].disable();
        }
        imodal.toggleSide(false);
        this.renderHeader();
        this.legend && this.legend.render();
      }
    },

    hideNavs: function () {
      for (var id in this.navs) {
        if (this.navs.hasOwnProperty(id)) {
          this.navs[id].disable();
        }
      }
    },

    renderHeader: function () {
      var title = [];
      for (var id in this.navs) {
        if (this.navs.hasOwnProperty(id) && this.navs[id].active) {
          title.push(this.navs[id].params.title || '-');
        }
      }
      $('#page-header').find('h1').html(title.length ? title.join(', ') : 'Гео-карта');
    },

    // MODAL LINK

    clickModalLink: function (event) {
      event.preventDefault();
      var $link = $(event.target);
      var type = $link.data('type') || 'url';
      if (type in this.modalLinkHandlers) {
        this.modalLinkHandlers[type].call(this, $link);
      }
      if ($link.data('close-balloon') === true) {
        this.ymap.balloon.close();
      }
    },

    modalLinkHandlers: {
      url: function ($link) {
        if (this.panels.rightInfo) {
          this.panels.rightInfo.load($link.get(0), $link.data('url') || $link.attr('href'));
        }
      }
    },

    checkActiveLayerAccess: function () {
      setTimeout(function () {
        var nav = this.getActiveNavs()[0];
        if (!nav || !nav.layers.length) {
          return this.checkActiveLayerAccess();
        }
        $.get(nav.url)
          .done(this.checkActiveLayerAccess.bind(this))
          .fail(processAjaxError);
      }.bind(this), 5000);
    }
  };
})();
