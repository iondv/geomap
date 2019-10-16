### Предыдущая страница: [Навигация](/docs/ru/navigation.md)

# Формирование и последовательность связей шаблонов для вывода данных `templates`

С помощью шаблонов формируются карточки объектов [balloon](/docs/ru/templates.md#формирование-карточки-объекта-balloon) (отображаются при наведении на объект на карте, содержат в себе краткую информацию по объекту) и выпадающее окно справа [layers](/docs/ru/templates.md#формирование-боковой-панели-layers) (содержит более подробную информацию об объекте, так же можно настроить вывод объекта класса из реестра с указанным атрибутивным составом). В шаблонах указана информация о составе и выводе данных на эти формы, а так же различные дополнительные операции с ними (кнопки, способы отображения и т.д.).

## Формирование карточки объекта `balloon`

Всплывающее окно, которое отображается при наведении на объект на карте, содержит краткую информацию об объекте. 

Пример настройки шаблона:
```ejs
<%
let result = { //поля (атрибуты), по которым будет отображаться информация в карточке
  title: item.get('name'),
  subtitle: '',
  statsionar: '',
  internet: '',
  mobile: '',
  tv: '',
  radio: '',
  ops: ''
};

if (item.get('supOktmo')) { //путь к атрибуту класса
  result.title += ', '+item.property('supOktmo').evaluate() +'<br>'; //вид для вывода значения атрибута класса
}
if (item.get('chislennost')) {
  result.subtitle += 'Численность '+ item.property('chislennost').evaluate() + ' чел.';
}

let itemSvyaz = item.property('svyaz').evaluate(); //путь для атрибута с типом "ссылка"
if (itemSvyaz) {
  let coll = itemSvyaz.property('statsionar').evaluate();
}
%>

<style> //стили для вывода значений атрибутов в карточке объекта
  .report-balloon .map-modal-link {
    margin-top: 0;
    background: transparent;
    border:1px solid #ccc;
  }

  .report-balloon .report-title {
    font-size: 16px;
    margin: 10px 0 10px 0;
  }

  .report-balloon .report-subtitle {
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0 10px 0;
  }
</style>

<div class="report-balloon report-content">
  <div class="report-section">
    <div class="report-title"><%- result.title %></div>
    <div><%- result.subtitle %></div>

    <div class="report-subtitle"></div>
    <div>
      <button type='button' class='btn btn-sm map-modal-link full-width' //вид кнопки для перехода на окно с подробной инфо по объекту 
              data-type='url'
              data-url='geomap/render/ns/locality/0/<%- item.id %>?template=geo/layers/connect'> //ссылка на layers
        Информация о связи в населенном пункте //наименование кнопки
      </button>
    </div>

    <div class="report-subtitle"></div>
    <div>
      <button type='button' class='btn btn-sm map-modal-link full-width'
              data-type='url'
              data-url='geomap/render/ns/locality/0/<%- item.id %>?template=geo/layers/zdrav'>
        Информация о здравоохранении в населенном пункте
      </button>
    </div>

  </div>
</div>
```

В формате яндекс-карт код формируется в одну строку:
```xml
"balloonContentLayoutClass" : "<ul class='balloon-attrlist' style='width:225px'><li><b class='block mb10'>{{ properties.item.name }}{% if properties.item.className %}, {{ properties.item.className.__string }} {% endif %}</b></li><li>Численность {{ properties.item.chislennost.chislennost }} чел.</li><li>Стационарная связь: {% if properties.item.statsionar.length %} <ul class='comma-list'>{% for item in properties.item.statsionar %} <li>{{ item.operator.name }}</li>{% endfor %}</ul> {% else %} нет {% endif %}</li><li>Мобильная связь: {% if properties.item.mobile.length %} <ul class='comma-list'>{% for item in properties.item.mobile %} <li>{{ item.__string }}</li>{% endfor %}</ul> {% else %} нет {% endif %}</li><li>Интернет: {% if properties.item.internet.length %} есть {% else %} нет {% endif %}</li><li>Телевидение:  {% if properties.item.tv.length %} есть {% else %} нет {% endif %}</li><li>Радио: {% if properties.item.radio.length %} есть {% else %} нет {% endif %}</li><li>Отделение почтовой связи: {% if properties.item.ops.length %} есть {% else %} нет {% endif %}</li></ul><div><button type='button' class='btn btn-sm btn-primary map-modal-link' data-type='url' data-url='/registry/namespaceApp@naselenniePunkty/view/naselenniyPunkt@namespaceApp/{{ properties.itemId }}?readonly=on&short=on'>Подробно</button></div>"
```

### Настройка скрытия всплывающего окна при переходе по ссылке из него

Во всплывающем окне доступно действие вызова отображения боковой панели с подробной информацией об объекте системы (_class="map-modal-link"_). Для настройки скрытия всплывающего окна после совершения перехода из него необходимо задать параметр `data-close-balloon="true"`.

*Пример:*
```ejs
...
<button type='button' class='map-modal-link' 
data-close-balloon="true"
data-type='url'
data-url='geomap/render/ns/name/0'>
Информация о ...
</button>
...
```

Параметр, позволяющий менять текущее поведение всплывающего окна (открывающий и закрывающий его при наведению/уводу мыши):
```
"showBalloonOnHover": { "delay": 300 }
```

## Формирование боковой панели `layers`

Появляется при переходе из карточки объекта (при помощи кнопок, либо ссылок), содержит подробную информацию об объекте. 

Пример настройки шаблона:

```ejs
<%
let result = {
  title: item.get('name'),
  subtitle: '',
  medical: ''
}

if (item.get('supOktmo')) {
  result.subtitle = item.property('supOktmo').evaluate() +'<br>';
}
if (item.get('chislennost')) {
  result.subtitle += 'Численность '+ item.property('chislennost').evaluate() + ' чел.';
}

let itemZdrav = item.property('zdravNP').evaluate();
if (itemZdrav) {
  let coll = itemZdrav.property('medicalOrg').evaluate();
  if (coll && coll.length) {
    for (let elem of coll) {
      if (elem.get('name')) {
        result.medical += '<b class="bg-gray">' + elem.get('name') + '</b>' + '<br>';
      }
      if (elem.get('address')) {
        result.medical += 'Адрес: ' + elem.property('address').evaluate() + '<br>';
      }
      if (elem.get('internet')) {
        result.medical += 'Интернет: ' + elem.property('internet').evaluate() + '<br>';
      }
      result.medical += '<br>';
    }
  }
}
else {
  result.medical += '<b>' + 'Отсутствует' + '</b>';
}
%>
<!DOCTYPE html>
<html>
<head>
  <title>Summary report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"/>
  <link href="/geomap/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .bg-gray { background-color: #e6e6e6; }
    .bold { font-weight: bold; }
    .report { padding:10px 15px; }
    .report-title { margin:0 0 15px 0; font-size: 22px; }
    .report-subtitle { margin:0 0 0 0; font-size: 16px; color:#888; }
    .report-section-title { margin:20px 0; font-size:13px; text-transform: uppercase; color:#aaa; border-bottom:1px solid #ccc; }
    .report-list .row { margin:0; padding:5px 0; }
    .report-list .row .col-xs-6 { padding:0 4px 0 4px; }
    .report-list .report-item { margin-top:10px; }
    .report-item-title { font-weight: bold; text-transform: uppercase; padding:5px 0; }
    .btn-close { margin-top:20px; width:100%; background: transparent; border:1px solid #ccc; }
  </style>
  <script src="/geomap/vendor/jquery/jquery.min.js"></script>
</head>
<body>
<!-- applications\ns\templates\geo\layers\locality -->
<div id="report-zone" class="report">

  <h1 class="report-title"><%- result.title %></h1>
  <h3 class="report-subtitle"><%- result.subtitle %></h3>

  <div class="report-content">

    <div class="report-section">
      <h3 class="report-section-title">Здравоохранение</h3>
      <div class="report-section-body">
        <div class="report-list">
          <div><%- result.medical %></div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

<div class="report-footer">
  <button class="btn btn-close">Закрыть</button>
</div>
</div>

<script>
  jQuery('.btn-close').click(function () {
    parent.imodal.close();
  });
</script>
</body>
</html>

```

### Формирование шаблона для вывода информации из модуля отчета

На боковой панели в правой области карты, можно отображать информацию не только по геообъектам, но и по пунктам навигации, либо по области на карте с использованием ссылок на произвольные шаблоны. К примеру, по клику на пункт навигации выводить в выпадающем окне информацию из модуля отчетов. Ссылка задается в файле с описанием пункта навигации [Подробнее](/docs/ru/navigation.md). Сам шаблон выглядит следующим образом:

```ejs
<%
let title = req.query.title;
let regionTitle = item ? item.get('name') : 'Хабаровский край';
let query = {
  oktmo: req.query.oktmo,
  _hsg_: 1 //таблица из отчета отображается без первой колонки
};
let params = {
  items: [{ //наименование таблицы и ссылка на нее в отчете
    title: 'Стационарная связь',
    url: '/report/public/ns@summaryArea/stationArea/stationArea',
    query
  }]
};
%>
<!DOCTYPE html> //настройки отображения таблиц отчета
<html>
<head>
  <title>Summary area report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"/>
  <style>
    body { font-family: Arial; }
    .report-title { font-size:18px; text-transform: uppercase; margin:10px 0 20px; }
    .report-lead { font-size:13px; margin:0 0 20px; }
    .report-lead p { margin:5px 0 0 0; }
    .report-item { margin:0 0 20px 0; }
    .report-item-title { font-size:15px; margin: 0 0 10px; }
    .report-item iframe { width:100%; border:0; height:50px; }
  </style>
  <script src="/geomap/vendor/jquery/jquery.min.js"></script>
</head>
<body>
  <!-- applications\ns\templates\geo\reports\summaryArea -->
  <div id="report-zone" class="report-zone" data-params="<%= JSON.stringify(params) %>">
    <div class="report-title"><%- item.get('name') %></div>
    <div class="report-lead">
    <%
      let admin = item.property('admin').evaluate();
      let centMunRaion = null;
      if (admin) {
        centMunRaion = admin.property('centMunRaion').evaluate();
      }
      if (centMunRaion) {
    %>
      <p><b>Административный центр - </b><%- centMunRaion %></p>
    <%
      }
      var nps = item.property('oktmo_nasPunkta').evaluate();
    %>
      <p><b>Количество населенных пунктов: </b><%- nps ? nps.length : '' %></p>
      <p><b>Численность населения, чел.: </b><%- item.property('chislennost').evaluate() %></p>
    </div>
    <div class="report-content"></div>
  </div>

<script>
  (function () {
    var $zone = $('#report-zone');
    var $content = $zone.find('.report-content');
    var params = $zone.data('params');
    var loadingIndex = 0;

    for (var i = 0; i < params.items.length; ++i) {
      var item = params.items[i];
      var query = item.query ? ('?'+ serializeQuery(item.query)) : '';
      var result = '<div class="report-item"><h3 class="report-item-title">'+ item.title +'</h3><iframe src="'+
        item.url + query +'"></iframe></div>';
      $content.append(result);
    }

    $content.find('iframe').load(function (event) {
      var doc = this.contentWindow.document;
      this.style.height = (doc.body.scrollHeight + 5)+ 'px';
    });

    function serializeQuery(obj) {
      var items = [];
      for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
          items.push(name +'='+ obj[name]);
        }
      }
      return items.join('&');
    }

  })();
</script>
</body>
</html>
```


### Следующая страница: [Настройка конфигурации](/docs/ru/additional_settings.md)