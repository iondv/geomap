### The previous page: [Templates](/docs/en/templates.md)

# Configuration settings

A typical setting of the _geomap_ module in the application configuration file includes the following sections:

- [x] [Setting the area to place standard Yandex elements and a loader `"ymapControls"`](/docs/en/additional_settings.md#setting-the-area-to-place-standard-yandex-elements-and-a-loader)
- [x] [Setting up floating toolbar `"panels"`](/docs/enadditional_settings.md#setting-up-floating-toolbars)
- [x] [Panel settings for filters `"panels"`](/docs/en/additional_settings.md#tollbar-settings-for-filters)
- [x] [Setting customization tool for selecting an arbitrary area on the map `"stroke"`](/docs/en/additional_settings.md#setting-customization-tool-for-selecting-an-arbitrary-area-on-the-map)
- [x] [Display object by template `"templates"`](/docs/en/additional_settings.md#display-object-by-template)
- [x] [Integration of external icon `"statics"`](/docs/en/additional_settings.md#integration-of-external-icon)
- [x] [Regional outlines `"regions"`](/docs/en/additional_settings.md#regional-outlines)
- [x] [Setting to free up space on the map while searching `"search"`](/docs/en/additional_settings.md#setting-to-free-up-space-on-the-map-while-searching)
- [x] [Setting the location of filter menu items `"search"`](/docs/en/additional_settings.md#setting-the-location-of-filter-menu-items)
- [x] [Setting highlighting search results on a map `"search"`](/docs/en/additional_settings.md#setting-highlighting-search-results-on-a-map)
- [x] [Setting a unique icon for the module page `"logo"`](/docs/en/additional_settings.md#setting-a-unique-icon-for-the-module-page)
- [x] [Setting map legend output `"legend"`](/docs/en/additional_settings.md#setting-map-legend-output)

The structure of the sections is as follows:

```json
"geomap": {
      "globals": {
        "ymapControls": {...},
        "panels": {...},
        "hidePageHead": false,
        "hidePageSidebar": true,
        "stroke": {...},
        "namespaces": {...},
        "templates": [...],
        "statics": {...},
        "start": [...],
        "zoom": 10,
        "regions": {...},
        "defaultNav": {...},
        "search": {...},
        "formFilter": {...},
        "logo": "...",
        "di": {...}
      },
      "import": {...}
    }
```

_In details for each section:_


## Setting the area to place standard Yandex elements and a loader 

Standard map controls are configured through the `ymapControls` option. If an element is absent in the settings or set to *null*, then it is not placed on the map.

You can read the description of items [here](https://tech.yandex.ru/maps/doc/jsapi/2.1/dg/concepts/controls-docpage/#standard)

Together with them the data loader is configured (`loader`).
Since the loader isn't a standart element, you can apply to it both *position* and styles (*cssStyle*) and classes (*cssClass*), if needed.

*Example:*

```javascript
"ymapControls": {
  "loader" : {
    "position" : {
      "left" : 15,
      "top": 90
    }
  }   
}
```

## Setting up floating toolbars

```javascript
"hidePageSidebar": true,
"panels": {
  "rightInfo" : { //responsible for the right pull-out toolbar. If the setting is not specified, the toolbar will be hidden from the map.
    "type" : "rightInfo"
  },
  "navFloat" : { //navFloat - floating toolbar within the map.
    "type" : "float",
    "cssStyle" : "left:0; top:36px; width: 320px"
  }
}
```
Positioning variants using "cssStyle" property:

* top left - "left:0; top:0;"
* bottom left - "left:0; bottom:0;"
* upper right- "right:0; top:0;"
* bottom left (with place for legend in mind) - "left:0; bottom:36px;"

Sections are configured in the navigation section of the geomodule. [Read more](/docs/en/navigation.md)

## Tollbar settings for filters

Filters are located on a floating toolbar, the parameters of which are set as follows:

```javascript
"panels":[
  "filterFloat": {
    "type" : "float",
    "title": "Filters",
    "cssClass": "map-filter-float",
    "cssStyle" : "left:400px; bottom:45px; width: 280px; max-height:calc(100% - 163px);"
  }
],
"stroke": {
  "panel": {
    "name": "filterFloat"
  }
},
"search": {
  "panel": {
    "name": "filterFloat"
  }
},
"formFilter": {
  "panel": {
    "name": "filterFloat"
  }
},
"regions": {
  "panel": {
    "name": "filterFloat"
  }    
}        
```

If you want to **fold toolbars**, add `"collapsible"` to the *css-classes*. Initially the tollbar is folded to expand it add a `"open"` class.

```javascript
...
 "panels": {
    "filterFloat": {
        "cssClass" : "map-filter-float collapsible open",
        ...
    }
 } 
 ...
```
## Setting customization tool for selecting an arbitrary area on the map 

Setting of the **"Stroke"** filter:

```javascript
"stroke": {
  "path": {
    "strokeColor": '#f0000',
    "strokeWidth": 6,
    "opacity": 0.8
  },
  "polygon": {
    "fillColor": '#00f0ff',
    "fillOpacity": 0.1,
    "strokeColor": '#0000ff',
    "strokeOpacity": 0.9,
    "strokeWidth": 3
  }
}
```
The default values for the parameters are indicated above, only selective values can be set:

```javascript
"stroke": {
  "path": {
    "strokeColor": "#00ff00"
  }
}
``` 
## Display object by template

Set the path to the folder with templates in the deploy.json file of the app. If the template uses static resources, then we connect them.

```javascript
"templates": [
  "applications/namespaceApp/templates"
],
"statics": {
  "geoicons": "applications/namespaceApp/icons"
}
```
Place the templates file (ejs).
While rendering ejs gets searched item (Item class)

_Examples:_

1. `/applications/ns/templates/geo/balloon/test.ejs`:
```
Balloon content
<h4><%= item.id %></h4>
<p><%= item.toString() %></p>
```

2. `/applications/namespaceApp/templates/geo/frame/test.ejs`:
```
Frame content
<h4><%= item.id %></h4>
<p><%= item.toString() %></p>
```

Their identifiers for the client will be the relative path:

```
  geo/balloon/test
  geo/frame/test
```

If the template is displayed in the frame pop-up window on the right, the link is used, which is indicated on the button in the layout of the geo-object card:

```
/geomap/render/ns/className/{{ properties.itemId }}?template=geo/frame/test
```

If the template is displayed in the geoobject card, asynchronous loading is needed. To do this, we form the boot layout of the card in the geolayer settings and specify a link to the desired template:

```javascript
"data": [{
  "params" :
  {
     "balloonContentLayoutClass": "<div class='map-ajax-balloon' data-url='/geomap/render/ns/className/{{ properties.itemId }}?template=geo/balloon/test'><i class='fa fa-refresh fa-spin'></i></div>"
  }
]
```
Please note that the balloon render goes in the same DOM as the map. Unlike the render in the side frame.

## Integration of external icon

In the application, you need to set the directory, containing static files that the server will give (in our case, the icons). To do this, set them as follows:

```javascript
"statics":[
  {
    "path":"applications/namespaceApp/icons", 
    "name":"geoicons"
  }
]
```
In the _statics_ array set the objects: 
* **path** - path to directory relative to `platform/` directory.
* **name** - name of mapping to be used by the application.

The second step is to specify icons for geolayers. [Read more]()

## Regional outlines:

```javascript
"regions": 
  {
    "enabled" : true,
    "osmIds" : [ 
      "151223"
    ]
  }
```

## Setting to free up space on the map while searching

Using the settings frees up space on the map by hiding the sidebar when entering a search query. 
Connection for search filter:

```javascript
    "search": {
          "enabled": true,
          "timeout": 1000,
          "panel": {
            "name": "navFloat"
          },
          "events" : {
            "found" : [
              {
                "handler" : "hidePanel",
                "panel" : "rightInfo"
              }
            ]
          }
        }
```
For the search filter the _handler_ `hidePanel` is determined, which connects to the filter event `found`.

## Setting the location of filter menu items

The order is set for the desired filter by the `"orderNumber"` property:

```javascript
"search": {
  "panel": {
    "name": "filterFloat",
    "orderNumber": 10
  },
  "enabled" : true,
  "timeout" : 2000
}
```
The order affects the placement of the filter only in the specified panel.
If the filter has an order, then the filter will always be higher than those where the order is not specified.

## Setting highlighting search results on a map

Layer parameters of the search results will be applied to **all layers**:

```javascript
{
"search": {
  "highlightFoundObjects" : true,
  "layer": {
	  "options": {
	    "geoObjectPreset" : "islands#blueDotIconWithCaption",
      "clusterPreset" : "islands#invertedBlueClusterIcons"
	  }
	}
}
```

To set the display of search results **for a specific layer**, parameters are specified in the geolayer meta. [Read more](/docs/en/geo-layer.md#настройка-выделения-результатов-поиска-на-карте)

## Setting a unique icon for the module page

```javascript
"logo": "common-static/logo.png"
```

## Setting map legend output

The map legend is activated through the settings in the deploy.json project. The `collapsed` property is responsible for the initial state of the legend - open or collapsed:

```javascript
"legend": {
  "collapsed": false
}
```
Creation of icons for the legend is taken only from the settings of the layer described in the geo-meta. Since geodata can be in the *FeatureCollection* format, which can contain any objects, properties and options (in different combinations).

By default, clustering is enabled for all data. You can disable it for a specific geo-layer. It is necessary if objects other than *Point* type are used in *FeatureCollection* :
```javascript
{
  "data":[{
    "options": {
      "clusterize": false
   }
  }]
}
```

_Customization of icons created through `geobuilder`_

Through the settings of the geolayer, you cannot change *preset* icons, because the data comes in the *FeatureCollection* format, which already contains it for each object and this overrides the general properties set in the layer. You can only substitute those that are not set (as *glyphicon*).

So for a consistent change in the color (appearance) of the icons on the map and legend, you need to change them both in `geobuilder` and in the geo-layer setting.

### The next page: [Configuration file example](/docs/en/example.md)






















