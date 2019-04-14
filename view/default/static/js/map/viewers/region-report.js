'use strict';

(function () {

  Map.Viewer.RegionReport = function () {
    Map.Viewer.apply(this, arguments);
    this.map = this.nav.map;
    this.filter = this.map.filters.region;
    this.excludes = this.params.excludes instanceof Array
      ? this.params.excludes : (this.params.excludes || []);
    this.init();
  };

  $.extend(Map.Viewer.RegionReport.prototype, Map.Viewer.prototype, {
    constructor: Map.Viewer.RegionReport,

    init: function () {
      if (this.filter) {
        this.filter.event.on('enable', this.show.bind(this));
        this.filter.event.on('active', this.show.bind(this));
      }
    },

    show: function () {
      if (this.panel && this.filter && this.filter.activeRegion) {
        var oktmo = this.filter.activeRegion.oktmo;
        var data = {};
        if (oktmo !== this.params.defaultOktmo) {
          data.oktmo = oktmo;
        }
        if (this.excludes.indexOf(oktmo) < 0) {
          var url = this.params.url.replace('{oktmo}', oktmo);
          this.panel.load(this.nav, url, data);
        } else {
          this.hide();
        }
      }
    }

  });
})();
