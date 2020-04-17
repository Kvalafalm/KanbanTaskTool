var Columns = [];
var Kanbans;
let deskTypesWorkItem;
let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;

window.onload = function() {

    $.event.addProp('dataTransfer');
    refreshDeskList();
    FillInKanbanDesk($("#DeskList option:selected").val());
    
    $("#сloseButton").click(function(){
        $("#KanbanMore").hide("slow");
        $(".TitleBitrix24").empty();
        $(".Descripion").empty();
        $(".StageMore").empty();
        $(".BlokersMore").empty();
        $(".KanbanMoreComents").empty();
        
        document.getElementById('preloaderbg').style.display = 'none';
    });

    $("#saveTask").click(function(){
        const id          = $(".taskKanbanTool").data("id");
        const stage       = $(".taskKanbanTool").data("stage");
        const Swimline    = $(".taskKanbanTool").data("Swimline");
        const TypeTask    = $(".taskKanbanTool #Type option:selected").val();
        updateKanban (id,stage,Swimline,TypeTask);
    });
}
function refreshDeskList(){
    
    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/desklist/0",
        crossDomain : true,
        async: false,
        data: ""
   }).done(function (DeskList) {
    if( DeskList.errorId != undefined && DeskList.errorId == "401" ){
        window.location.replace("/login")
        return
    }
        $("#DeskList").empty();
        let FirstEvent=true;
        DeskList.forEach(function(element) {
            if (FirstEvent){
                $("#DeskList").append('<option selected="selected" value="' + element.Id+ '">'+ element.Name + '</h3>');
                FirstEvent = false;
            }else{
                $("#DeskList").append('<option value="' + element.Id+ '">'+ element.Name + '</h3>');
            }

        });
    });  

    $( "#DeskList" ).change(function() {
        FillInKanbanDesk($("#DeskList option:selected").val());
    });
}

function FillInKanbanDesk(DeskId) {
    Kanbans = [];
   
    document.getElementById('preloaderbg').style.display = 'block'

    $(".KanbanDeskCanvas").empty();
    $(".KanbanDeskCanvas").attr('id', DeskId);    
    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/desk/"+DeskId,
        crossDomain : true,
        data: ""

    }).done(function (desk) {
        if( desk.errorId != undefined && desk.errorId == "401" ){
            window.location.replace("/login")
            return
        }
        deskTypesWorkItem = desk.TypeWorkItems;
        $(".KanbanDeskCanvas").append(desk.Innerhtml)
        $(".SwimlineName").each(function () {
            $(this).find(".StageInfo").addClass("onhover").append(`
            <span class="count"> (0 / 0)</span>

            <button type="button" class="btn btn-light btn-xs infoCollumn" style="padding:2px" ><i class="fa fa-info" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-light btn-xs openOnFullWindow" style="padding:2px"  class=""><i class="fa fa-clone" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-light btn-xs addKanban" style="padding:2px"  class=""><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
            `);
        });
        $(".openOnFullWindow").click(function(){
            alert($(this).closest(".KanbanColumn").attr('id') );
        });
        $(".addKanban").click(function(){
            $("#NewKanban").remove();
            $(this).closest(".Swimline").children(".SwimlineContent").children(".Stage" + $(this).closest(".StageInfo").attr("id").replace("StageInfo","")).children(".KanbanColumnContent").append(`
            <div draggable="true" class="Kanban NewKanban">
                <div class="KanbanDescription">
                    <div class="input-group">
                        <textarea class="form-control" id="NewKanban" aria-label="With textarea"></textarea>
                    </div>
                </div>
            </div>`);
            $("#NewKanban").keydown(function(e) {
                if (e.keyCode == 27) {
                    e.target.value = "";
                    $(".NewKanban").remove();
                    e.target.blur();     
                }else if(e.ctrlKey && e.keyCode == 13  ){
                    SaveKanban(this);
                }
            });

            $("#NewKanban").focus();
        });

        $(".infoCollumn").click(function(){
            
            $.ajax({
                type: "GET",
                url: "/KanbanToolAPI/stage/"+$(this).closest(".StageInfo").attr("id").replace("StageInfo",""),
                crossDomain : true,
                data: "",
                async: false
           }).done(function (stages) {
            if( stages.errorId != undefined && stages.errorId == "401" ){
                window.location.replace("/login")
                return
            }
                    
                alert(stages.Description)
        
            });
        });      
    });

    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/taskList/"+DeskId,
        crossDomain : true,
        data: ""

   }).done(function (Kanbans) {
        if( Kanbans.errorId != undefined && Kanbans.errorId == "401" ){
            window.location.replace("/login")
            return
        }
            Kanbans.forEach(function(element) {
                OutputKanban($("#SL"+element.Swimline+" .Stage"+element.Stage+" .KanbanColumnContent"), element);
            });

           $(".KanbanColumnContent").each(function(){
                $(this).closest(".Swimline").children(".SwimlineName").children("#StageInfo" + this.parentElement.className.replace("Stage","")).children(".count").text(" ("
                                + this.childElementCount + " / 0 ) ");
            });

            document.getElementById('preloaderbg').style.display = 'none';

            setFunctionDADOnCollumn();

        
    });
}

