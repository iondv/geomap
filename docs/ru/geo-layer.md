## Описание слоя геоданных

Геоданные приложения представляют собой набор слоев данных, каждый из которых отвечает за отображение какой-либо информации на карте. В качестве источников гео-данных могут выступать REST-сервисы и локальное хранилище данных приложения (репозиторий данных).

*Пример:*
В следующем примере описан слой геоданных располагающийся в самом низу иерархии (все остальные слои будут отображаться поверх данного). Слой содержит два типа данных: один представляет собой набор **районов (region)** отображаемых как области с заливкой, второй представляет собой список **АЗС (gas-station)**, отображаемых на карте в виде пиктограм. При этом каждый район содержит **округа (districts)** отображаемые многоугольниками, а округа подразделяются на **муниципалитеты (munitipals)**, отображаемые на карте пиктограммами. Регионы выбираются из REST-сервиса, а АЗС из локального хранилища данных.

*Пример 1.  Описание слоя данных.*
```javascript
{
  "code": "gas-stations",  // уникальный код слоя данных
  "order": 0,  // порядковый номер слоя данных в стеке слоев
  "caption": "карта АЗС",  // читаемое название слоя данных
  "hint": "Схема расположения заправок Роснефть по округам и муниципалитетам",  // расширенное описание для подсказкок 
  "data": [
    {
      "type": "area",  // полученные объекты нужно отображать в виде области (например с заливкой или штриховкой)
      "restUrl": "http://adm.krai.ru/regions",  // Адрес сервиса для отправки post-запроса 
      "locationAttribute": "borders",  // Имя атрибута полученных объектов, содержащий информацию о расположении объекта
      "differHints": ["tone"], // дифференцируем области по оттенку базового цвета
      "options" : {
        "clusterize": false, // для гео-слоев в которых данные не являются точками (Point)
        "clusterDisableClickZoom" : true // Настройка кластера с разбиением на слои, при клике
      }, 
      "styleHints": { 
        "fill": "color", // заполняем области цветом
        "opacity": 0.4, // задаем прозрачность 40%
        "base-color": "navy", // в качестве базового цвета используем navy
        "deviation": 20, // варьируем тон в диапазоне плюс-минус 20%
       },
      "nested": {
        "type": "polyline", // полученные объекты нужно отображать в виде ломаных линий (в данном случае это границы областей)
        "locationAttribute": "borders",
        "differHints": ["color"], // дифференцируем границы округов по цвету
        "styleHints": {
          "line": "dashed",  // рисуем полигоны пунктиром
          "width": 1,  // толщиной 1 пиксель
          "min-color": "#A0A0A0",  // варьируем цвета в диапазоне от этого
          "max-color": "#FFFFFF" // до этого
        },
        "collection": "Districts",  // Имя атрибута типа коллекция, из которого следует отобразить вложенные объекты
        "nested": {
          "type": "point", // полученные объекты нужно отображать в виде точки на карте (в данном случае должен быть отображен геометрический центр области муниципалитета)
          "locationAttribute": "borders",
          "styleHints": {
            "icon": "munitipal",  // код иконки одиночного объекта
            "groupIcon": "munitipals"  // код иконки группы объектов (кластера)
          },
          "collection": "Munitipals"
         }
      }
    },
    {
      "type":  "point",  // полученные объекты нужно отображать в виде точек на карте
      "locationAttribute": "location",  // атрибут, хранящий координаты объекта
      "styleHints": {
          "icon": "azs",  // код иконки одиночного объекта
          "groupIcon": "multi-azs"  // код иконки группы объектов 
      },
      "query": { //формируем дополнительные условия выборки из репозитория данных
         "className": "naselenniyPunkt@namespaceApp", //выбираем объекты класса
	 "queryConditions": [
	   {
	     "property": "atr1", // атрибут
	     "operation": 10, // содержит
	     "nestedConditions": [ // вложенное условие
		{
		  "property": "atr2", // атрибут в классе по ссылке из atr1
		  "operation": 10, // содержит
		  "value": null,
		  "nestedConditions": [
		      {
			"property": "atr3", // атрибут в классе по ссылке из atr2
			"operation": 0, // равно
			"value": [ // значение atr3
			   "5"
			]
		      }
		   ]
		 }
	      ]
	    }, // логическое И (учитываются оба условия фильтра при отображении объектов на карте)
	    {
		"property": "atr5.atr6",
		"operation": 0,
		"value": [
		   "2"
		]
	    }
	 ]
      },
      "eagerLoading": { //настройка ЖЗ, в том числе для фильтров
          "map": [
            "name"
          ]
        }
      "query": {  // формируем дополнительные условия выборки из репозитория данных
        "className": "GasStation",   // выбираем объекты класса GasStation
        "queryConditions": [
             {
                "property": "Provider",  // с Поставщиком
                "operation":  0,  // равным
                "value": "Роснефть"  // строке "Роснефть"
             }
         ],
         
      }
    }
  ]
}
```

Атрибут `locationAttribute` используется как для выборки, так и для отображения данных. При выполнении запроса к локальному репозиторию данных, на атрибут указанный в свойстве `locationAttribute` накладывается условие вхождения его в текущую отображаемую область карты (прямоугольник заданный координатами). При отображении объектов на карте, используются данные из атрибута указанного в `locationAttribute` для соответствующего типа объектов.

#### Протокол взаимодействия с REST-сервисами.

