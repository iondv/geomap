'use strict';

(function () {

  Map.BaseFilter = function (map, params) {
    this.map = map;
    this.params = $.extend(true, this.getDefaultParams(), params);
    this.panel = this.params.panel ? map.panels[this.params.panel.name] : null;
    this.ymap = map.ymap;
    this.active = false;
    this.event = new Helper.Event(this, map);
    Map.EventHandler.init(this.event, this.params.events);
  };

  Map.BaseFilter.createYmapResetBtn = function (title) {
    return new ymaps.control.Button({
      data: {
        title: title,
        image: 'img/close.png'
      },
      options: {
        selectOnClick: false
      }
    });
  };

  Map.BaseFilter.prototype = {
    constructor: Map.BaseFilter,

    getDefaultParams: function () {
      return {
        panel: {}
      };
    },

    setToggleSelected: function (state) {
      if (this.panel) {
        this.toggleBtn.toggleClass('selected', state);
        return this.toggleBtn.hasClass('selected');
      }
      this.toggleBtn.state.set('selected', state);
    },

    filter: function (loader, geoObject) {
      // this.active
      return true;
    },

    update: function () {
      this.map.execFilter();
    },

    destroy: function () {
    }
  };
})();