//+
function SaveKanban(e){

    let task =
    {
     "name": e.value,
     "stage": $(".NewKanban")[0].parentElement.parentElement.className.replace("Stage",""),
     "IdDesk": $("#DeskList option:selected").val(),
     "Swimline": $(".NewKanban").closest(".Swimline").attr('id').replace("SL","")
    }

    $.ajax({
        type: "POST",
        url: "/KanbanToolAPI/task.new/0",
        contentType: "application/json; charset=utf-8",
        crossDomain : true,
        processData: false,
        data: JSON.stringify(task),
        async: true
   }).done(function (element) {
            if( element.errorId != undefined && element.errorId == "401" ){
                window.location.replace("/login")
                return
            }
            $(".NewKanban").remove();

            OutputKanban($("#SL"+ element.Swimline+ " .Stage"+element.Stage+" .KanbanColumnContent"), element);

            $(".KanbanColumnContent").each(function(){
                $(this).closest(".Swimline").children(".SwimlineName").children("#StageInfo" + this.parentElement.className.replace("Stage","")).children(".count").text(" ("
                                + this.childElementCount + " / 0 ) ");
            });

   });
   
}


function OutputColumn(KanbanDiv,element){

    /*var KanbanColumn = document.createElement('div');
    KanbanColumn.className = "KanbanColumn";
    KanbanColumn.id = "Stage"+element.Id;
    var NameColumn = document.createElement('div');
    NameColumn.className = "NameColumn";
    NameColumn.innerHTML = element.Name;
    var KanbanColumnContent = document.createElement('div');
    KanbanColumnContent.className = "KanbanColumnContent";
    KanbanColumn.append(NameColumn);
    KanbanColumn.append(KanbanColumnContent);
    KanbanDiv.append(KanbanColumn);*/

}

