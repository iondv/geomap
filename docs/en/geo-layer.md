## Geo layer discription

Geodata of the application represent a set of data layers, each of which is responsible for displaying some information on the map. REST-services and the local application data storage (data repository) can be the sources of geo-data.

*Example:*

The following example describes a geodata layer located at the very bottom of the hierarchy (all other layers will be displayed on top of this one). The layer contains two data types: one is the set **regions (region)** displayed as filled areas, the second is a list of **gas-stations**, displayed on the map as pictograms. Moreover, each district contains **districts** displayed by polygons, and the districts are divided into **municipalities**, displayed as pictograms on the map. Regions are selected from the REST-service, and gas stations from the local data base.

*Example №1.  Data layer description.*

```javascript
{
  "code": "gas-stations",  // unique data layer code
  "order": 0,  // serial number of the data layer in the layer stack
  "caption": "Gas station map",  // readable data layer name
  "hint": "Rosneft gas station location scheme by districts and municipalities",  // extended description for hints
  "data": [
    {
      "type": "area",  // received objects need to be displayed as an area (e.g. filled or shaded)
      "restUrl": "http://adm.krai.ru/regions",  // Service address for sending a post-request 
      "locationAttribute": "borders",  // attribute name of the received objects containing information about the object location
      "differHints": ["tone"], // differentiate the area according to the shade of the base color
      "options" : {
        "clusterize": false, // for geo-layers in which data is not Points 
        "clusterDisableClickZoom" : true // Configuring a cluster to layer when clicked
      }, 
      "styleHints": { 
        "fill": "color", // fill the areas with color
        "opacity": 0.4, // set the transparency to 40%
        "base-color": "navy", // use navy as the base color
        "deviation": 20, // vary the tone in the range of plus or minus 20%
       },
      "nested": {
        "type": "polyline", // received objects must be displayed as broken lines (in this case, it’s the boundaries of the regions)
        "locationAttribute": "borders",
        "differHints": ["color"], // differentiate the boundaries of the districts by color
        "styleHints": {
          "line": "dashed",  // draw the polygons with a dotted line
          "width": 1,  // 1 pixel thick
          "min-color": "#A0A0A0",  // vary the colors in the range from this
          "max-color": "#FFFFFF" // to this
        },
        "collection": "Districts",  // Name of an attribute of collection type from which to display nested objects
        "nested": {
          "type": "point", // the received objects must be displayed as a point on the map (in this case, the geometric center of the municipality area should be displayed)
          "locationAttribute": "borders",
          "styleHints": {
            "icon": "munitipal",  // icon code of the single object
            "groupIcon": "munitipals"  // icon code of the object groups (cluster)
          },
          "collection": "Munitipals"
         }
      }
    },
    {
      "type":  "point",  // received objects must be displayed as points on the map
      "locationAttribute": "location",  // attribute storing the coordinates of the object
      "styleHints": {
          "icon": "azs",  // icon code of the single object
          "groupIcon": "multi-azs"  // icon code of the object groups 
      },
      "query": { // additional conditions for selecting from the data repository
         "className": "naselenniyPunkt@namespaceApp", // select class objects
	 "queryConditions": [
	   {
	     "property": "atr1", // attribute
	     "operation": 10, // contains
	     "nestedConditions": [ // nested conditions
		{
		  "property": "atr2", // attribute in class by reference from atr1
		  "operation": 10, // contains
		  "value": null,
		  "nestedConditions": [
		      {
			"property": "atr3", // attribute in class by reference from atr2
			"operation": 0, // equals
			"value": [ // value of atr3
			   "5"
			]
		      }
		   ]
		 }
	      ]
	    }, // Boolean AND (both filter conditions are taken into account when displaying objects on the map)
	    {
		"property": "atr5.atr6",
		"operation": 0,
		"value": [
		   "2"
		]
	    }
	 ]
      },
      "eagerLoading": { // eager loading configuration, including for filters
          "map": [
            "name"
          ]
        }
      "query": {  // create additional conditions for selecting from the data repository
        "className": "GasStation",   // select objects of GasStation class
        "queryConditions": [
             {
                "property": "Provider",  // with Provider
                "operation":  0,  // equals
                "value": "Роснефть"  //  "Rosneft" string
             }
         ],
         
      }
    }
  ]
}
```

The `locationAttribute` attribute is used both for sampling and for displaying data. When executing a request to a local data repository, the condition specified in the `locationAttribute` property imposes the condition of its occurrence in the current displayed area of the map (the rectangle specified by the coordinates). When displaying objects on the map, data from the attribute specified in `locationAttribute` for the corresponding type of objects is used.

#### REST-services interaction protocol 

##### Geodata request format

To get geodata from the REST service, the module generates a post-request to the (specified in the layer) URL with the body containing the JSON object. This object has coordinates of the area for which you want to display the objects, as well as an array of names of the collection attributes that will be used to build the nesting hierarchy (REST-service should return objects in the specified collections to the appropriate nesting depth).

*Example 2. Body of REST-request .*
```javascript
{
  "area": [[55.665, 37.66],[55.64, 37.53]],
  "hierarchy": ["Districts", "Munitipals"]
}
```
In response, the REST service should return a JSON-object with a meta description of the classes of returned objects and an array of objects.

