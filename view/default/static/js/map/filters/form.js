'use strict';

(function () {

  Map.FilterForm = function (map, $modal, params) {
    Map.BaseFilter.call(this, map, params);
    this.$modal = $modal;
    this.$body = $modal.find('.modal-body').empty();
    this.$footer = $modal.find('.modal-footer');
    this.$apply = this.$footer.find('.apply');
    this.filters = [];
    this.init();
  };

  $.extend(Map.FilterForm.prototype, Map.BaseFilter.prototype, {
    constructor: Map.FilterForm,

    getDefaultParams: function () {
      return {
        button: {
          caption: 'Фильтр',
          hint: 'Выбрать фильтр',
          resetHint: 'Сбросить фильтр',
          maxWidth: 100
        }
      };
    },

    init: function () {
      this.createToggle();
      this.$modal.on('hide.bs.modal', function () {
      }.bind(this));
      this.$body.on('click', '.modal-form-group-head', function () {
        $(this).closest('.modal-form-group').toggleClass('active');
      });
      this.$apply.click(function () {
        if (this.applyChanges()) {
          this.map.execFilter();
        }
        this.updateToggle();
        this.$modal.modal('hide');
      }.bind(this));
    },

    createToggle: function () {
      this.panel ? this.createPanelToggle() : this.createYmapToggle();
      this.enableToggle(false);
    },

    createPanelToggle: function () {
      var section = new Map.Panel.Section(this.panel);
      var result = section.createButtonHtml({
        cssClass: 'panel-btn form-toggle',
        caption: this.params.button.caption,
        hint: this.params.button.hint
      });
      result += section.createResetButtonHtml({
        cssClass: 'form-reset',
        hint: this.params.button.resetHint
      });
      result = section.createResetGroupHtml({
        content: result
      });
      result = section.createHtml({
        cssClass: 'form-panel-section',
        content: result,
        orderNumber: this.params.panel.orderNumber
      });
      this.panel.insertByOrder(result);
      this.toggleBtn = this.panel.find('.form-toggle');
      this.resetBtn = this.panel.find('.form-reset');
      this.toggleBtn.click(this.show.bind(this));
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
          selectOnClick: false,
          maxWidth: this.params.button.maxWidth
        }
      });
      this.resetBtn = Map.BaseFilter.createYmapResetBtn(this.params.button.resetHint);
      this.toggleBtn.events.add('click', function () {
        this.toggleBtn.state.get('enabled') && this.show();
      }.bind(this));
      this.resetBtn.events.add('click', function () {
        this.resetBtn.state.get('enabled') && this.reset();
      }.bind(this));
      this.map.ymap.controls.add(this.toggleBtn, { position: { left: 140, top: 10}});
      this.map.ymap.controls.add(this.resetBtn, { position: { left: 214, top: 10}});
    },

    updateToggle: function () {
      this.panel
        ? this.toggleBtn.toggleClass('selected', this.isActive())
        : this.toggleBtn.state.set('selected', this.isActive());
    },

    show: function () {
      this.openActiveGroups();
      this.$modal.modal();
    },

    openActiveGroups: function () {
      var $groups = this.$body.find('.modal-form-group');
      if (!$groups.filter('.active').length) {
        $groups.eq(0).addClass('active');
      }
    },

    reset: function () {
      if (this.isActive()) {
        this.$body.empty();
        for (var i = 0; i < this.filters.length; ++i) {
          var filter = this.filters[i];
          filter.reset();
          this.appendHtml(this.buildFilter(filter), filter);
          this.updateToggle();
        }
        this.map.execFilter();
      }
    },

    enableToggle: function (state) {
        if (this.panel) {
          if (state) {
            this.toggleBtn.removeAttr('disabled');
            this.resetBtn.removeAttr('disabled');
          } else {
            this.toggleBtn.attr('disabled', true);
            this.resetBtn.attr('disabled', true);
          }
        } else {
            this.toggleBtn.state.set('enabled', state);
            this.resetBtn.state.set('enabled', state);
        }
    },

    isActive: function () {
      for (var i = 0; i < this.filters.length; ++i) {
        if (this.filters[i].active) {
          return true;
        }
      }
      return false;
    },

    hasFilter: function (filter) {
      return this.filters.indexOf(filter) > -1;
    },

    attach: function (filter) {
      if (!this.hasFilter(filter)) {
        this.filters.push(filter);
        this.appendHtml(this.buildFilter(filter), filter);
      }
      this.enableToggle(true);
    },

    detach: function (filter) {
      var index = this.filters.indexOf(filter);
      if (index > -1) {
        this.$body.find('#'+ filter.uid).remove();
        this.filters.splice(index, 1);
        this.updateToggle();
        this.enableToggle(this.filters.length > 0);
      }
    },

    appendHtml: function (html, filter) {
      this.$body.append(html);
      this.$body.find('#'+ filter.uid).find('.form-select2').select2({
        width: '100%',
        language: 'ru'
      });
    },

    //

    applyChanges: function () {
      var self = this;
      var changed = false;
      for (var i = 0; i < this.filters.length; ++i) {
        var filter = this.filters[i];
        filter.active = false;
        this.$body.find('#'+filter.uid).find('.field-value').each(function () {
          var $elem = $(this);
          var field = filter.getFieldByUid($elem.data('uid'));
          var value = field.getInputValue($elem);
          if (value instanceof Array && field.value instanceof Array) {
            if (!Helper.array.isEqual(value, field.value)) {
              changed = true;
            }
          } else if (field.value !== value) {
            changed = true;
          }
          if (value !== null) {
            filter.active = true;
          }
          field.value = value;
        });
      }
      return changed;
    },

    buildFilter: function (filter) {
      var result = '<div class="modal-form-filter" id="'+ filter.uid +'">';
      for (var i = 0; i < filter.groups.length; ++i) {
        result += filter.groups[i].build();
      }
      return result +'</div>';
    }
  });
})();
