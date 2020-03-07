var Columns = [];
var Kanbans;

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

}

class KanbanTool {
    constructor () {
      this.Parametrs  = ""
      this.Desk = new Desk();
        this.DeslList = Array();
    }
}

class Desk {

    constructor(){

    }
}

class WorkItem {

}