*Example 3.  Response body of REST-service.*
```javascript
{
  "meta":  [
     {
    "is_struct": false,
    "key": [ "id" ],
    "semantic": "name",
    "name": "region",
    "version": "",
    "caption": "Region",
// ... omit the attribute composition of the ION meta class ..
    "properties": [
      {
        "order_number": 10,
        "name": "id",
        "caption": "Identifier",
        "type": 0,
// ... omit the attribute composition of the ION meta class ..
      },
      {
        "order_number": 20,
        "name": "name",
        "caption": "Name",
        "type": 0,
// ... omit the attribute composition of the ION meta class ..
      },
      {
        "order_number": 30,
        "name": "borders",  // the one "locationAttribute"
        "caption": "Borders",
        "type": 100 // type of geo-coordinates
// ... omit the attribute composition of the ION meta class ..
      }
// ... other class attributes
    ]
},
// ... further meta-data of classes for districts (District) и munitipals (Munitipal) 
   ],
  "items":[ // one region found
     {
       "className": "region",
        "id": "27",
        "name": "Khabarovsk region",
        "borders":[[67.900,45.800],[69.786,35.879],....], // edge border polygon
         "Districts": [
              {
                  "className": "District",
                  "id": "khvr",
                  "name": "Khabarovsk district",
                  "borders": [[67.900,45.800],[69.786,35.879],....], // area border polygon
                  "Munitipals": [
                       {
                           "className": "Munitipals",
                           "id":"khv",
                           "name": "Khabarovsk",
                           "borders": [[67.900,45.800],[69.786,35.879],....], // municipality boundaries
                       },
                   // ...
                  ]
              },
      // ...
          ]
     }
  ]
}
```

## Layer options for displaying icons

```javascript
"data" : [ 
        {
            "options" : {
                "clusterPreset" : "islands#invertedDarkGreenClusterIcons",
                "geoObjectPreset" : "islands#redDotIconWithCaption"
            }
}
]
```

## Custom icons

```javascript
"data" : [ 
        {
            "options" : {
                "customCluster" : {
	           "iconLayout": "default#image",
          	   "iconImageHref": "http://172.18.225.88/images/console/icon-login.png", //URL icon image file
                   "iconImageSize": [28, 28], //icon size in pixels
                   "iconImageOffset": [-10, -10] //pixel icon offset relative to anchor point
                },
                "customGeoObject" : {
                   "iconLayout": "default#image",
	           "iconImageHref": "http://172.18.225.88/images/console/icon-login.png",
                   "iconImageSize": [28, 28],
                   "iconImageOffset": [-10, -10]
                 }
            }
      }
]
```

## Display brief information for the cluster

A cluster is an object on the map that displays the number of geo objects on a specific section of the map, grouped according to scale.

There are two ways to display information in a cluster popup window:

**The first method is the layout for an individual object inside the cluster carousel.**
When hovering over a cluster, a pop-up window displays information about each geo object included in it individually. Information is displayed as a carousel, each page of which describes a geo object that is part of a cluster.

`clusterBalloonContentLayoutHeight` optional parameter of the pop-up window height with brief information. It may be necessary to place the whole information about the object, since the pop-up window with the carousel does not scale when opening objects.

`"clusterBalloonItemContentLayout"` - format to determin the path to setting information about a geo object, which will be indicated in a pop-up window.

*Example:*
```javascript
{
    ...
    "data" : [ 
        {
            ...
            "options" : {
                ...
                "clusterHasBalloon" : true,
                "clusterBalloonContentLayoutHeight" : 250,  // not obligatory
                ...
            },
            "params" : {
                "clusterBalloonItemContentLayout" : "<div class='map-ajax-balloon' data-url='/geomap/render/ns/className/0/{{ properties.itemId }}?template=geo/balloon/name'><i class='fa fa-refresh fa-spin'></i></div>",             
            }
       }
    ]
}
```

**The second method is used if it is necessary to display summary information on geo objects collected in a cluster.**

In this case, an array of such objects (items) will be transferred to the ejs template instead of a single object (item).
But here you need to consider the costs of processing the template by the server, since the cluster can have any number of objects.

*Example:*

```javascript
{
    ...
    "data" : [ 
        {
            ...
            "options" : {
                ...
                "clusterHasBalloon" : true
                ...
            },
            "params" : {
                "clusterBalloonContentLayout" : "<div class='map-ajax-balloon' data-url='/geomap/render/namespaceApp/naselenniyPunkt/0?template=geo/cluster/example' data-ids='{% for obj in properties.geoObjects %}{{ obj.properties.itemId }},{% endfor %}'><i class='fa fa-refresh fa-spin'></i></div>",             
            }
       }
    ]
}
```

## Setting unique icons for layer geo objects

Specify the path to the icon for the desired layer:

```javascript
    "data" : [ 
        {
            "type" : "Point",
            "locationAttribute" : "geocoord",
            "matchMode" : "intersect",
            "options" : {
                 ....
                "geoObjectHasBalloon" : true,
                "geoObjectOpenBalloonOnClick" : true,
                "geoObjectIconLayout" : "default#image",
                "geoObjectIconImageHref" : "/geomap/geoicons/taksofon.png",
                "geoObjectIconImageSize" : [ 
                    30, 
                    42
                ],
                "geoObjectIconImageOffset" : [ 
                    -5, 
                    -38
                ]
            },
```
the address of the icon is registered in mandatory settings `"geoObjectIconLayout" : "default#image"` and `"geoObjectIconImageHref"`. You can also operate with parameters such as `geoObjectIconImageOffset`, `geoObjectIconImageSize` etc.

## Setting highlighting search results on a map

Customize the display of search results **for a specific layer**. These options overlap the generals, that are indicated in the deploy.json file:

```javascript
{
  "data" : [ 
     {
       ...
       "search" : {
         "options" : {
           "geoObjectPreset" : "islands#redDotIconWithCaption",
           "clusterPreset" : "islands#invertedRedClusterIcons"
       }
     }
   ]	
}
```

### The next page: [Navigation](/docs/en/navigation.md)