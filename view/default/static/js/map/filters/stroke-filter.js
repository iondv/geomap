'use strict';

(function () {

  Map.StrokeFilter = function () {
    Map.BaseFilter.apply(this, arguments);
    this.$area = $('#map-stroke');
    this.$canvas = this.$area.find('canvas');
    this.init();
  };

  $.extend(Map.StrokeFilter.prototype, Map.BaseFilter.prototype, {
    constructor: Map.StrokeFilter,

    getDefaultParams: function () {
      return {
        button: {
          caption: 'Обводка',
          hint: 'Обвести регион',
          resetHint: 'Сбросить обводку',
          maxWidth: 100
        },
        path: {
          strokeColor: '#f0000',
          strokeWidth: 6,
          opacity: 0.8
        },
        polygon: {
          fillColor: '#00f0ff',
          fillOpacity: 0.1,
          strokeColor: '#0000ff',
          strokeOpacity: 0.9,
          strokeWidth: 3
        }
      };
    },

    init: function () {
      this.createToggle();
      this.$canvas.attr('width', this.$area.width());
      this.$canvas.attr('height', this.$area.height());
      paper.setup(this.$canvas.get(0));
      var tool = new paper.Tool();
      tool.onMouseDown = function (event) {
        this.path ? this.stopDraw(event) : this.startDraw(event);
      }.bind(this);
      tool.onMouseDrag = this.draw.bind(this);
      $(window).mouseup(this.stopDraw.bind(this));
    },

    createToggle: function () {
      this.panel ? this.createPanelToggle() : this.createYmapToggle();
    },

    createPanelToggle: function () {
      var section = new Map.Panel.Section(this.panel);
      var result = section.createButtonHtml({
        cssClass: 'panel-btn stroke-toggle',
        caption: this.params.button.caption,
        hint: this.params.button.hint
      });
      result += section.createResetButtonHtml({
        cssClass: 'stroke-reset',
        hint: this.params.button.resetHint
      });
      result = section.createResetGroupHtml({
        content: result
      });
      result = section.createHtml({
        cssClass: 'stroke-panel-section',
        content: result,
        orderNumber: this.params.panel.orderNumber
      });
      this.panel.insertByOrder(result);
      this.toggleBtn = this.panel.find('.stroke-toggle');
      this.resetBtn = this.panel.find('.stroke-reset');
      this.toggleBtn.click(function () {
        this.setToggleSelected() ? this.enable() : this.disable();
      }.bind(this));
      this.resetBtn.click(this.reset.bind(this));
      this.panelSection = section;
    },

    createYmapToggle: function () {
      this.toggleBtn = new ymaps.control.Button({
        data: {
          content: this.params.button.caption,
          title: this.params.button.hint
        },
        options: {
          maxWidth: this.params.button.maxWidth
        }
      });
      this.toggleBtn.events.add('select', this.enable, this);
      this.toggleBtn.events.add('deselect', this.disable, this);
      this.resetBtn = Map.BaseFilter.createYmapResetBtn(this.params.button.resetHint);
      this.resetBtn.events.add('click', this.reset, this);
      this.ymap.controls.add(this.toggleBtn, { position: {left:640, top:10}});
      this.ymap.controls.add(this.resetBtn, { position: {left:722, top:10}});
    },

    enable: function () {
      this.setToggleSelected(true);
      if (this.polygon) {
        this.active = true;
        this.ymap.geoObjects.add(this.polygon);
        this.ymap.setBounds(this.polygon.geometry.getBounds()).then(this.update.bind(this));
      } else {
        this.$area.show();
      }
    },

    disable: function () {
      this.setToggleSelected(false);
      if (this.active) {
        this.active = false;
        this.polygon && this.polygon.setParent(null);
        this.update();
      }
    },

    reset: function () {
      this.disable();
      this.polygon = null;
    },

    filter: function (loader, geoObject) {
      if (this.active && this.polygon) {
        return this.polygon.geometry.contains(geoObject.geometry.coordinates);
      }
      return true;
    },

    // DRAW

    startDraw: function (event) {
      $(document.body).addClass('unselectable');
      this.path = new paper.Path($.extend({}, this.params.path, {
        strokeCap: 'round'
      }));
      this.path.add(event.point);
    },

    draw: function (event) {
      if (this.path && this.isDistancePoint(event.point)) {
        var cross = this.getCrossLocation(event.point);
        if (cross) {
          var path = this.path.splitAt(cross);
          this.path.remove();
          this.path = path;
          this.stopDraw();
        } else {
          this.path.add(event.point);
        }
      }
    },

    stopDraw: function () {
      $(document.body).removeClass('unselectable');
      if (this.path) {
        //this.path.closed = true;
        //console.log(this.path.segments.length);
        //this.path.simplify();
        //console.log(this.path.segments.length);
        this.createPolygon();
        this.path.remove();
        this.path = null;
        this.$area.hide();
        this.polygon ? this.enable() : this.disable();
      }
    },

    isDistancePoint: function (point) {
      var last = this.path.lastSegment.point;
      return Math.abs(point.x - last.x) > 8 || Math.abs(point.y - last.y) > 8;
    },

    getCrossLocation: function (point) {
      if (this.path.segments.length > 2) {
        this.path.add(point);
        var locations = this.path.getCrossings();
        if (locations && locations.length) {
          this.path.removeSegments(this.path.segments.length - 1);
          return locations[0];
        }
      }
      return null;
    },

    createPolygon: function () {
      this.polygon = null;
      if (this.path && this.path.segments.length > 2) {
        var offset = this.$area.offset();
        var projection = this.ymap.options.get('projection');
        var points = [];
        for (var i = 0; i < this.path.segments.length; ++i) {
          var point = [
            this.path.segments[i].point.x + offset.left,
            this.path.segments[i].point.y + offset.top
          ];
          point = projection.fromGlobalPixels(this.ymap.converter.pageToGlobal(point), this.ymap.getZoom());
          points.push(point);
        }
        this.polygon = new ymaps.Polygon([points], {}, $.extend({}, this.params.polygon, {
          interactivityModel: 'default#transparent'
        }));
        console.log('StrokeFilter: Num points:', points.length);
      }
    }
  });
})();
