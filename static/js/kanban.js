var Columns = [];
var Kanbans;

let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;

window.onload = function() {
    //viewCollumn();
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
    
}
function refreshDeskList(){
    
    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/desklist/0",
        crossDomain : true,
        async: false,
        data: ""
   }).done(function (DeskList) {
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
        $(".KanbanDeskCanvas").append(desk.Innerhtml)
    });

    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/taskList/"+DeskId,
        crossDomain : true,
        data: ""

   }).done(function (Kanbans) {
        
        Kanbans.forEach(function(element) {
            OutputKanban(document.getElementById("Stage"+element.Stage).getElementsByClassName("KanbanColumnContent")[0], element);
        });

        document.getElementById('preloaderbg').style.display = 'none';

        setFunctionDADOnCollumn();
    });
}

function viewCollumn(){
    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/stages/0",
        crossDomain : true,
        data: "",
        async: false
   }).done(function (Stages) {
        KanbanDesk = document.getElementById("KanbanDesk");
        CountColum = "";
        Stages.forEach(function(element) {
            OutputColumn(KanbanDesk,element);
            CountColum += " 1fr";
        });
        KanbanDesk.style.gridTemplateColumns =  CountColum ;

    });

}

function OutputColumn(KanbanDiv,element){

    var KanbanColumn = document.createElement('div');
    KanbanColumn.className = "KanbanColumn";
    KanbanColumn.id = "Stage"+element.Id;
    var NameColumn = document.createElement('div');
    NameColumn.className = "NameColumn";
    NameColumn.innerHTML = element.Name;
    var KanbanColumnContent = document.createElement('div');
    KanbanColumnContent.className = "KanbanColumnContent";
    KanbanColumn.append(NameColumn);
    KanbanColumn.append(KanbanColumnContent);
    KanbanDiv.append(KanbanColumn);

}

