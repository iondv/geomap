### The previous page: [Geodata layer](/docs/en/geo-layer.md)

## Geodata navigation description 

Geomodule navigation is formed by two types of navigation nodes:
* **Group** - is intended for grouping navigation nodes in the menu. 
* **Data** - is intended to display the indicated layers on the map.

*Example 1.  Group node description.*
```javascript
{
  "type": "group",  // node type - group
  "code": "rosneft",  // unique node code
  "parent": null,  // parent node code
  "caption": "Rosneft",  // Node name
  "hint": "Rosneft Company Information"  //extended node description to use in tooltips       
}
```

*Example 2.  Data node description.*

```javascript
{
  "type": "data",
  "order": 0,
  "code": "connect.locality",
  "parent": "connect",
  "caption": "Localities",
  "hint": "Localities",
  "layers": [
    "locality"
  ], // display locality layer data on the map  
  "viewer" : { // view for layer objects
    "type" : "regionReport", 
    "panel" : "rightInfo", 
    "url" : "/geomap/render/ns/municipalnieObrazovaniya/0/{oktmo}?template=geo/reports/summaryArea&notFound=geo/reports/summaryRegion", // class whose objects to display on the map, or the path to the template, with an additional parameter - notFound
    "defaultOktmo" : "08000000", 
    "excludes": null 
  },
  "filter" : [ // filters for navigation node objects
    {
      "caption" : "Type of locality",
      "fields" : [
        {
          "caption" : "List of parameters for the filter",
          "type" : "select",
          "multiple" : true,
          "filteredClass" : "locality@ns",
          "targetProp" : "type.id",
          "source" : {
            "className" : "typeLocality@ns",
            "valueProp" : null,
            "labelProp" : null
          }
        }
      ]
    }
  ]
}
```
`notFound` - is an additional parameter that contains the path to the template, which will be displayed if there is no object. If `notFound` is not specified and the object is not found, then the 404 will be returned. In this example, in the absence of *municipalnieObrazovaniya* the *geo/reports/summaryRegion* template will display.

For the "url" property **path to the list of objects** can be specofied from registry, for example:
```javascript
"url" : "/registry/ns@plan/plan@ns?short=on"
```

## Parametric Filters

Filter with a selection of values from the database:
```javascript
"filter" : [ 
        {
            "caption" : "Test group",
            "fields" : [ 
                {
                    "caption" : "Provider Analog TV",
                    "type" : "select",
                    "multiple" : true,
                    "filteredClass" : "naselenniyPunkt@namespaceApp",
                    "targetProp" : "tv.analogTV.name.id",
                    "source" : {
                        "className" : "tvSpr@namespaceApp",
                        "valueProp" : null, //the property from which the value for the filter is taken, if not specified, then the ID is used
                        "labelProp" : null //the property from which the value mapping is taken; if not specified, then the semantics is used
                    }
                }
            ]
        }
    ]
```

*Example with static data:*

```javascript
{
    "filter" : [ 
        {
            "caption" : "Test group",
            "fields" : [ 
                {
                    "caption" : "Analog TV",
                    "type" : "select",
                    "multiple" : false,
                    "filteredClass" : "class@ns",
                    "targetProp" : "tv.analogTV.name.id",
                    "values" : [ 
                        {
                            "value" : "f738ce85a6a16b634fe0e1c9",
                            "label" : "channel1"
                        }, 
                        {
                            "value" : "4ff57d9a01659da99bba0cbf",
                            "label" : "channel2"
                        }, 
                        {
                            "value" : "04958f5dadeeb076bd5b578c",
                            "label" : "channel3"
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Setting the transition from an object in the sidebar to an object on the map

The setting allows you (when going to an object to view detailed information about it in the sidebar `"rightInfo"`) to display its location on the map.

The class name and attribute name with geodata are passed to the handler, according to which the map will be centered.
So, the class must match the one whose list of objects is displayed in the right panel with detailed information (otherwise, nothing can be found by the passed id).

*Example:*
```javascript
{
    "caption" : "Project",
    "viewer" : {
        "panel" : "rightInfo",
        "url" : "/registry/ns@proj/proj@ns?short=on&condensed=on",
        "handlers" : {
            "centerMapByImodalObject" : {
              "className" : "proj@ns",
              "geoPropertyName" : "geoObj"
            }
        }
    }
}
```

The `url` property determines the address where the report is located.
When you select a region, the _oktmo_ (Russian National Classification of Municipal Territories) object is passed to this address (as a parameter).

*Example:*
```javascript
"viewer" : {
        "type" : "regionReport",
        "panel" : "rightInfo",
        "url" : "/report/public/ns@summaryArea/summaryArea/stationArea",
        "defaultOktmo" : "08000000"
    }
```

## Setting a unique icon for a geo navigation item

A unique icon is set in the `"icon"` property for the navigation item:

```javascript
{
  "type": "group",
  "order": 10,
  "code": "proj",
  "caption": "Projects",
  "hint": "Projects",
  "view": "nav",
  "icon": "/geomap/geoicons/1.png"
}
```

*Description formats*:

* For a file published from the application:
```
"icon": { "image": "geoicons/logo.png" }
```
* For an external file:
```
"icon": { "url": "http://yandex.ru/icon.png" }
```
* For an icon (font): [FontAwesome](http://fontawesome.io/icons/)
```
"icon": { "css": "fa fa-bolt" }
```
* icon font of the interface component library "Bootstrap":
```
"icon": { "css": "glyphicon glyphicon-time" }
```

## Setting floating toolbars

It is set in the application - geo/navigations/sections/...

```javascript
{
  "template" : null, // name of the ejs template that renders the section on the server.
  "panel" : "navFloat" // floating toolbar identifier defined indeploy.
}
```
If `template` is not specified, then it set by default.   
The section will be placed in the specified toolbar, and it will still remain in the main side menu.


### The next page: [Templates](/docs/en/templates.md)