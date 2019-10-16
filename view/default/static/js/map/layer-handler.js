'use strict';

(function () {

  Map.Layer.assignParamHandlers = function (params, options) {
    params = $.extend({
      // default params
    }, params);
    for (var id in params) {
      if (params.hasOwnProperty(id) && id in HANDLERS) {
        HANDLERS[id](params[id], options, params);
      }
    }
  };

  var HANDLERS = {
    balloonContentLayoutClass: function (params, options) {
      var xhr = null;
      options.geoObjectBalloonContentLayout = ymaps.templateLayoutFactory.createClass(params, {
        build: function () {
          options.geoObjectBalloonContentLayout.superclass.build.call(this);
          buildAjaxLayout.call(this, xhr);
        },
        clear: function () {
          options.geoObjectBalloonContentLayout.superclass.clear.call(this);
          clearAjaxLayout(xhr);
          xhr = null;
        }
      });
    },
    clusterBalloonItemContentLayout: function (params, options) {
      var xhr = null;
      options.clusterBalloonItemContentLayout = ymaps.templateLayoutFactory.createClass(params, {
        build: function () {
          options.clusterBalloonItemContentLayout.superclass.build.call(this);
          buildAjaxLayout.call(this, xhr);
        },
        clear: function () {
          options.clusterBalloonItemContentLayout.superclass.clear.call(this);
          clearAjaxLayout(xhr);
          xhr = null;
        }
      });
    },
    clusterBalloonContentLayout: function (params, options) {
      var xhr = null;
      options.clusterBalloonContentLayout = ymaps.templateLayoutFactory.createClass(params, {
        build: function () {
          options.clusterBalloonContentLayout.superclass.build.call(this);
          buildAjaxLayout.call(this, xhr);
        },
        clear: function () {
          options.clusterBalloonContentLayout.superclass.clear.call(this);
          clearAjaxLayout(xhr);
          xhr = null;
        }
      });
    }
  };

  function buildAjaxLayout (xhr) {
    var $parent = $(this.getParentElement());
    var $content = $parent.find('.map-ajax-balloon');
    var url = $content.data('url');
    if (url) {
      if ($content.data('ids')) {
        xhr = $.post(url, {ids: $content.data('ids').split(',')});
      } else {
        xhr = $.get(url)
      }
      xhr.done(function (data) {
        $content.addClass('loaded').html(data);
        this.events.fire('change');
      }.bind(this)).always(function () {
        xhr = null;
      }.bind(this)).fail(function (xhr) {
        $content.addClass('loaded has-error').html(xhr.responseText || 'Ошибка');
        this.events.fire('change');
      }.bind(this)).fail(processAjaxError);
    }
  }

  function clearAjaxLayout (xhr) {
    if (xhr) {
      xhr.abort();
    }
  }

})();

(function () {

  Map.Layer.assignHandlers = function (objectLoader, data) {
    var handlers = $.extend({
      // defaults
    }, data.handlers);
    for (var id in handlers) {
      if (handlers.hasOwnProperty(id) && id in HANDLERS) {
        HANDLERS[id](objectLoader, handlers[id], data);
      }
    }
  };

  var HANDLERS = {
    showBalloonOnHover: function (objectLoader, params) {
      if (params) {
        var delay = params.delay || 300;
        var balloon = objectLoader.objects.balloon;
        var timer = null;
        objectLoader.objects.events.add('mouseenter', function (e) {
          clearTimeout(timer);
          timer = setTimeout(function () {
            balloon.open(e.get('objectId'));
          }, delay);
        });
        objectLoader.objects.events.add('mouseleave', function (e) {
          clearTimeout(timer);
        });
        balloon.events.add('mouseenter', function (e) {
          clearTimeout(timer);
        });
        balloon.events.add('mouseleave', function (e) {
          timer = setTimeout(function () {
            balloon.close();
          }, delay);
        });
      }
    }
  };
})();
