<!DOCTYPE html>

<html>
<head>
  <title>Beego</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <script>
    window.ServerAPIIP = {{.ServerAPIIP}};
  </script>
  {{template "Style.html" .}}
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
          <h3>Блокировки</h3>
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
  {{template "footer.html" .}}
  
</body>
</html>