##### Формат запроса геоданных.
Для получения геоданных из REST-сервиса модуль формирует post-запрос на указанный в слое URL с телом содержащим JSON-объект, содержащий координаты области, для которой требуется отобразить объекты, а также массив имен атрибутов коллекций, по которым будет строиться иерархия вложенности (т.е. REST-сервис должен возвратить объекты в указанных коллекциях на соответствующую глубину вложенности).

*Пример 2. Тело REST-запроса .*
```javascript
{
  "area": [[55.665, 37.66],[55.64, 37.53]],
  "hierarchy": ["Districts", "Munitipals"]
}
```
В ответ REST-сервис должен вернуть JSON-объект содержащий мета-описание классов возвращаемых объектов и массив объектов.

*Пример 3.  Тело ответа REST-сервиса.*
```javascript
{
  "meta":  [
     {
    "is_struct": false,
    "key": [ "id" ],
    "semantic": "name",
    "name": "region",
    "version": "",
    "caption": "Регион",
// ... опускаем атрибутивный состав меты класса ION ..
    "properties": [
      {
        "order_number": 10,
        "name": "id",
        "caption": "Идентификатор",
        "type": 0,
// ... опускаем атрибутивный состав меты свойства класса ION ..
      },
      {
        "order_number": 20,
        "name": "name",
        "caption": "Название",
        "type": 0,
// ... опускаем атрибутивный состав меты свойства класса ION ..
      },
      {
        "order_number": 30,
        "name": "borders",  // тот самый locationAttribute
        "caption": "Границы",
        "type": 100 // тип геокоординат
// ... опускаем атрибутивный состав меты свойства класса ION ..
      }
// ... прочие атрибуты класса
    ]
},
// ... далее мета-данные классов для округов (District) и муниципалитетов (Munitipal) 
   ],
  "items":[ // найден один регион
     {
       "className": "region",
        "id": "27",
        "name": "Хабаровский край",
        "borders":[[67.900,45.800],[69.786,35.879],....], // полигон границ края
         "Districts": [
              {
                  "className": "District",
                  "id": "khvr",
                  "name": "Хабаровский р-н",
                  "borders": [[67.900,45.800],[69.786,35.879],....], // полигон границ района
                  "Munitipals": [
                       {
                           "className": "Munitipals",
                           "id":"khv",
                           "name": "Хабаровск г.",
                           "borders": [[67.900,45.800],[69.786,35.879],....], // полигон границ муниципалитета
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

## Параметры слоя отвечающие за отображение иконок

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

## Пользовательские иконки

```javascript
"data" : [ 
        {
            "options" : {
                "customCluster" : {
	           "iconLayout": "default#image",
          	   "iconImageHref": "http://172.18.225.88/images/console/icon-login.png", //URL графического файла значка
                   "iconImageSize": [28, 28], //размер значка в пикселах
                   "iconImageOffset": [-10, -10] //сдвиг значка в пикселах относительно точки привязки 
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

## Отображение краткой информации для кластера

Кластер - объект на карте, отображающий числовое колличество геообъектов на определенном участке карты, сгруппированных в соответсвии с масштабом.

Есть два способа отображения информации во всплывающем окне кластера:

**Первый - это макет для отдельного объекта внутри карусели кластера.**
При наведении на клaстер, во всплывающем окне, отобразится информация о каждом геообъекте, входящем в него по отдельности. Информация отображается в виде карусели, каждая страница которой описывает геообъект, являющийся частью кластера.

`clusterBalloonContentLayoutHeight` необязательный параметр высоты всплывающего окна с отображением краткой информации. Может быть необходим для помещения целиком информации об объекте, так как всплывающее окно с каруселью не масштабируется при просмотре объектов.

`"clusterBalloonItemContentLayout"` - формат определения пути на настройки информации о геообъекте, которая будет указана во всплывающем окне.

*Пример:*
```javascript
{
    ...
    "data" : [ 
        {
            ...
            "options" : {
                ...
                "clusterHasBalloon" : true,
                "clusterBalloonContentLayoutHeight" : 250,  // не обязательный
                ...
            },
            "params" : {
                "clusterBalloonItemContentLayout" : "<div class='map-ajax-balloon' data-url='/geomap/render/ns/className/0/{{ properties.itemId }}?template=geo/balloon/name'><i class='fa fa-refresh fa-spin'></i></div>",             
            }
       }
    ]
}
```

**Второй способ применяется если необходимо отображать сводную информацию по геообъектам собранным в кластер.**

В таком случае в ejs-шаблон вместо одного объекта (item) будет передаваться массив таких объектов (items).
Но здесь нужно учитывать затраты на обработку шаблона сервером, так как в кластере может быть любое количество объектов.

*Пример:*

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

## Настройка уникальных значков на геообъекты слоя

Указываем путь к иконке для нужного слоя:

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
Обязательные настройки `"geoObjectIconLayout" : "default#image"` и `"geoObjectIconImageHref"` в котором прописывается адрес иконки, также можно манипулировать такими параметрами как `geoObjectIconImageOffset`, `geoObjectIconImageSize` и т.д.

## Настройка выделения результатов поиска на карте

Настройка отображения результатов поиска **для конкретного слоя**. Эти параметры перекрывают общие, что указаны в файле deploy.json проекта:
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

### Следующая страница: [Навигация](/docs/ru/navigation.md)