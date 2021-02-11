### The previous page: [Navifation](/docs/en/navigation.md)

# Forming connections of patterns for data output `templates`

Using templates, object cards [balloon](/docs/ru/templates.md#balloon-object-card) (displayed when you hover over an object on the map, contain a brief information about the object) and a pop-up window [layers](/docs/ru/templates.md#forming-sidebar-layers) (contains more detailed information about the object, you can also configure the output of the class object from the registry with the specified attribute composition) are formed. The templates contain information about the composition and output of data on these forms, as well as various additional operations with them (buttons, display methods, etc.).

## `balloon` object card

The pop-up window that appears when you hover over an object on the map contains brief information about the object.

Template customization example:
```ejs
<%
let result = { //fields (attributes) by which the information in the card will be displayed
  title: item.get('name'),
  subtitle: '',
  statsionar: '',
  internet: '',
  mobile: '',
  tv: '',
  radio: '',
  ops: ''
};

if (item.get('supOktmo')) { //class attribute path
  result.title += ', '+item.property('supOktmo').evaluate() +'<br>'; //view to display the class attribute value
}
if (item.get('chislennost')) {
  result.subtitle += 'Population '+ item.property('chislennost').evaluate() + ' ppl.';
}

let itemSvyaz = item.property('svyaz').evaluate(); //path for the "reference" attribute type
if (itemSvyaz) {
  let coll = itemSvyaz.property('statsionar').evaluate();
}
%>

<style> //styles for displaying attribute values in the object card
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
      <button type='button' class='btn btn-sm map-modal-link full-width' //view of the button to go to the window with detailed information on the object
              data-type='url'
              data-url='geomap/render/ns/locality/0/<%- item.id %>?template=geo/layers/connect'> //link to layers
        Information about the communication at locality // button name
      </button>
    </div>

    <div class="report-subtitle"></div>
    <div>
      <button type='button' class='btn btn-sm map-modal-link full-width'
              data-type='url'
              data-url='geomap/render/ns/locality/0/<%- item.id %>?template=geo/layers/zdrav'>
        Information about the Health care services at locality
      </button>
    </div>

  </div>
</div>
```

In Yandex cards format, the code is formed in one line:
```xml
"balloonContentLayoutClass" : "<ul class='balloon-attrlist' style='width:225px'><li><b class='block mb10'>{{ properties.item.name }}{% if properties.item.className %}, {{ properties.item.className.__string }} {% endif %}</b></li><li>Population {{ properties.item.chislennost.chislennost }} ppl.</li><li>Fixed communication: {% if properties.item.statsionar.length %} <ul class='comma-list'>{% for item in properties.item.statsionar %} <li>{{ item.operator.name }}</li>{% endfor %}</ul> {% else %} no {% endif %}</li><li>mobile communication: {% if properties.item.mobile.length %} <ul class='comma-list'>{% for item in properties.item.mobile %} <li>{{ item.__string }}</li>{% endfor %}</ul> {% else %} not {% endif %}</li><li>Internet: {% if properties.item.internet.length %} yes {% else %} no {% endif %}</li><li>Television:  {% if properties.item.tv.length %} yes {% else %} no {% endif %}</li><li>Radio: {% if properties.item.radio.length %} yes {% else %} no {% endif %}</li><li>Post Office: {% if properties.item.ops.length %} yes {% else %} no {% endif %}</li></ul><div><button type='button' class='btn btn-sm btn-primary map-modal-link' data-type='url' data-url='/registry/namespaceApp@naselenniePunkty/view/naselenniyPunkt@namespaceApp/{{ properties.itemId }}?readonly=on&short=on'>Read more</button></div>"
```

### Setting to hide a pop-up window when clicking on a link

In the pop-up window, you can display the sidebar with detailed information about the system object (_class="map-modal-link"_). To hide the pop-up window after leaving it, you must set the `data-close-balloon="true"` parameter.

*Example:*
```ejs
...
<button type='button' class='map-modal-link' 
data-close-balloon="true"
data-type='url'
data-url='geomap/render/ns/name/0'>
Information about ...
</button>
...
```

A parameter that allows you to change the current behavior of the pop-up window (opening and closing it when you hover the mouse):
```
"showBalloonOnHover": { "delay": 300 }
```

## Forming sidebar `layers`

sidebar appears when switching from the object card (using buttons or links). It contains detailed information about the object.

Template customization example:

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
  result.subtitle += 'Population '+ item.property('chislennost').evaluate() + ' ppl.';
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
        result.medical += 'Address: ' + elem.property('address').evaluate() + '<br>';
      }
      if (elem.get('internet')) {
        result.medical += 'Internet: ' + elem.property('internet').evaluate() + '<br>';
      }
      result.medical += '<br>';
    }
  }
}
else {
  result.medical += '<b>' + 'Absent' + '</b>';
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
      <h3 class="report-section-title">Health care service</h3>
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
  <button class="btn btn-close">Close</button>
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

### Forming a template to output information from the report module

On the side panel in the right area of the map, you can display information not only on geo objects, but also on navigation points, or on the area on the map using links to arbitrary templates. For example, by clicking on the navigation item the information from the report module in the drop-down window is displayed. The link is specified in the file with the description of the navigation item [Read more](/docs/ru/navigation.md). The template:

```ejs
<%
let title = req.query.title;
let regionTitle = item ? item.get('name') : 'Khabarovsk region';
let query = {
  oktmo: req.query.oktmo,
  _hsg_: 1 //table from the report is displayed without the first column
};
let params = {
  items: [{ //the name of the table and a link to it in the report
    title: 'Fixed communication',
    url: '/report/public/ns@summaryArea/stationArea/stationArea',
    query
  }]
};
%>
<!DOCTYPE html> //report table display settings
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
      <p><b>Administrative center - </b><%- centMunRaion %></p>
    <%
      }
      var nps = item.property('oktmo_nasPunkta').evaluate();
    %>
      <p><b>Number of localities: </b><%- nps ? nps.length : '' %></p>
      <p><b>Population, ppl.: </b><%- item.property('chislennost').evaluate() %></p>
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


### The next page: [Configuration settings](/docs/en/additional_settings.md)