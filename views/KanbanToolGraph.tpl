<html>
<head>
  <title>КанбанТул РЭР</title>
  <link rel="shortcut icon" href="../static/img/favicon.ico" type="image/x-icon">
  <script>
  var Bitrix24id = {{.User.Bitrix24id}}
  </script>
  {{template "bootstrap.html" .}}
  <script src="../static/js/kanbanGraph.js"></script>
  <link href="../static/css/kanbanGraph.css" rel="stylesheet">

  <script src="https://www.amcharts.com/lib/4/core.js"></script>
  <script src="https://www.amcharts.com/lib/4/charts.js"></script>
  <script src="https://www.amcharts.com/lib/4/themes/animated.js"></script>

</head>

<body>

{{template "navbar.html" .}}

  <div class="container-fluid">
  <span style="color:Black" >Тут будут размещенны графики по доскам</span>
<div class="form-inline">

  <label for="example-date-input" class="col-2 col-form-label">DateStart</label>
  <input class="form-control" type="date" value="2019-10-01" id="DateStart">

  <label for="example-date-input" class="col-2 col-form-label">DateEnd</label>
  <input class="form-control" type="date" value="2019-11-30" id="DateEnd">
  <button class="btn btn-primary" id="refreshButton">Сформировать</button>

</div>

</div>
  <!-- https://www.amcharts.com/demos/lollipop-chart/
  https://www.amcharts.com/demos/simple-column-chart/
  https://www.amcharts.com/demos/scatter-chart/
   -->


<!-- Resources -->




<!-- HTML -->
<div class="graph" id="chartdiv"></div>

</div>      
<div class="graph" id="SChart"></div>

</div> 
 <!-- HTML -->
<div class="graph" id="CFD"></div>

</div> 

</body>
</html>
