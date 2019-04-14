'use strict';

(function () {

  Map.Panel.RightInfo = function (map) {
    Map.Panel.call(this, map);
    this.init();
  };

  $.extend(Map.Panel.RightInfo.prototype, Map.Panel.prototype, {
    constructor: Map.Panel.RightInfo,

    init: function () {
      $('#imodal-side').show();
    },

    hide: function (owner) {
      if (this.owner === owner) {
        imodal.forceClose();
      }
    },

    show: function () {
    },

    load: function (owner, url, data, cb) {
      this.owner = owner;
      setTimeout(function () {
        imodal.off('beforeClose');
        imodal.load(url, data, cb);
      }, 0);
    }
  });
})();
