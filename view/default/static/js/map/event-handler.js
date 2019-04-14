'use strict';

(function () {

  var HANDLERS = {
    hidePanel: function (event, params) {
      if (params) {
        var panel = event.map.panels[params.panel];
        if (panel) {
          switch (params.panel) {
            case 'rightInfo':
              imodal.toggleSide(false);
              break;
            default:
              panel.hide();
          }
        }
      }
    }
  };

  Map.EventHandler = function (event, eventName, params) {
    this.event = event;
    this.eventName = eventName;
    this.params = params || {};
    this.handler = HANDLERS[this.params.handler];
    this.init();
  };

  Map.EventHandler.init = function (event, data) {
    if (data) {
      for (var eventName in data) {
        if (data.hasOwnProperty(eventName) && data[eventName]) {
          var list = [];
          var params = data[eventName] instanceof Array ? data[eventName] : [data[eventName]];
          for (var i = 0; i < params.length; ++i) {
            list.push(new Map.EventHandler(event, eventName, params[i]));
          }
        }
      }
    }
  };

  Map.EventHandler.prototype = {
    constructor: Map.EventHandler,

    init: function () {
      if (this.handler) {
        this.event.on(this.eventName, this.handler, this.params);
      } else {
        console.error('EventHandler: not found handler:', this.params);
      }
    }
  };

})();
