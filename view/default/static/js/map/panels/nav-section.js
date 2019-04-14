'use strict';

(function () {

  Map.NavSection = function ($content, map) {
    this.map = map;
    this.$content = $content;
    this.params = $content.data('params') || {};
    this.panel = this.map.panels[this.params.panel];
    this.init();
  };

  Map.NavSection.create = function (map) {
    var sections = [];
    $('#nav-sections').children('.nav-section').each(function () {
      sections.push(new Map.NavSection($(this), map));
    });
    return sections;
  };

  Map.NavSection.prototype = {
    constructor: Map.NavSection,

    init: function () {
      if (this.panel) {
        this.panel.append(this.$content, this.$content.find('a').length > 0);
      }
    },

    initDefault: function () {
      var id = this.params.defaultNav;
      id = id ? 'n_' + id.replace(/\./g, '_') : null;
      var $a = this.$content.find('a').filter('[data-id="'+ id +'"]');
      if ($a.length) {
        $a.each(function () {
          $(this).click().parents('.treeview').addClass('open');
        });
      }
    },

    openFirstMenu: function () {
      if (this.panel && this.panel.$content.find('.open').length === 0 && this.isFirst()) {
        this.$content.children('.treeview').eq(0).addClass('open');
      }
    },

    isFirst: function () {
      return this.panel.$content.find('.nav-section').eq(0).get(0) === this.$content.get(0);
    }
  };
})();