function OutputKanban(Column,element){
    var Kanban = document.createElement('div');
    Kanban.draggable = "true";
    Kanban.className = "Kanban StandartClient";
    Kanban.id = element.Id;

    var NameKanban = document.createElement('div');
    
    className = "KanbanName";
    innerHTML = "№" + element.IdBitrix24 + " <img class='projetcicon' src='" + element.ImageProject + "'/>" ;
    if (element.ActiveBlokers.description != "") {
        //innerHTML += `<div class="blockedinfo">`+element.ActiveBlokers.description + ` <span class="badge badge-error">` + calculationDateStatusString(element.ActiveBlokers.startdate) + "</span><div>";
        innerHTML += `<span class="badge badge-pill badge-danger">`+  calculationDateStatusString(element.ActiveBlokers.startdate) + `</span>`;
        className += " blocked";
    }
    NameKanban.innerHTML = innerHTML
    NameKanban.className = className;
    var KanbanDescription = document.createElement('div');
    KanbanDescription.className = "KanbanDescription"
    KanbanDescription.innerHTML = "<span class='nameClient'>" + element.Name + "</span> ";

    var KanbanDurationStatus = document.createElement('div');
    KanbanDurationStatus.className = "KanbanDurationStatus"
    KanbanDurationStatus.innerHTML = "В этом статусе: " + calculationDateStatusString(element.DateSart) ;

    var KanbanUsers = document.createElement('div');
    KanbanUsers.className = "KanbanUsers"
    KanbanUsers.innerHTML = `<div ><img class="UserIcon" src=` + element.Users.icon + `></div>`;

    Kanban.append(NameKanban);
    Kanban.append(KanbanDescription);
    Kanban.append(KanbanDurationStatus);
    KanbanDurationStatus.append(KanbanUsers);
    Column.append(Kanban);
    
    $("#"+element.Id).dblclick(function(){

        $("#KanbanMore").show("slow");
        $.ajax({
            type: "GET",
            url: "/KanbanToolAPI/task/"+ element.Id ,
            crossDomain : true,
            data: ""
    
       }).done(function (Kanbans) {
            $(".taskKanbanTool").attr("id", element.Id);
            $(".TitleBitrix24").append("<h3>№" + Kanbans.IdBitrix24 + " - " + Kanbans.Name + "</h3>");
            $(".Descripion").append(Kanbans.DescriptionHTML);
            let DefaultButton = `<button type="button" class="btn btn-link btn-xs " style="padding:1px" onclick="StartModalWindow(this)" data-toggle="modal" data-target="#exampleModal"><i class="fa fa-pencil" aria-hidden="true"></i></button> <button type="button" class="btn btn-link btn-xs" style="padding:1px"><i class="fa fa-trash" aria-hidden="true"></i></button> `
            Kanbans.StagesHistory.forEach(function(element) {

                const startDate = (new Date(element.Start)).toLocaleDateString();
                let endDate 
                if (element.End =="0001-01-01T00:00:00Z"){
                    Stringdate = " настоящее время";
                }else{
                    Stringdate = (new Date(element.End)).toLocaleDateString();
                }

                const StringSS = '<span id="'+element.Id+'" class="onhover"> На этапе '+element.Idstage +' c ' + startDate + ' по ' + Stringdate + ' ('+ calculationGapDatesString(element.Start,element.End) + ')'+ DefaultButton + '</span>' 
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
                    //decision= `<button type="button" class="btn btn-outline-danger" onclick="Alert("Тест")">Danger</button>`
                    
                    //decision= ` <button type="button" class="close" aria-label="Close" id="`+element.Id+`" data-toggle="modal" data-target="#exampleModal" "><span aria-hidden="true">&times;</span></button>`;
                }
               
                const StringSS = '<span id="'+element.Id +'" class="onhover"> <b>'+ element.Description +'</b> c ' + startDate + ' по ' 
                + Stringdate + ' ('+ calculationGapDatesString(element.Startdate,element.Enddate) + '). '
                + decision + DefaultButton + '</span>'

                $(".BlokersMore").append(StringSS);
            });
          /*  Kanbans.Comments.forEach(function(element) {
                $(".KanbanMoreComents").append("<span>"+ +"<span>")
            });*/
            
            document.getElementById('preloaderbg').style.display = 'none';
        
                
        });
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

      $(".Kanban").on("dragstart",function(e){
        e.originalEvent.dataTransfer.setData("Text",e.target.id);
        FantomKanbanHeight = $(e.target).closest(".Kanban").height();
        
      });

      $(".KanbanColumn").on("drop",function(e){
        e.preventDefault();
        let data=e.originalEvent.dataTransfer.getData("Text");
        let from = $("#"+data).closest(".KanbanColumn");

        if (from[0].id != e.currentTarget.id) {
            updateKanban(data,e.currentTarget.id);
            from.find(".count").text("( "+ from.find(".KanbanColumnContent")[0].childElementCount + "/0)");
        }
        if (CurrentKanbanDrop != ""){
            $(CurrentKanbanDrop).after($(document.getElementById(data)))
        }else{
            $(e.currentTarget).find(".KanbanColumnContent").append(document.getElementById(data))
        }
        $(e.currentTarget).find(".count").text("( "+ $(e.currentTarget).find(".KanbanColumnContent")[0].childElementCount + "/0)");
        this.classList.remove('over'); 
      });
      
      $(".KanbanColumn").on("dragenter",function dragenterKanban(e){
        if(e.currentTarget != CurrentStageDrop){
            $(CurrentStageDrop).removeClass('over');
            CurrentStageDrop = e.currentTarget
            $("#FantomKanban").remove();
            $(CurrentStageDrop).addClass('over');
            $(CurrentStageDrop).append(FantomCard(FantomKanbanHeight));
            CurrentKanbanDrop="";
        }
     });

     $(".Kanban").on("dragenter",function dragenterKanban(e){
         
         if(e.currentTarget.closest(".Kanban") != CurrentKanbanDrop){
            $(CurrentStageDrop).removeClass('over');
            CurrentKanbanDrop = e.currentTarget.closest(".Kanban")
            $("#FantomKanban").remove();
            $(CurrentStageDrop).addClass('over');
            $(CurrentKanbanDrop).after(FantomCard(FantomKanbanHeight));
            
        }

         if ($(e.currentTarget).hasClass("Kanban") && e.currentTarget != CurrentKanbanDrop ){
            $(CurrentStageDrop).removeClass('over');
            CurrentKanbanDrop = e.currentTarget
            $("#FantomKanban").remove();
            $(CurrentStageDrop).addClass('over');
            $(CurrentKanbanDrop).after(FantomCard(FantomKanbanHeight));
            
         }
      });


      $(".KanbanColumn").on("dragover",function(e){
       if (e.preventDefault) {
            e.preventDefault();
          }
          
          if(e.currentTarget != CurrentStageDrop){
            $("#FantomKanban").remove();
            }
          //$("#FantomKanban").detach();
          //this.classList.('over');
          e.originalEvent.dropEffect = "move";
          return false;
      });

      $(".KanbanColumn").children().on("dragover",function(e){
        if (e.preventDefault) {
             e.preventDefault();
           }

           e.originalEvent.dropEffect = "move";
           return false;
       });
      $(".KanbanColumn").on("dragend",function(e){
          $(".over").removeClass('over');
          $("#FantomKanban").remove();
      });

}
function updateKanban (id,stage){
    let task =
    {
     "id": id,
     "stage": stage.replace("Stage","")
    }

    $.ajax({
        type: "POST",
        url: "/KanbanToolAPI/task.update/0",
        contentType: "application/json; charset=utf-8",
        crossDomain : true,
        processData: false,
        data: JSON.stringify(task),
        async: true
   });
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




function calculationDateStatusString(DateSetStatusJSON) {
    var DateSetStatus = new Date(DateSetStatusJSON);
    var CurrentDate = new Date();
    
    var times = Math.ceil(Math.abs(CurrentDate.getTime() - DateSetStatus.getTime()) / (1000 * 60));
    if (Math.floor(times/(60*24)) > 0){
        Result = Math.floor(times/(60*24)) + " д.";
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
        Result = Math.floor(times/(60*24)) + " д.";
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
    //var foo = jQuery('#FantomKanban');
    //foo.detach(); //удаляем элемент
    //много-много кода
    //foo.appendTo('body'); 
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
