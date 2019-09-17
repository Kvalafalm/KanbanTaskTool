var Columns = [];
var Kanbans;


window.onload = function() {
    //viewCollumn();
    $.event.addProp('dataTransfer');
    FillInKanbanDesk();

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

function FillInKanbanDesk() {
    Kanbans = [];

    document.getElementById('preloaderbg').style.display = 'block'
    $.ajax({
        type: "GET",
        url: "/KanbanToolAPI/taskList/0",
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
    //var Benchmarks = document.createElement("div");
    //Benchmarks.className = "Benchmarks";
    // Benchmarks.innerHTML = '<div class=\"BenchmarksName\">Кол-во:</div> <div class=\"BenchmarksValue\"> 0</div> <div class=\"BenchmarksName\">Сумма:</div> <div class=\"BenchmarksValue\"> 0 т.р.</div>';
    var KanbanColumnContent = document.createElement('div');
    KanbanColumnContent.className = "KanbanColumnContent";
    KanbanColumn.append(NameColumn);
    //KanbanColumn.append(Benchmarks);
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
        innerHTML += `<span class="badge badge-danger">`+  calculationDateStatusString(element.ActiveBlokers.startdate) + `</span>`;
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
           
            $(".TitleBitrix24").append("<h3>№" + Kanbans.IdBitrix24 + " - " + Kanbans.Name + "</h3>");
            $(".Descripion").append(Kanbans.DescriptionHTML);
            Kanbans.StagesHistory.forEach(function(element) {

                const startDate = (new Date(element.Start)).toLocaleDateString();
                let endDate 
                if (element.End =="0001-01-01T00:00:00Z"){
                    Stringdate = " настоящее время";
                }else{
                    Stringdate = (new Date(element.End)).toLocaleDateString();
                }

                const StringSS = '<span> На этапе '+element.Idstage +' c ' + startDate + ' по ' + Stringdate + ' ('+ calculationGapDatesString(element.Start,element.End) + ')</span>'
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
                    decision = element.Diside
                }else{
                    //decision= `<button type="button" class="btn btn-outline-danger" onclick="Alert("Тест")">Danger</button>`
                    decision= `<button type="button" class="close" onclick="alert('qwe')" id="`+element.Id+`"></button>`;
                }
               
                const StringSS = '<span> <b>'+element.Description +'</b> c ' + startDate + ' по ' 
                + Stringdate + ' ('+ calculationGapDatesString(element.Startdate,element.Enddate) + '). '
                + decision + '</span>'

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

    $(".KanbanColumn").on("dragover",function(e){
        e.preventDefault();
      });
      $(".Kanban").on("dragstart",function(e){
        e.originalEvent.dataTransfer.setData("Text",e.target.id);
        this.classList.add('.DragStart');
        
      });

      $(".KanbanColumn").on("drop",function(e){
        e.preventDefault();
        let data=e.originalEvent.dataTransfer.getData("Text");
        let from = $("#"+data).closest(".KanbanColumn");
        updateKanban(data,e.currentTarget.id);
        $(e.currentTarget).find(".KanbanColumnContent").append(document.getElementById(data))
        $(e.currentTarget).find(".count").text("( "+ $(e.currentTarget).find(".KanbanColumnContent")[0].childElementCount + "/0)");
        from.find(".count").text("( "+ from.find(".KanbanColumnContent")[0].childElementCount + "/0)");
        this.classList.remove('over'); 
      });

      $(".KanbanColumn").on("dragenter",function(e){
       this.classList.add('over');
     });

      $(".KanbanColumn").on("dragover",function(e){
       if (e.preventDefault) {
            e.preventDefault();
          }
          e.originalEvent.dropEffect = "move";
          return false;
      });

      $(".KanbanColumn").on("dragend",function(e){
          $(".over").removeClass('over');
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