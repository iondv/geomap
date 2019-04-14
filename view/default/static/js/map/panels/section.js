'use strict';

(function () {

  Map.Panel.Section = function (panel, params) {
    this.panel = panel;
    this.params = params || {};
    this.init();
  };

  Map.Panel.Section.prototype = {
    constructor: Map.Panel.Section,

    init: function () {
      if (this.panel) {
        this.panel.append(this.$content);
      }
    },

    createHtml: function (data) {
      return '<div class="map-panel-section '+ data.cssClass +'"'
        + (data.orderNumber === undefined ? '' : ' data-order-number="'+ data.orderNumber +'"')
        +'><div class="map-panel-section-head">'+ (data.title || '')
        +'</div><div class="map-panel-section-body">'
        + (data.content || '') +'</div></div>';
    },

    createResetGroupHtml: function (data) {
      return '<div class="map-panel-reset-group">'+ data.content +'</div>';
    },

    createButtonHtml: function (data) {
      return '<button type="button" title="'
        + data.hint +'" class="btn '
        + data.cssClass +'">'
        + data.caption +'</button>';
    },

    createResetButtonHtml: function (data) {
      return '<button type="button" title="'
        + data.hint +'" class="btn panel-btn panel-btn-reset '
        + data.cssClass +'"><i class="panel-btn-icon panel-btn-icon-reset"></i></button>';
    }
  };
})();
