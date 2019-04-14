'use strict';

(function () {

  Map.Panel.Float = function (map, params) {
    Map.Panel.apply(this, arguments);
    this.init();
  };

  $.extend(Map.Panel.Float.prototype, Map.Panel.prototype, {
    constructor: Map.Panel.Float,

    getDefaultParams: function () {
      return {
        cssClass: '',
        cssStyle: 'left:0;top:0',
        title: ''
      };
    },

    init: function () {
      this.create();
    },

    create: function () {
      var title = this.params.title ? '<div class="map-float-title">'+ this.params.title +'</div>' : '';
      var html = '<div class="map-float '
        + this.params.cssClass +'" style="'
        + this.params.cssStyle +'"><div class="map-float-head">'+ title
        + '<div class="map-float-toggle"></div></div><div class="map-float-body"></div></div>';

      this.map.$floatContainer.append(html);
      this.$panel = this.map.$floatContainer.children().eq(-1);
      this.$content = this.$panel.find('.map-float-body');
      this.$panel.find('.map-float-toggle').click(function () {
        this.$panel.toggleClass('open');
      }.bind(this));
    },

    append: function (data, hasContent) {
      this.$content.append(data);
      if (hasContent === undefined || hasContent) {
        this.$panel.addClass('has-content');
      }
    },
  });
})();
