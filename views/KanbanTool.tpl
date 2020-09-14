<html>
<head>
  <title>КанбанТул РЭР</title>
  <link rel="shortcut icon" href="../static/Themes/{{.User.Theme}}/img/favicon.ico" type="image/x-icon">
  <link href="../static/Themes/{{.User.Theme}}/css/kanban v2.css" rel="stylesheet">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <script>
  var Bitrix24id = {{.User.Bitrix24id}}
  var defaultDesk = {{.User.Defaultdesk}}
  </script>
  {{template "bootstrap.html" .}}
  <script src="../static/js/class/WorkItem.js?ver=1.0.1.4"></script>
  <script src="../static/js/class/Desk.js?ver=1.0.1.4"></script>
  <script src="../static/js/kanban v3.js?ver=1.0.1.4"></script>
  <script src="../static/js/websocket.js?ver=1.0.1.4"></script>


</head>

<body>

{{template "navbar.html" .}}
  <div class="notifications">
 
  </div>
  
  <div class="container-fluid">

  <div id="KanbanDesk1">
      <div id="preloaderbg" class="preloaderbg">
        <div class="centerbg2">
          <div id="preloader"></div>
        </div>
      </div>
      <div class="KanbanDeskCanvas" id="">
        <div class="KanbanDesk" style="grid-template-columns: 1fr 1fr 1fr 3fr 1fr;;     width: 100%;">
            <div class="KanbanColumn" id="Stage9"  >
                <div class="NameColumn">Идея<span class="count"></span></div>
                <div class="KanbanColumnContent">
                </div>
            </div>

            <div class="KanbanColumn" id="Stage10"  >
                <div class="NameColumn">Проработка<span class="count"></span></div>
                <div class="KanbanColumnContent">
                </div>
            </div>

           <div class="KanbanColumn" id="Stage11"  >
                <div class="NameColumn">Оценка<span class="count"></span></div>
                <div class="KanbanColumnContent">
                </div>
            </div>

            <div class="KanbanRowView" style="grid-template-rows: 1fr 1fr;">
              <div class="KanbanColumnView" >
                  <div class="KanbanColumn" id="Stage12"  >
                      <div class="NameColumn">USM<span class="count"></span></div>
                      <div class="KanbanColumnContent">
                      </div>
                  </div>
                  <div class="KanbanColumn" id="Stage13"  >
                      <div class="NameColumn">Архитектура<span class="count"></span></div>
                      <div class="KanbanColumnContent">
                      </div>
                  </div>
                  <div class="KanbanColumn" id="Stage14"  >
                      <div class="NameColumn">USM<span class="count"></span></div>
                      <div class="KanbanColumnContent">
                      </div>
                  </div>
                  <div class="KanbanColumn" id="Stage15"  >
                    <div class="NameColumn">Подготовленно в работу<span class="count"></span></div>
                    <div class="KanbanColumnContent">
                  </div>
            </div>
              </div>
                <div class="KanbanColumnView" >
                  <div class="KanbanColumn" id="Stage16"  >
                      <div class="NameColumn">Подготовленно в работу<span class="count"></span></div>
                      <div class="KanbanColumnContent">
                      </div>
                  </div>
              </div>
            </div>


         
        </div>
      </div>
      <div class="KanbanDesk__Info">
      </div>
  </div>  
  </div>      
    <div id="KanbanMore" >
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


    <!-- Modal -->
    <div class="modal fade " id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Как получилось снять блокировку</h5>
          </div>

            <div class="modal-body">
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal" >Закрыть</button>
              <button type="button" class="btn btn-primary" onclick="SaveModalWindow(this)" data-dismiss="modal" >Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- EndModalDialog -->


</body>
</html>