function OutputKanban(Column,element){
    var Kanban = document.createElement('div');
    $(Kanban).css({
        "border-left": "7px solid " + element.TypeTask.Color
      });
    Kanban.draggable = "true";
    Kanban.className = "Kanban";
    Kanban.id = element.Id;

    var NameKanban = document.createElement('div');
    
    className = "KanbanName";
    innerHTML = `<div class="">`;
    if (element.ActiveBlokers != undefined) {
        if (element.ActiveBlokers.description != "") {
            innerHTML += `<span class="badge badge-pill badge-danger">`+  calculationDateStatusString(element.ActiveBlokers.startdate) + `</span>`;
        }
    }
    innerHTML += "№" + element.IdBitrix24 ;



    innerHTML += `</div>`;
    element.Users.forEach(function(item, i, arr) {
        innerHTML += `<img class="UserIcon" src=` + item.icon + `>` ;
    });
        
    if (element.TypeTask != undefined ){
        Kanban.className = Kanban.className + " typeTask" + element.TypeTask.Id;
    }

    NameKanban.innerHTML = innerHTML
    NameKanban.className = className;
    var KanbanDescription = document.createElement('div');
    KanbanDescription.className = "KanbanDescription"
    KanbanDescription.innerHTML = "<span class='nameClient'>" + element.Name + "</span> ";

    var KanbanDurationStatus = document.createElement('div');
    KanbanDurationStatus.className = "KanbanDurationStatus"

    var KanbanNameProject = document.createElement('div');
    KanbanNameProject.className = "KanbanNameProject"
    let finishButton = `<button type="button" class="btn btn-light btn-xs" style="padding:0px" onclick="FinishTask(this)" ><i class="fa fa-flag" aria-hidden="true"></i></button>`
    let Comments="";
    if (element.СommentsCount> 0) {
        Comments = `<i class="fa fa-comments-o fa-lg" aria-hidden="true">`+element.СommentsCount+`</i>`;
    }
    let duration = "";
    if (element.DateStart != "0001-01-01T00:00:00Z") {
        duration = `<span class="badge badge-success" style="font-size: small;">`+  calculationDateStatusString(element.DateStart) + `</span>`;
    }
    KanbanNameProject.innerHTML = `<div style="    text-align: right;" class="onhover">`+finishButton + Comments + duration +`<span class="projectName">` + element.NameProject + `</span> </div>`;

    Kanban.append(NameKanban);
    Kanban.append(KanbanDescription);
    Kanban.append(KanbanDurationStatus);
    KanbanDurationStatus.append(KanbanNameProject);
    Column.append(Kanban);
    
    $("#"+element.Id).dblclick(function(){

        $("#KanbanMore").show("slow");
        $.ajax({
            type: "GET",
            url: "/KanbanToolAPI/task/"+ element.Id ,
            crossDomain : true,
            data: ""
    
       }).done(function (Kanbans) {
        if( Kanbans.errorId != undefined && Kanbans.errorId == "401" ){
            window.location.replace("/login")
            return
        }
            $(".taskKanbanTool").attr("id", element.Id);
            $(".taskKanbanTool").data("id", element.Id);
            $(".taskKanbanTool").data("stage", element.Stage);
            $(".taskKanbanTool").data("Swimline",element.Swimline);

            $(".TitleBitrix24").append(`<h3><a target="_blank" href="https://rer.bitrix24.ru/company/personal/user/`+ window.Bitrix24id + `/tasks/task/view/`+Kanbans.IdBitrix24+`/">№` + Kanbans.IdBitrix24 + " - " + Kanbans.Name + "</a></h3>");
            $(".Descripion").append(Kanbans.DescriptionHTML);
            let DefaultButton = `
            <button type="button" class="btn btn-link btn-xs " 
                                style="padding:1px" 
                                onclick="StartModalWindow(this)" 
                                data-toggle="modal" 
                                data-target="#exampleModal">
                                    <i class="fa fa-pencil" aria-hidden="true"></i>
            </button> 
            <button type="button" class="btn btn-link btn-xs" style="padding:1px">
                <i class="fa fa-trash" aria-hidden="true"></i>
            </button> `


            $("#Parametrs #Type").empty();
            let selected="";
            deskTypesWorkItem.sort(function (a, b) {
                if (a.Order > b.Order) {
                  return 1;
                }
                if (a.Order < b.Order) {
                  return -1;
                }
                return 0;
            });

            deskTypesWorkItem.forEach(function(element) {

                    if (element.Id == Kanbans.TypeTask.Id){
                        selected = 'selected="selected"';
                    }else {
                        selected = "";
                    }
                    $("#Parametrs #Type").append('<option style="background-color:'+element.Color + ' "' + selected + ' value="' + element.Id+ '">'+ element.Name + '</h3>');
    
            });


            Kanbans.StagesHistory.forEach(function(element) {

                const startDate = (new Date(element.Start)).toLocaleDateString();
                let endDate 
                if (element.End =="0001-01-01T00:00:00Z"){
                    Stringdate = " настоящее время";
                }else{
                    Stringdate = (new Date(element.End)).toLocaleDateString();
                }

                const StringSS = `
                    <span id="`+element.Id+`" class="onhover"> 
                        <b>`+element.Name +'</b> c ' + startDate + ' по ' + Stringdate + ' ('+ calculationGapDatesString(element.Start,element.End) + ')'+ DefaultButton + `
                    </span>` 
                $(".StageMore").append(StringSS);
            });
            Kanbans.Blokers.forEach(function(element) {


                const startDate = (new Date(element.Startdate)).toLocaleDateString();
                let endDate 
                if (element.Enddate =="0001-01-01T00:00:00Z"){
                    Stringdate = " настоящее время";
                }else{
                    Stringdate = (new Date(element.Enddate)).toLocaleDateString();
                }
                let decision = '';
                
                if (element.Finished) {
                    decision = element.Diside;
                }else{
                }
               
                const StringSS = '<span id="'+element.Id +'" class="onhover"> <b>'+ element.Description +'</b> c ' + startDate + ' по ' 
                + Stringdate + ' ('+ calculationGapDatesString(element.Startdate,element.Enddate) + '). '
                + decision + DefaultButton + '</span>'

                $(".BlokersMore").append(StringSS);
            });
            Kanbans.Comments.forEach(function(element) {
                const date = new Date(element.POST_DATE)
                let Message
                if (element.POST_MESSAGE_HTML==""){
                    Message = element.POST_MESSAGE
                }else {
                    Message = element.POST_MESSAGE_HTML 
                }
                $(".KanbanMoreComents").append(`<div class="comments"><div class="CMauthor">`+ element.AUTHOR_NAME + `
                 <span style="position: absolute;
                                        right: 41%;
                                        font-weight: normal;
                                        font-size: smaller;" 
                > `+ date.toLocaleDateString() +' ' +   date.toLocaleTimeString() + `
                    </span>
                    </div>
                    <div class="CMdescription">`+ Message +`
                    </div>
                </div>`)
            });
            
            document.getElementById('preloaderbg').style.display = 'none';
        
                
        });
    });
}
function FinishTask(e){
    $.ajax({
        type: "POST",
        url: "/KanbanToolAPI/task.complete/"+$(e).closest(".Kanban").attr("id"),

        crossDomain : true,
        async:false,
        data: ""

   }).done(function (element) {
    if (element){
        if( element.errorId != undefined && element.errorId == "401" ){
            window.location.replace("/login")
            return
        }
        $(e).closest(".Kanban").addClass("finished");
    }
   });
}

