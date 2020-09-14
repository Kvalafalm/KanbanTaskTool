<html>
<head>
  <title>КанбанТул РЭР</title>
  <link rel="shortcut icon" href="../static/Themes/{{.User.Theme}}/img/favicon.ico" type="image/x-icon">
  <link href="../static/Themes/{{.User.Theme}}/css/kanban v2.css" rel="stylesheet">
  <link href="../static/Themes/{{.User.Theme}}/css/kanbanGraph.css" rel="stylesheet">
  <script>
  var Bitrix24id = {{.User.Bitrix24id}}
  var defaultDesk = {{.User.Defaultdesk}}
  </script>
  {{template "bootstrap.html" .}}
  <script src="../static/js/class/WorkItem.js?ver=1.0.1.1"></script>
  <script src="../static/js/class/Desk.js?ver=1.0.0.0"></script>
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
    <a class="nav-item nav-link gray active" id="panelCFD-tab"  data-toggle="tab" href="#panelCFD"    role="tab" aria-controls="panelCFD"     aria-selected="false" >Накопительаня диаграмма</a>
    <a class="nav-item nav-link gray" id="panelSChart-tab"      data-toggle="tab" href="#panelSChart" role="tab" aria-controls="panelSChart"  aria-selected="true"  >Спектральная диаграмма</a>
    <a class="nav-item nav-link gray" id="panelCC-tab"          data-toggle="tab" href="#panelCC"     role="tab" aria-controls="panelCC"      aria-selected="false" >Контрольная диаграмма</a>
    <a class="nav-item nav-link gray" id="panelTPC-tab"         data-toggle="tab" href="#panelTPC"    role="tab" aria-controls="panelTPC"     aria-selected="false" >Пропускная способность</a>
    <!--
      <a class="nav-item nav-link gray" id="panelEvent-tab"       data-toggle="tab" href="#panelEvent"  role="tab" aria-controls="panelEvent"   aria-selected="false" >(-)Время разрешения блокировок</a>
      <a class="nav-item nav-link gray" id="panelClEv-tab"        data-toggle="tab" href="#panelClEv"   role="tab" aria-controls="panelClEv"    aria-selected="false" >(-)Кластеризация блокировок</a>
    -->
  </div>
</nav>

<!-- HTML -->

  <div class="tab-content" id="nav-tabContent">
    
    <div class="tab-pane fade active show" id="panelCFD" role="tabpanel" aria-labelledby="panelCFD-tab">
      <div class="graph">
          <div class="chart" id="CFD">
          </div> 
          <div class="form-check">
          <br>
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">C </label>
              <input class="form-control" type="date" value="2019-10-01" id="DateStart">
            </span>
            <br>
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">По</label>
              <input class="form-control" type="date" value="2019-11-30" id="DateEnd">
            </span>
            <br>
            <span class="form-inline">
             <button class="btn btn-primary" id="btnShowExperement">Показать эксперементы</button>
            </span>
            <br>
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
          <span class="form-inline">
            <input type="checkbox" class="form-check-input" id="showPercentils" onchange="checkedPercentils(this)">
            <label class="form-check-label" for="exampleCheck1">Показать перцентили</label>
          </span>
          <span class="form-inline">
            <label for="FirstPercentil">Процентиль </label>
            <input class="form-control form-control-sm" type="text" id="FirstPercentil" value="95">
          </span>

          <span class="form-inline">
            <label for="SecondPercentil">Процентиль</label>
            <input class="form-control form-control-sm" type="text" id="SecondPercentil" value="85">
          </span>

          <span class="form-inline"> 
            <label for="ThirdPercentil">Процентиль</label>
            <input class="form-control form-control-sm" type="text" id="ThirdPercentil" value="50" >
          </span>

          <label for="StagesSC">Этапы</label>
          <select multiple class="form-control" id="StagesSC" size="9">
          </select>

          <span class="form-inline"> 
            <button class="btn btn-primary" id="btnRefreshSC">Сформировать </button>
          </span>
          <span class="form-inline" id="infoSC">
             
          </span>
          </div>
      </div>
    </div>

    <div class="tab-pane fade" id="panelCC" role="tabpanel" aria-labelledby="panelCC-tab">
      <div class="graph">
        <div class="chart" id="ControlChart">
        </div> 
        <div class="form-check">
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">C </label>
              <input class="form-control" type="date" value="2020-01-01" id="DateStartCC">
            </span>
            <br>
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">По</label>
              <input class="form-control" type="date" value="2020-12-31" id="DateEndCC">
            </span>

            <br>     
            <label for="StagesCC">Этапы</label>
            <select multiple class="form-control" id="StagesCC" size="9">
            </select>
            <span class="form-inline">
              <input type="checkbox" class="form-check-input" id="showTrend" onchange="checkedTrend(this)">
              <label class="form-check-label" for="exampleCheck1">Линии тренда</label>
            </span>
            <span class="form-inline">
            <button class="btn btn-primary" id="btnRefreshCC">Сформировать</button>
            </span>
            <span class="form-inline" id="infoCC">
            </span>

            <span class="form-inline">
              <label for="FirstPercentil">Процентиль </label>
              <input class="form-control form-control-sm" type="text" id="idTaksForView" value="">
            </span>
            <span class="form-inline">
              <button class="btn btn-primary" id="btnTaksForView">Показать задачу</button>
            </span>
        </div>
      </div>
    </div>

    <div class="tab-pane fade" id="panelTPC" role="tabpanel" aria-labelledby="panelTPC-tab">
      <div class="graph">
          <div class="chart" id="ThroughputChart">
          Тут будет диаграмма пропускной способности
          </div>

          <div class="form-check">
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">C </label>
              <input class="form-control" type="date" value="2020-01-01" id="DateStartTPC">
            </span>
            <span class="form-inline">
              <label for="example-date-input" class="col-2 col-form-label">По</label>
              <input class="form-control" type="date" value="2020-12-31" id="DateEndTPC">
            </span>


            <label for="TypeperiodTPC">Группировка по периоду</label>
            <select class="form-control" id="TypeperiodTPC" size="4">
            </select>
            <br>
            <button class="btn btn-primary" id="btnRefreshTPC">Сформировать</button>
            <br>
            <span class="form-inline">
             <button class="btn btn-primary" id="btnShowExperementTPC">Показать эксперементы</button>
            </span>

            <span class="form-inline" id="infoTPC">
             
            </span>
            
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
            <p> Класс обслуживания
              <select class="form-control" id="ClassWorkItem">
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
