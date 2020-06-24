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
  <script src="../static/js/class/WorkItem.js?ver=1.0.1.1"></script>
  <script src="../static/js/kanbanGraph.js"></script>
  <script src="https://www.amcharts.com/lib/4/core.js"></script>
  <script src="https://www.amcharts.com/lib/4/charts.js"></script>
  <script src="https://www.amcharts.com/lib/4/themes/animated.js"></script>

</head>

<body>

{{template "navbar.html" .}}

<div class="container-fluid">
<!-- Resources -->


<nav>
  <div class="nav nav-tabs" id="nav-tab" role="tablist">
    <a class="nav-item nav-link gray active" id="panelCFD-tab" data-toggle="tab" href="#panelCFD" role="tab" aria-controls="panelCFD" aria-selected="false">Накопительаня диаграмма</a>
    <a class="nav-item nav-link gray" id="panelSChart-tab" data-toggle="tab" href="#panelSChart" role="tab" aria-controls="panelSChart" aria-selected="true">Гистограмма</a>
    <a class="nav-item nav-link gray" id="panelCC-tab" data-toggle="tab" href="#panelCC" role="tab" aria-controls="panelCC" aria-selected="false">Контрольная диаграмма</a>
    <a class="nav-item nav-link gray" id="panelTPC-tab" data-toggle="tab" href="#panelTPC" role="tab" aria-controls="panelTPC" aria-selected="false">Throughput(пропускная способность)</a>
  </div>
</nav>

<!-- HTML -->

  <div class="tab-content" id="nav-tabContent">
    
    <div class="tab-pane fade active show" id="panelCFD" role="tabpanel" aria-labelledby="panelCFD-tab">
      <div class="graph">
          <div class="chart" id="CFD">
          </div> 
          <div class="form-check">
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">C </label>
              <input class="form-control" type="date" value="2019-10-01" id="DateStart">
            </span>
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">По</label>
              <input class="form-control" type="date" value="2019-11-30" id="DateEnd">
            </span>
            <span class="form-inline">
              <button class="btn btn-primary" id="btnRefreshCFD">Сформировать</button>
            </span>
          </div>
      </div>  
    </div>

    <div class="tab-pane fade" id="panelSChart" role="tabpanel" aria-labelledby="panelSChart-tab">
      <div class="graph">
        <div class="chart"  id="SChart">
        </div> 
        <div class="form-check">
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">C </label>
              <input class="form-control" type="date" value="2019-10-01" id="DateStartSC">
            </span>
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">По</label>
              <input class="form-control" type="date" value="2019-11-30" id="DateEndSC">
            </span>

          <input type="checkbox" class="form-check-input" id="showPercentils" onchange="checkedPercentils(this)">
          <label class="form-check-label" for="exampleCheck1">Показать перцентили</label>

          <br>
            <label for="FirstPercentil">Процентиль</label>
            <input class="form-control form-control-sm" type="text" id="FirstPercentil" value="95">
          <br>

            <label for="SecondPercentil">Процентиль</label>
            <input class="form-control form-control-sm" type="text" id="SecondPercentil" value="85">
            <br>   
            
            <label for="ThirdPercentil">Процентиль</label>
            <input class="form-control form-control-sm" type="text" id="ThirdPercentil" value="50" >
            <br>     
                <label for="StagesSC">Этапы</label>
                <select multiple class="form-control" id="StagesSC" size="9">
                </select>

          
          <button class="btn btn-primary" id="btnRefreshSC">Сформировать SChart</button>
          </div>
      </div>
    </div>

    <div class="tab-pane fade" id="panelCC" role="tabpanel" aria-labelledby="panelCC-tab">
      <div class="graph">
        <div class="chart" id="ControlChart">
        </div> 
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="showTrend" onchange="checkedTrend(this)">
            <label class="form-check-label" for="exampleCheck1">Линии тренда</label>
            <button class="btn btn-primary" id="btnRefreshCC">Сформировать ControlChart</button>
        </div>
      </div>
    </div>

    <div class="tab-pane fade" id="panelTPC" role="tabpanel" aria-labelledby="panelTPC-tab">
      <div class="graph">
          <div class="chart" id="ThroughputChart">
          Тут будет диаграмма пропускной способности
          </div>

          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="showTrend" onchange="checkedTrend(this)">
            <label class="form-check-label" for="exampleCheck1">Процентиль</label>
            <button class="btn btn-primary" id="btnRefreshTPC">Сформировать ControlChart</button>
          </div>
      </div>
    </div>

  </div>

    <div id="KanbanMore" >
      <div class="taskList">
      </div>
      <div id="preloaderbg2" class="preloaderbg">
        <div class="centerbg2">
          <div id="preloader"></div>
        </div>
      </div>

      <div class="">
        <div class="taskKanbanTool">
          <h3>Настройки</h3> 
          <div id="Parametrs" style="
              width: 90%;
              padding: 5px;
              margin: 5px;
          ">
            <p> Тип рабочего элемента
              <select class="form-control" id="Type">
              </select>
            </p>
          </div>

          <h3>История этапов</h3> 
          <div class="StageMore">
          </div>
          <h3>  События
              <button type="button" class="btn btn-second btn-xs " id="ModalWindow__addEvent" data-toggle="modal" data-target="#exampleModal" ><i class="fa fa-plus-circle" aria-hidden="true"></i></button> 
          </h3>
          <div class="BlokersMore">
          </div>
        </div>

        <div id="taskBitrix24">
          <div>
            <button type="button" class="btn btn-dark" id="сloseButton">Х</button>
            <button type="button" class="btn btn-dark" id="saveTask">Save</button>
            <span class="TitleBitrix24"></span>
          </div>
          <div class="Descripion">

          </div>
          <div class="KanbanMoreComents">
          </div>
        </div>

      </div>
    </div>
</div>

</body>
</html>
