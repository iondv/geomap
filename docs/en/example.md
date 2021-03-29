### The previous page: [Configuration file](/docs/en/additional_settings.md)


# Example of the configuration file of geo module

```javascript
"geomap": {
      "globals": {
        "ymapControls": {
            "loader" : {
                "position" : {
                    "left" : 15,
                    "top": 90
                    }
                },
            "rulerControl" : null,
            "typeSelector" : {
                "float" : "right"
                },        
            "zoomControl" : {
                "position" : {
                    "left" : 10,
                    "top" : 120
                    }
                }        
            },
        "legend": {
          "collapsed": false
        },
        "panels": {
	        "rightInfo": {
                "type": "rightInfo"
            },
            "navFloat": {
                "type": "float",
                "cssClass": "map-nav-float nav-tree",
                "cssStyle": "left:46px; top:40px; width: 320px; max-height:calc(100% - 120px)"
            },
            "filterFloat" : {
               "type" : "float",
               "title": "Filters",
               "cssClass": "map-filter-float collapsible",
               "cssStyle" : "left:46px; bottom:45px; width: 280px; max-height:calc(100% - 163px);"
            }
        },
        "hidePageHead": true,
        "hidePageSidebar": true,
        "stroke": {
            "panel": {
              "name": "filterFloat"
            },
            "path": {
                "strokeColor": "#00ff00",
                "strokeWidth": 6,
                "opacity": 0.8
            },
            "polygon": {
                "fillColor": "#00ff00",
                "fillOpacity": 0.1,
                "strokeColor": "#00ff00",
                "strokeOpacity": 0.9,
                "strokeWidth": 3
            }
        },
        "namespaces": {
          "namespaceApp": "Приложение IONDV. Framework"
        },
        "statics": {
          "geoicons": "applications/namespaceApp/icons"
        },
        "logo": "geoicons/logo.png",
        "icons": {
          "namespaceApp": {"css" : "fa fa-plane"}
        },
        "start": [
          135.07,
          48.48
        ],
        "zoom": 10,
        "regions": {
          "enabled" : true,
          "osmIds" : [ "151223"],
          "panel": {
              "name": "filterFloat"
            },
          "button": {
          "caption": "Districts",
          "hint": "Filter by districts",
          "resetHint": "Reset filter"
        },
        "levels": {
          "4": {
            "strokeWidth": 3,
            "strokeColor": "#7e8dab",
            "strokeStyle": "solid",
            "strokeOpacity": 1,
            "fillColor": "#ffffff",
            "fillOpacity": 0
          },
          "6": {
            "strokeWidth": 1,
            "strokeColor": "#6e93c6",
            "strokeStyle": "solid",
            "strokeOpacity": 1,
            "fillColor": "#ffffff",
            "fillOpacity": 0
          }
        },
        "activeLevels": {
          "6": {
            "strokeWidth": 2,
            "strokeColor": "#a183cd",
            "strokeStyle": "solid",
            "strokeOpacity": 0.8,
            "fillColor": "#ffffff",
            "fillOpacity": 0
          }
        }
        },
        "search": {
          "panel": {
            "name": "filterFloat",
            "orderNumber": 10
          },
          "enabled" : true,
          "timeout" : 2000
        },
        "formFilter": {
          "panel": {
            "name": "filterFloat"
          }
        },
        "di": {
          "dataRepo": {
            "module": "@iondv/commons/lib/datarepository/ionDataRepository",
            "options": {
              "dataSource": "ion://Db",
              "metaRepository": "ion://metaRepo",
              "fileStorage": "ion://fileStorage",
              "imageStorage": "ion://imageStorage",
              "log": "ion://sysLog",
              "keyProvider": {
                "name": "keyProvider",
                "module": "@iondv/commons/lib/meta/keyProvider",
                "options": {
                  "metaRepo": "ion://metaRepo"
                }
              },
              "maxEagerDepth": 3
            }
          }
        }
      },
      "import": {
        "src": "applications/namespaceApp/geo",
        "namespace": "namespaceApp"
      }
}
```