/* Блока перетаскивания
*
*
*
*
*/ 
function drag(eventKanban) {
    eventKanban.dataTransfer.setData("text", eventKanban.target.id);
}

function setFunctionDADOnCollumn()
{
    // Начало перетаскивания
      $(".Kanban").on("dragstart",function(e){
        e.originalEvent.dataTransfer.setData("Text",e.target.id);
        FantomKanbanHeight = $(e.target).closest(".Kanban").height();
      });

      //ОтпустилиКарточку
      $("td").on("drop",function(e){
        e.preventDefault();
        let data=e.originalEvent.dataTransfer.getData("Text");
        let fromId = $("#"+data).closest(".KanbanColumnContent")[0].parentElement.id.replace("Stage","");
        
        if (
            fromId != CurrentStageDrop.id.replace("Stage","") 
            ||  $("#"+data).closest(".Swimline")[0].id.replace("SL","") != CurrentStageDrop.parentElement.parentElement.id.replace("SL","")
            ) {
            
            updateKanban(
                data,
                CurrentStageDrop.id.replace("Stage","") ,
                CurrentStageDrop.parentElement.parentElement.id.replace("SL","")
                );
        }
        if (CurrentKanbanDrop != ""){
            $(CurrentKanbanDrop).after($(document.getElementById(data)))
        }else{
            $(CurrentStageDrop).children(".KanbanColumnContent").append(document.getElementById(data))
        }
        //$(CurrentStageDrop).find(".count").text("( "+ $(e.currentTarget).find(".KanbanColumnContent")[0].childElementCount + "/0)");
        
      });

      // Если навели на Столбец Stage
      $("td").on("dragenter",function dragenterKanban(e){
        if(e.currentTarget != CurrentStageDrop){
            $(CurrentStageDrop).removeClass('over');
            CurrentStageDrop = e.currentTarget;
            $("#FantomKanban").remove();
            $(CurrentStageDrop).addClass('over');
            $(CurrentStageDrop).children(".KanbanColumnContent").append(FantomCard(FantomKanbanHeight));
            CurrentKanbanDrop="";
        }
     });
     // Если навели на карточку "Kanban"
     $(".Kanban").on("dragenter",function dragenterKanban(e){
         
         if(e.currentTarget.closest(".Kanban") != CurrentKanbanDrop){
            $(CurrentStageDrop).removeClass('over');
            CurrentKanbanDrop = e.currentTarget.closest(".Kanban");
            $("#FantomKanban").remove();
            $(CurrentStageDrop).addClass('over');
            $(CurrentKanbanDrop).after(FantomCard(FantomKanbanHeight));
            
          }
        
         if ($(e.currentTarget).hasClass("Kanban") && e.currentTarget != CurrentKanbanDrop ){
            $(CurrentStageDrop).removeClass('over');
            CurrentKanbanDrop = e.currentTarget;
            $("#FantomKanban").remove();
            $(CurrentStageDrop).addClass('over');
            $(CurrentKanbanDrop).after(FantomCard(FantomKanbanHeight));
            
         }
      });

      // Удаление фантомной карточки если ушли из активной зоны 
      $("td").on("dragover",function(e){
       if (e.preventDefault) {
            e.preventDefault();
          }
          
          if(e.currentTarget != CurrentStageDrop){
            $("#FantomKanban").remove();
            }

          e.originalEvent.dropEffect = "move";
          return false;
      });

      //  отмена обработки обработчика у дочерних элементов
      $("td").children().on("dragover",function(e){
        if (e.preventDefault) {
             e.preventDefault();
           }

           e.originalEvent.dropEffect = "move";
           return false;
       });

      // Конец перетаскивания Убиварем класс Over и Удаляем Фантомную карточку со всей доски
      $("td").on("dragend",function(e){
        $(".over").removeClass('over');
        $("#FantomKanban").remove();
      });

}

