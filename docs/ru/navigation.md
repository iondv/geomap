### Предыдущая страница: [Слой геоданных](/docs/ru/geo-layer.md)

## Описание навигации по геоданным

Навигация по геомодулю формируется узлами навигации двух типов: 
* **Группа** - предназначены для группировки узлов навигации в меню. 
* **Данные**. предназначены для вызова отображения на карте указанных слоев.

*Пример 1.  Описание группирующего узла.*
```javascript
{
  "type": "group",  // тип узла - группа 
  "code": "rosneft",  // уникальный код узла
  "parent": null,  // код родительского узла
  "caption": "Роснефть",  // Название узла
  "hint": "Информация по компании Роснефть"  // расширенное описание узла для использования в подсказках       
}
```

*Пример 2.  Описание узла данных.*

```javascript
{
  "type": "data",
  "order": 0,
  "code": "connect.locality",
  "parent": "connect",
  "caption": "Населенные пункты",
  "hint": "Населенные пункты",
  "layers": [
    "locality"
  ], // отображаем на карте данные слоя locality 
  "viewer" : { // представление для объектов слоя
    "type" : "regionReport", 
    "panel" : "rightInfo", 
    "url" : "/geomap/render/ns/municipalnieObrazovaniya/0/{oktmo}?template=geo/reports/summaryArea&notFound=geo/reports/summaryRegion", // класс, объекты которого отобразить на карте, либо путь к шаблону, с указанием дополнительного параметра notFound
    "defaultOktmo" : "08000000", 
    "excludes": null 
  },
  "filter" : [ // фильтры для объектов узла навигации
    {
      "caption" : "Тип населенного пункта",
      "fields" : [
        {
          "caption" : "Список параметров для фильтра",
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
`notFound` - дополнительный параметр, который содержит путь до шаблона, что будет выведен в случае отсутствия объекта. Если `notFound` не указан и не найден объект, то вернется стандартная 404. В данном примере при отсутствии *municipalnieObrazovaniya* отобразится шаблон *geo/reports/summaryRegion*

Для свойства "url" может быть указан **путь к списку объектов** из реестра, например:
```javascript
"url" : "/registry/ns@plan/plan@ns?short=on"
```

## Параметрические фильтры

Фильтр с выборкой значений из базы:
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
                        "valueProp" : null, //свойство из которого берется значение для фильтра, если не указано то используется ID
                        "labelProp" : null //свойство из которого берется отображение значения, если не указано, то семантика
                    }
                }
            ]
        }
    ]
```

*Пример со статичными данными:*

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

## Настройка перехода с объекта на боковой панели в объект на карте

Настройка позволяет при переходе в объект для просмотра подробной информации о нем на боковой панели `"rightInfo"`, делать центровку на маркере этого объекта, то есть отображать на карте его местоположение.
В обработчик передаются имя класса и имя атрибута с геоданными, по которым будет происходить центрирование карты.
Соответственно, класс должен совпадать с тем, список объектов которого отображается в правой панели с подробной информации (иначе по переданной id ничего не найдется). 

*Пример:*
```javascript
{
    "caption" : "Проекты",
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

Свойство `url` определяет адрес, по которому находится отчет.
При выборе региона на этот адрес передается _oktmo_ объекта (как параметр).

*Пример:*
```javascript
"viewer" : {
        "type" : "regionReport",
        "panel" : "rightInfo",
        "url" : "/report/public/ns@summaryArea/summaryArea/stationArea",
        "defaultOktmo" : "08000000"
    }
```

## Настройка уникальной иконки для пункта геонавигации

Задается в свойстве `"icon"` для пункта навигации:

```javascript
{
  "type": "group",
  "order": 10,
  "code": "proj",
  "caption": "Проекты",
  "hint": "Проекты",
  "view": "nav",
  "icon": "/geomap/geoicons/1.png"
}
```

*Форматы описания*:

* Для файла опубликованного из приложения:
```
"icon": { "image": "geoicons/logo.png" }
```
* Для внешнего файла:
```
"icon": { "url": "http://yandex.ru/icon.png" }
```
* Для картинки из стилей (шрифта): [FontAwesome](http://fontawesome.io/icons/)
```
"icon": { "css": "fa fa-bolt" }
```
* иконочный шрифт библиотеки интерфейсных компонентов "Bootstrap":
```
"icon": { "css": "glyphicon glyphicon-time" }
```

## Настройка плавающих панелей

Задается в приложении по пути geo/navigations/sections/...

```javascript
{
  "template" : null, //название шаблона ejs который рендерит секцию на сервере.
  "panel" : "navFloat" //идентификатор плавающей панели определенной в deploy.
}
```
Если не указан `template`, то используется по умолчанию.   
Секция будет размещена в указанной панели, кроме того она все еще останется в главном боковом меню.


### Следующая страница: [Шаблоны](/docs/ru/templates.md)