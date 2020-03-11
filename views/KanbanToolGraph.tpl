<html>
<head>
  <title>КанбанТул РЭР</title>
  <link rel="shortcut icon" href="../static/Themes/{{.User.Theme}}/img/favicon.ico" type="image/x-icon">
  <link href="../static/Themes/{{.User.Theme}}/css/kanban v2.css" rel="stylesheet">
  <link href="../static/Themes/{{.User.Theme}}/css/kanbanGraph.css" rel="stylesheet">
  <script>
  var Bitrix24id = {{.User.Bitrix24id}}
  </script>
  {{template "bootstrap.html" .}}
  <script src="../static/js/kanbanGraph.js"></script>
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
<div class="graph" id="CFD">
</div>      
  <div class="graph">
    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="showPercentils" onchange="checkedPercentils(this)">
        <label class="form-check-label" for="exampleCheck1">Линии тренда</label>
    </div>

    <div  id="SChart">
    </div> 
  </div>

  <div class="graph">

    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="showTrend" onchange="checkedTrend(this)">
        <label class="form-check-label" for="exampleCheck1">Линии тренда</label>
    </div>

    <div  id="ControlChart">
    </div> 
  <div>

    <div id="KanbanMore">
      <div class="">
        <div class="taskKanbanTool">
          <h3>История этапов</h3> 
          <div class="StageMore">
          </div>
          <h3>  Блокировки
              <button type="button" class="btn btn-second btn-xs" onclick="StartModalWindow(this)" data-toggle="modal" data-target="#exampleModal" ><i class="fa fa-plus-circle" aria-hidden="true"></i></button> 
          </h3>
          <div class="BlokersMore">
          </div>
        </div>

        <div id="taskBitrix24">
          <div>
            <button type="button" class="btn btn-dark" id="сloseButton">Х</button>
            <span class="TitleBitrix24"></span>
          </div>
          <div class="Descripion">

          </div>
          <div class="KanbanMoreComents">
          </div>
        </div>

      </div>
    </div>

</body>
</html>
