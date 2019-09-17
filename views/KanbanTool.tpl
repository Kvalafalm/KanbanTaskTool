<!DOCTYPE html>

<html>
<head>
  <title>Beego</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  {{template "bootstrap.html" .}}
</head>

<body>

{{template "navbar.html" .}}
  <div class="container-fluid">
  <div id="KanbanDesk1">
      <div id="preloaderbg" class="preloaderbg">
        <div class="centerbg2">
          <div id="preloader"></div>
        </div>
      </div>
    <div class="KanbanDesk" style="grid-template-columns: 1fr 6fr 1fr 1fr 1fr 1fr;     width: 2750px;">
        <div class="KanbanColumn" id="Stage0"  >
            <div class="NameColumn">Бэклог<span class="count"></span></div>
            <div class="KanbanColumnContent">
            </div>
        </div>

        <div class="KanbanColumnGroup">
            <div class="KanbanRowView" style="grid-template-columns: 1fr 1fr">
                <div class="KanbanColumnView" >
                    <div class="KanbanRowView">
                        <div class="KanbanColumnView" style="grid-template-columns: 250px auto auto auto auto" >
                            <div class="KanbanColumn" id="Stage1" >
                                        <div class="NameColumn">В работу<span class="count"></span></div>
                                        <div class="KanbanColumnContent">
                                        </div>
                            </div>

                            <div class="KanbanColumn" id="Stage2">
                                    <div class="NameColumn">Формирование юзерстори<span class="count"></span></div>
                                    <div class="KanbanColumnContent"></div>
                            </div>
                            <div class="KanbanColumn" id="Stage3">
                                    <div class="NameColumn">UX/UI<span class="count"></span></div>
                                    <div class="KanbanColumnContent"></div>
                            </div>
                            <div class="KanbanColumn" id="Stage4">
                                    <div class="NameColumn">Архитектура в процессе<span class="count"></span></div>
                                    <div class="KanbanColumnContent"></div>
                            </div>
                            <div class="KanbanColumn" id="Stage5">
                                    <div class="NameColumn">Архитектура готово<span class="count"></span></div>
                                    <div class="KanbanColumnContent"></div>
                            </div>

                        </div>
                    </div>

                    <div class="KanbanRowView">
                        <div class="KanbanColumnView" style="grid-template-columns: 250px  auto auto" >

                            <div class="KanbanColumn" id="Stage6" >
                                <div class="NameColumn">В работу<span class="count"></span></div>
                                <div class="KanbanColumnContent one" >
                                    
                                </div>
                            </div>
                                
                            <div class="KanbanColumn" id="Stage7">
                                <div class="NameColumn">Анализ в процессе<span class="count"></span></div>
                                <div class="KanbanColumnContent two"></div>
                            </div>
                            <div class="KanbanColumn" id="Stage8">
                                    <div class="NameColumn">Анализ готово<span class="count"></span></div>
                                    <div class="KanbanColumnContent two"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="KanbanColumnView">
                    <div class="KanbanRowView" style="grid-template-columns: 1fr 1fr">

                            <div class="KanbanColumn" id="Stage9">
                                    <div class="NameColumn">Разработка в процессе<span class="count"></span></div>
                                    <div class="KanbanColumnContent"></div>
                            </div> 

                            <div class="KanbanColumn" id="Stage10">
                                    <div class="NameColumn">Разработка Готово<span class="count"></span></div>
                                    <div class="KanbanColumnContent"></div>
                            </div>   

                    </div>
                </div>
            </div>
            <div class="KanbanRowView">
                    <div class="KanbanColumnView" style="grid-template-columns: 250px auto " >

                            <div class="KanbanColumn" id="Stage11" >
                                    <div class="NameColumn">В работу<span class="count"></span></div>
                                    <div class="KanbanColumnContent">
                                    </div>
                            </div>

                        <div class="KanbanColumn" id="Stage12">
                                <div class="NameColumn">Работа<span class="count"></span></div>
                                <div class="KanbanColumnContent"></div>
                        </div>
                    </div>
            </div>
        </div>

        <div class="KanbanColumn" id="Stage13">
                <div class="NameColumn">Тестирование<span class="count"></span></div>
                <div class="KanbanColumnContent"></div>
        </div>

        <div class="KanbanColumn" id="Stage14">
                <div class="NameColumn">Ждет обновления<span class="count"></span></div>
                <div class="KanbanColumnContent"></div>
        </div>

        <div class="KanbanColumn" id="Stage15">
            <div class="NameColumn">Готово<span class="count"></span></div>
            <div class="KanbanColumnContent"></div>
        </div>


    </div>

  </div>  
  </div>      
    <div id="KanbanMore">
      <div id="preloaderbg2" class="preloaderbg">
      <div class="centerbg2">
        <div id="preloader"></div>
      </div>
      </div>
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
            <span>Комментарий 1</span>
          </div>
        </div>

      </div>
    </div>


    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
