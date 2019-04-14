'use strict';

(function () {

  Map.Panel = function (map, params) {
    this.map = map;
    this.owner = null;
    this.params = $.extend(true, this.getDefaultParams(), params);
  };

  Map.Panel.create = function (map, params) {
    params = params || {};
    var result = {};
    for (var id in params) {
      if (params.hasOwnProperty(id)) {
        var Constructor = null;
        switch (params[id].type) {
          case 'float': Constructor = Map.Panel.Float; break;
          case 'rightInfo': Constructor = Map.Panel.RightInfo; break;
        }
        if (Constructor) {
          result[id] = new Constructor(map, params[id]);
        }
      }
    }
    return result;
  };

  Map.Panel.prototype = {
    constructor: Map.Panel,

    init: function () {
    },

    getDefaultParams: function () {
      return {};
    },

    empty: function () {
      this.$content.empty();
    },

    find: function (data) {
      return this.$content.find(data);
    },

    append: function (data) {
      this.$content.append(data);
    },

    prepend: function (data) {
      this.$content.prepend(data);
    },

    insertByOrder: function (data) {
      var inserted = false;
      var targetNumber = $(data).data('orderNumber');
      if (targetNumber !== undefined) {
          this.$content.children().each(function (index, elem) {
            var orderNumber = $(elem).data('orderNumber');
            if (!inserted && (orderNumber === undefined || parseInt(orderNumber) > parseInt(targetNumber))) {
              $(elem).before(data);
              inserted = true;
            }
          }.bind(this));
      }
      if (!inserted) {
        this.append(data);
      }
    }

  };
})();
