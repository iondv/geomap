'use strict';

(function () {

  Map.SearchLayer = function (layer, filter) {
    Map.Layer.call(this, layer.nav, layer.data);
    this.searchFilter = filter;
    this.data = this.getSearchData();
    layer.searchLayer = this;
  };

  $.extend(Map.SearchLayer.prototype, Map.Layer.prototype, {
    constructor: Map.SearchLayer,

    enable: function () {
    },

    getSearchData: function () {
      var result = $.extend(true, {}, this.data);
      var filterData = this.searchFilter.params.layer;
      for (var i = 0; i < result.data.length; ++i) {
        if (filterData) {
          $.extend(result.data[i].options, filterData.options);
        }
        if (result.data[i].search) {
          $.extend(result.data[i].options, result.data[i].search.options);
        }
      }
      return result;
    },

  });
})();
