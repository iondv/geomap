'use strict';

$(function () {
  window.sidebarSplitter && sidebarSplitter.initMobile();
});

// HELPER

window.Helper = {

  common: {
    getRandom: function (min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    getUid: function () {
      return Helper.common.getRandom(1, 9999999).toString() + (new Date).getTime();
    },
  },

  array: {
    each: function (items, method) {
      for (var i = 0; i < items.length; ++i) {
        if (typeof method === 'function') {
          method(items[i], i, Array.prototype.slice.call(arguments, 2));
        } else {
          items[i][method].apply(items[i], Array.prototype.slice.call(arguments, 2));
        }
      }
    },
    isEqual: function (a1, a2) {
      if (a1.length !== a2.length) {
        return false;
      }
      for (var i = 0; i < a1.length; ++i) {
        if (a2.indexOf(a1[i]) < 0) {
          return false;
        }
      }
      return true;
    }
  },

  object: {
    getValues: function (obj) {
      var values = [];
      for (var id in obj) {
        if (obj.hasOwnProperty(id)) {
          values.push(obj[id]);
        }
      }
      return values;
    },
    getKeyByValue: function (obj, value) {
      for (var id in obj) {
        if (obj.hasOwnProperty(id) && obj[id] === value) {
          return id;
        }
      }
      return null;
    },
    each: function (obj, method) {
      Helper.array.each(Helper.object.getValues(obj), method);
    }
  }
};

// IMODAL

(function () {
  var EVENT_PREFIX = 'imodal:';
  var $overlay = $('#global-overlay');
  var $frame = $('#imodal-frame');
  var $side = $frame.parent();
  var $sideToggle = $side.find('.imodal-side-toggle');
  var $imodal = $('#imodal');
  var params = {};
  var imodalWindow = null;
  var toggleTimer = null;

  $sideToggle.click(function () {
    toggleSide();
  });

  $imodal.find('.imodal-close').click(function () {
    parent.imodal.close();
  });

  function setHistory () {
    imodalWindow.history.pushState(null, imodalWindow.document.title, imodalWindow.location.href + '#imodal');
    $(imodalWindow).off('popstate').on('popstate', function (event) {
      imodal.forceClose();
    });
  }

  function toggleSide (state) {
    $side.toggleClass('active', state);
    $(window).resize();
  }

  window.imodal = {

    toggleSide: toggleSide,

    getParams: function (key) {
      return key ? params[key] : params;
    },

    setParams: function (key, value) {
      params[key] = value;
    },

    getWindow: function () {
      return imodalWindow;
    },

    getFrame: function () {
      return $frame.get(0);
    },

    getDocument: function () {
      return $frame.get(0).contentDocument || $frame.get(0).contentWindow.document;
    },

    getEventId: function (name) {
      return EVENT_PREFIX + name;
    },

    init: function (params) {
      imodal.trigger('init', params);
    },

    load: function (url, data, cb) {
      cb = typeof data === 'function' ? data : cb;
      url = imodal.getDataUrl(data, url);
      toggleSide(true);
      $frame.removeClass('loaded').addClass('active');
      setTimeout(function () {
        $frame.detach().attr('src', url);
        $side.append($frame);
        $frame.off('load').load(function () {
          imodalWindow = $frame.addClass('loaded').get(0).contentWindow;
          setHistory();
          if (typeof cb === 'function') {
            cb(imodalWindow);
          }
        });
      }, 500);
    },

    close: function () {
      var event = imodal.createEvent('beforeClose');
      $frame.trigger(event);
      if (event.isPropagationStopped()) {
        return false;
      } else {
        imodalWindow.history.back();
        imodal.forceClose();
        return true;
      }
    },

    forceClose: function () {
      if (imodalWindow) {
        setTimeout(function () {
          $frame.trigger(imodal.getEventId('close'));
          $frame.off('load').removeClass('active loaded').detach().attr('src', $frame.data('blank'));
          toggleSide(false);
          $side.append($frame);
          imodalWindow = null;
          params = {};
        }, 0);
      } else {
        toggleSide(false);
      }
    },

    createEvent: function (name) {
      return $.Event(imodal.getEventId(name));
    },

    on: function (name, handler) {
      $frame.on(imodal.getEventId(name), handler);
    },

    off: function (name, handler) {
      $frame.off(imodal.getEventId(name), handler);
    },

    trigger: function (name, params) {
      $frame.trigger(imodal.getEventId(name), params);
    },

    triggerParent: function (name, params) {
      if (window.parent && window.parent.imodal) {
        window.parent.imodal.trigger(name, params);
      }
    },

    getDataUrl: function (data, url) {
      data = typeof data !== 'object' ? {} : data;
      data = $.param(data);
      return data ? (url + (url.indexOf('?') > 0 ? '&' : '?') + data) : url;
    }
  };
})();

// ASIDE NAV

(function () {
  $(document.body).on('click', '.menu-link-data', function (event) {
    event.preventDefault();

  });
  $('.map-float-container').on('click', '.menu-item-toggle', function (event) {
    event.preventDefault();
    event.stopPropagation();
    toggleTreeview($(this).closest('.treeview'));
  }).on('click', '.menu-link-data', function (event) {
    var $item = $(this);
    var $container = $item.closest('.map-float-container');
    $container.find('.open').each(function () {
      var $treeview = $(this);
      if (!$treeview.find($item).length && !event.ctrlKey) {
        $treeview.removeClass('open');
        $treeview.children('.treeview-menu').hide();
      }
    });
  }).on('click', '.treeview > a', function (event) {
    var $item = $(this).parent();
    if ($item.hasClass('treeview') && !$item.hasClass('open')) {
      toggleTreeview($item);
    }
  });

  function toggleTreeview ($item) {
    $item.toggleClass('open');
    $item.children('.treeview-menu').toggle(!$item.hasClass('open')).slideToggle('fast');
  }
})();

// EVENTS

(function () {

  Helper.Event = function (target, map, params) {
    this.target = target;
    this.map = map;
    this.params = params || {};
    this.init();
  };

  Helper.Event.prototype = {
    constructor: Helper.Event,

    init: function () {
      if (!this.target.eventPool) {
        this.events = this.target.eventPool = {};
      }
    },

    on: function (name, handler, data) {
      if (!this.events[name]) {
        this.events[name] = [];
      }
      this.events[name].push({
        handler: handler,
        data: data
      });
    },

    off: function (name, handler, data) {
      if (this.events[name] instanceof Array) {
        if (!handler && !data) {
          this.events[name] = [];
        } else {
          for (var i = 0; i < this.events[name].length; ++i) {
            var item = this.events[name][i];
            if ((!handler || item.handler === handler) && (!data || item.data === data)) {
              this.events[name].splice(i, 1);
            }
          }
        }
      }
    },

    trigger: function (name) {
      var events = this.events[name];
      if (events instanceof Array) {
        for (var i = 0; i < events.length; ++i) {
          events[i].handler(this, events[i].data);
        }
      }
    }
  };
})();

function processAjaxError (xhr) {
  var $loader = $('#global-loader');
  var frame = imodal.getFrame();
  if (xhr.status === 401) {
    imodal.load('/auth', function (event) {
      var doc = imodal.getDocument();
      if (doc.getElementById('authbutton')) {
        doc.forms[0].addEventListener('submit', function (event) {
          event.preventDefault();
          $loader.show();
          $(frame).addClass('imodal-frame-transparent');
          setTimeout(function () {
            doc.forms[0].submit();
          }, 0);
        });
      } else {
        imodal.close();
        var map = $('#ymap').data('map');
        map && map.checkActiveLayerAccess();
      }
      $(frame).removeClass('imodal-frame-transparent');
      $loader.hide();
    });
  }
}

// TOP MENU

$('#top-menu').each(function () {
  var $menu = $(this);
  var $items = $menu.children('.top-menu-item');
  var $more = $items.filter('.more-menu-item').hide();
  var $moreMenu = $more.children('.dropdown-menu');
  var $header = $('#header');
  var $siblings = $menu.nextAll();

  $items = $items.not($more);

  function align() {
    $more.show();
    $more.before($moreMenu.children());
    var maxWidth = getMaxMenuWidth();
    var moreWidth = $more.width();
    var sizes = getSizes(), total = 0, visible = 0;

    for (var i = 0; i < sizes.length; ++i) {
      if (total + sizes[i] > maxWidth) {
        if (total + moreWidth > maxWidth) {
          visible -= 1;
        }
        break;
      }
      total += sizes[i];
      visible += 1;
    }
    var $hidden = visible < 0 ? $items : $items.slice(visible);
    if ($hidden.length) {
      $moreMenu.append($hidden);
    } else {
      $more.hide();
    }
  }

  function getMaxMenuWidth() {
    var width = 10;
    $siblings.each(function () {
      width += $(this).outerWidth();
    });
    return $header.width() - $menu.offset().left - width;
  }

  function getSizes() {
    var sizes = [];
    $items.each(function () {
      sizes.push($(this).width());
    });
    return sizes;
  }

  $menu.show();
  align();

  $(window).on("resize", align);

  $menu.on('click', '.top-menu-section', function (event) {
    event.preventDefault();
    $items.filter('.active').removeClass('active');
    $(this).parent().addClass('active');
  });
});
