function KanbanDesk() {
  this.name = name;
  this.id = false;
  this.description = false;
  
};

KanbanDesk.refresh = function() {
  $.ajax({
    type: "GET",
    url: "/KanbanToolAPI/desklist/0",
    crossDomain : true,
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

KanbanDesk.saveChange = function() {

}

KanbanDesk.saveChange = function() {
}