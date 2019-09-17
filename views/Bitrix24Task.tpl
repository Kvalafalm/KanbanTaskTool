<!DOCTYPE html>

<html>
<head>
  <title>Beego</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    {{template "Style.html"}}
    {{template "bootstrap.html"}}
</head>

<body>
{{template "navbar.html" .}}
  <header>
    <div class="">
    

        <input type="text" id="taskIDAjax" name="taskID" value="{{.Task.Result.ID}}" >
        <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
        <script type="text/javascript">
             $("#taskIDAjax").change(function(){
                  $.ajax({
                                type: "POST",
                                url: "http://localhost:8080/Bitrix24/",
                                data: {"taskID": $("#taskIDAjax").val()}
                            }).done(function(msg) {

                                $("#result").html(msg);
                                $("#ID")[0].innerHTML =msg.result.ID; 
                                $("#TITLE")[0].innerHTML =msg.result.TITLE;


                                $("#CREATED")[0].innerHTML =msg.result.CREATED_BY_LAST_NAME + ' ' + msg.result.CREATED_BY_NAME + ' ' + msg.result.CREATED_BY_SECOND_NAME;
                                $("#RESPONSIBLE")[0].innerHTML =msg.result.RESPONSIBLE_LAST_NAME + ' ' + msg.result.RESPONSIBLE_NAME + ' ' + msg.result.RESPONSIBLE_SECOND_NAME;
                                
                                $("#DESCRIPTIONHTML")[0].innerHTML =msg.result.DESCRIPTION_HTML;
                            });
              });
          </script>

      <span id="result"></span>
    </div>  

    <div class="TitleTask">
    Задача №
    <span id="ID">{{.Task.Result.ID}}</span> - <span id="TITLE">{{.Task.Result.TITLE}}</span>
        
      <div class="author">
         <b>Автор:</b>
         <span id="CREATED"> {{.Task.Result.CREATEDBYLASTNAME}} {{.Task.Result.CREATEDBYNAME}} {{.Task.Result.CREATEDBYSECONDNAME}}</span><br>
        <b>Ответственный:</b>
         <span id="RESPONSIBLE"> {{.Task.Result.RESPONSIBLELASTNAME}} {{.Task.Result.RESPONSIBLENAME}} {{.Task.Result.RESPONSIBLESECONDNAME}} <span>
        <br>
        <b>Когда закрыта:</b>
         <span id="CLOSEDDATE"> {{.Task.Result.CLOSEDDATE}} </span>
        
      </div>
    </div>
{{if .Task }}
   <div class="description">
      <div>
        Описание задачи:
      </div>
      <div id="DESCRIPTIONHTML">
        {{.Task.Result.DESCRIPTIONHTML}}
      </div>
    </div>
{{else}}
      <div class="description">
      <div>
        Описание задачи:
      </div>
      <div id="DESCRIPTIONHTML">
        К сожалению не указанн номер задачи
      </div>
    </div>

{{end}}
 
    <div class="description">
      Количество комментариев  - {{.Task.Result.COMMENTSCOUNT}}
    </div>
 
    {{ range $key, $value := .Comments.Result }}
      <div class="feed-com-main-content feed-com-block-old feed-com-block-read">
        <div class="feed-com-user-box">{{$value.AUTHORNAME}}</div> <br>
        <div class="feed-com-text" >{{$value.POSTMESSAGEHTML}}</div> 
      </div>
    {{end}}
    
   </header>


  {{template "footer.html" .}}
</body>
</html>
