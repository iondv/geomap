This page in [Russian](/README_RU.md)

# IONDV. Geomap 

<h1 align="center"> <a href="https://www.iondv.com/"><img src="/geomap.png" alt="IONDV. Geomap" align="center"></a>
</h1>  

**Geomap** - is an IONDV. Framework module. It is used to display system data with
geo-coordinates on the map, by describing metadata. The module allows you to display
data on different layers, display them by regions, display detailed information
by object, display summary information for the entire layer.

### IONDV. Framework in brief

**IONDV. Framework** - is a node.js open source framework for developing accounting applications
or microservices based on metadata and individual modules. Framework is a part of 
instrumental digital platform to create enterprise 
(ERP) apps. This platform consists of the following open-source components: the [IONDV. Framework](https://github.com/iondv/framework), the
[modules](https://github.com/topics/iondv-module) и ready-made applications expanding it
functionality, visual development environment [Studio](https://github.com/iondv/studio) to create metadata for the app.

* For more details, see [IONDV. Framework site](https://iondv.com). 

* Documentation is available in the [Github repository](https://github.com/iondv/framework/blob/master/docs/en/index.md).

## Description

The map is displayed using the **Yandex api** through the
configured template. First, a navigation is formed on the map, the data for which
received by **rest request**, and only objects with geo-coordinates.

When you click on an object on the map, a window will be displayed with contents
defined by the `template`. There, you can specify links to data from the form of the selected object. To outline the region, you must configure its parameters in the application configuration file (`deploy.json`) and code that easy to determine with the help of special services.

### Module features

* Display the map on the module page.
* Highlighting the outline of an arbitrary area on the map (region, country, district).
* Display data from a report based on received / filtered data.
* Display brief information about the object, when you hover over.
* Displays detailed information about an object in a specific area of the page.
* Display of summary information on objects included in the area selected on the map.
* Implementation of data layers with filtering by conditions.
* Ability to set data view icons by data type.
* Display a pop-up window with brief information on an object.
* Display of a template of detailed information on an object.
* Search for objects.
* Arbitrary boundary filtering.
* Zoning and filtering by district boundaries.
* Connection of the report module data, including with the calculated data for the region.
 
### Intended use of the module using demo projects as an example

_Geomap_ module is used in several demo projects.

#### [telecom-ru.iondv.com](https://telecom-ru.iondv.com/geomap) project (russian version), [telecom-en.iondv.com](https://telecom-en.iondv.com/geomap) project (english version)

Application to account, store, and present the data on the availability of communication services (Internet, mobile communications, television, mail, etc.) in populated areas of the region. The _Geomap_ module page displays the settlements, in the form of objects, on the map. When you hover over an object - a card with information on the availability of telecommunications in the village is displayed. It is set by templates in the application metadata.

The map clearly shows the outline of the region, which includes settlements from the registry. The outline is set in the application configuration settings.

Additionally, it is possible for each district to view summary information about communication services. The summary information is set by the template in the application metadata.

#### [pm-gov-ru.iondv.com](https://pm-gov-ru.iondv.com/geomap) project (only russian version)

Registry type software solution for organizing public sector project activities. The _Geomap_ module page displays the location of objects created in the application registry. When you hover over an object - a window with information is displayed, indicating the name, address and photo of the object.

#### [dnt.iondv.com](https://dnt.iondv.com/geomap) project

The application displays the main features and functionality of systems implemented on IONDV.Framework. The _Geomap_ module page displays the location of objects created in the application registry. Pictures and color for objects are set in the application meta.

### Configuration of geomodule

Documentation for configuring a geomodule to use it in applications:

* [Geodata layer description](docs/en/geo-layer.md)
* [Navigation description through geodata](docs/en/navigation.md)
* [Templates for data output](docs/en/templates.md)
* [Configuration settings](docs/en/additional_settings.md)

--------------------------------------------------------------------------  

 #### [Licence](/LICENSE) &ensp;  [Contact us](https://iondv.com) &ensp;  [Russian](/README_RU.md)   

--------------------------------------------------------------------------  

Copyright (c) 2018 **LLC "ION DV"**.  
All rights reserved. 