function updateKanban (id,stage,Swimline,TypeTask=undefined){
    let task =
    {
     Id: id,
     Stage: stage,
     Swimline :Swimline
    }

    if (TypeTask != undefined) {
        task.TypeTask =     {       
            Id: TypeTask
           };
    }

    $.ajax({
        type: "POST",
        url: "/KanbanToolAPI/task.update/0",
        contentType: "application/json; charset=utf-8",
        crossDomain : true,
        processData: false,
        data: JSON.stringify(task),
        async: true
   }).done(function (element) {
    if (element){
        if( element.errorId != undefined && element.errorId == "401" ){
            window.location.replace("/login")
            return
        }
    }
   });;
}

function allowDrop(eventKanban) {
    eventKanban.preventDefault();
}
  
function drop(eventKanban) {
    eventKanban.preventDefault();
    var data = eventKanban.dataTransfer.getData("text");
    eventKanban.target.appendChild(document.getElementById(data));
}

/* Конец Блока перетаскивания */ 



Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function calculationDateStatusString(DateSetStatusJSON) {
    var DateSetStatus = new Date(DateSetStatusJSON);
    var CurrentDate = new Date();
    
    var times = Math.ceil(Math.abs(CurrentDate.getTime() - DateSetStatus.getTime()) / (1000 * 60));
    if (Math.floor(times/(60*24)) > 0){
        let numWorkDays = 0;
        let checkDate =DateSetStatus ;      
        while (checkDate <= CurrentDate) {
            // Skips Sunday and Saturday
            if (checkDate.getDay() !== 0 && checkDate.getDay() !== 6) {
                numWorkDays++;
            }

            
            checkDate = checkDate.addDays(1);
        }

        Result = numWorkDays + " д.";
    }else if(Math.floor(times/(60)) > 0 ){
        Result = Math.floor(times/(60)) + " ч.";
    }else{
        Result = Math.floor(times) + " м.";
    }
    return Result;
}

function calculationGapDatesString(StartDateIn, EndDateIn) {
    let StartDate = new Date(StartDateIn);
    let EndDate;
    if (EndDateIn =="0001-01-01T00:00:00Z") {
        EndDate = new Date();
    }else{
        EndDate = new Date(EndDateIn);
    }
    let times = Math.ceil(Math.abs(EndDate.getTime() - StartDate.getTime()) / (1000 * 60));
    if (Math.floor(times/(60*24)) > 0){

        let numWorkDays = 0;
        let checkDate =StartDate ;      
        while (checkDate <= EndDate) {
            // Skips Sunday and Saturday
            if (checkDate.getDay() !== 0 && checkDate.getDay() !== 6) {
                numWorkDays++;
            }

            
            checkDate = checkDate.addDays(1);
        }

        Result = numWorkDays + " д.";

    }else if(Math.floor(times/(60)) > 0 ){
        Result = Math.floor(times/(60)) + " ч.";
    }else{
        Result = Math.floor(times) + " м.";
    }
    return Result;
}

function StartModalWindow(th){
    //if
    $("#exampleModalLabel").empty();
    $(".modal-body").empty();
    let form;
    if (th.parentElement.className!="onhover"){
    form = `
        <input type="hidden"  id="BlokerId" value='' aria-hidden="true">
        <input type="hidden"  id="BlokerIdtask" value="`+ th.parentElement.parentElement.id +`" aria-hidden="true">
        <input type="hidden" id="type" value="bloker" aria-hidden="true">`

    form += AddInputRow("Причина","BlokerReason","text","","укажите причину");
    form += AddInputRow("Решение","BlokerDecision","text","","");
    form += AddInputRow("Время начала","BlokerStart","text",(new Date()).toISOString(),"");
    form += AddInputRow("Время окончания","BlokerEnd","text","","");
    }else{
        $.ajax({
            type: "GET",
            url: "/KanbanToolAPI/bloker/"+th.parentElement.id,
            crossDomain : true,
            async:false,
            data: ""
    
       }).done(function (element) {
            form = `
            <input type="hidden"  id="BlokerId" value="`+element.Id+`" aria-hidden="true">
            <input type="hidden"  id="BlokerIdtask" value="`+ element.Idtask +`" aria-hidden="true">
            <input type="hidden" id="type" value="bloker" aria-hidden="true">`
            form += AddInputRow("Причина","BlokerReason","text",element.Description,);
            form += AddInputRow("Решение","BlokerDecision","text",element.Diside,"");
            form += AddInputRow("Время начала","BlokerStart","text",element.Startdate,"");
            if (element.Enddate == "0001-01-01T00:00:00Z"){
                form += AddInputRow("Время окончания","BlokerEnd","text",(new Date()).toISOString(),"Дата окончания");
            }else{
                form += AddInputRow("Время окончания","BlokerEnd","text","",(new Date()).toISOString());
            }
        
        });


    }
    $(".modal-body").append(form)
    $("#exampleModalLabel").append("Блокер");
}
function AddInputRow(Title,Id,type,value,placeholder){
    const row = `
    <div class="form-group">
        <label >`+ Title + `</label>
        <input type="`+ type + `" class="form-control" value="`+value + `" id="`+ Id+ `" placeholder="`+ placeholder+ `">
    </div>`;
    return row;
}
function SaveModalWindow(th){

    let bloker =
    {
     "Id": $("#BlokerId")[0].value,
     "Idtask": $("#BlokerIdtask")[0].value,
     "Description": $("#BlokerReason")[0].value,
     "Diside": $("#BlokerDecision")[0].value,
     "Startdate": $("#BlokerStart")[0].value,
     "Enddate": $("#BlokerEnd")[0].value,
    }

    $.ajax({
        type: "POST",
        url: "/KanbanToolAPI/bloker.update/0",
        contentType: "application/json; charset=utf-8",
        crossDomain : true,
        processData: false,
        data: JSON.stringify(bloker)
   }).done(function (element) {
        if( element.errorId != undefined && element.errorId == "401" ){
            window.location.replace("/login")
            return
        }

        if( $("#BlokerId")[0].value =="" ){
        let DefaultButton = `<button type="button" class="btn btn-link btn-xs " style="padding:1px" onclick="StartModalWindow(this)" data-toggle="modal" data-target="#exampleModal"><i class="fa fa-pencil" aria-hidden="true"></i></button> <button type="button" class="btn btn-link btn-xs" style="padding:1px"><i class="fa fa-trash" aria-hidden="true"></i></button> `
        const startDate = (new Date(bloker.Startdate)).toLocaleDateString();
        let endDate 
        if (bloker.Enddate =="0001-01-01T00:00:00Z"){
            Stringdate = " настоящее время";
        }else{
            Stringdate = (new Date(bloker.Enddate)).toLocaleDateString();
        }
    
        const StringSS = '<span id="'+bloker.Id +'" class="onhover"> <b>'+ bloker.Description +'</b> c ' + startDate + ' по ' 
        + Stringdate + ' ('+ calculationGapDatesString(bloker.Startdate,bloker.Enddate) + '). '
        + bloker.decision + DefaultButton + '</span>'

        $(".BlokersMore").append(StringSS);
        }
    });   
}

function DeleteRow(th){

}

function FantomCard(height){
    const FantomCard = `
    <div class="Kanban StandartClient" id="FantomKanban" style="height:`+height + `px">
        <div class="KanbanName">
        </div>
        <div class="KanbanDescription">
        </div>
        <div class="KanbanDurationStatus">
        </div>
        <div class="KanbanUsers">
        </div>
    </div>`;
    return FantomCard
}
