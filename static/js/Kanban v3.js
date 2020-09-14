
var Columns = [];
var Kanbans;
let deskTypesWorkItem,deskClassWorkItem;
let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;
window.KanbanDesk;
//window.WorkItems = new Array;
window.onload = function() {
	//window.WorkItems = new Array;
	$.event.addProp('dataTransfer');
	refreshDeskList();

	window.KanbanDesk = new KanbanDesk($("#DeskList option:selected").val());
	window.KanbanDesk.GetDeskDataFromServerAndRefresh();

	
	$("#refreshDesk").click(()=>{
		window.KanbanDesk.GetDeskDataFromServerAndRefresh();
	});
	
	$("#ZoomPlus").click(function(){
		let fontSize = parseInt($(".KanbanDesk").css("font-size").replace("px","")) +4 ;
		$(".KanbanDesk").css({
			"font-size": fontSize
		});
	});

	$("#Experements").click(function(){
		window.KanbanDesk.InfoExperements();
	});
	
	$("#InfoDesk").click(function(){
		window.KanbanDesk.InfoDesk();
	});

	$("#ZoomMinus").click(function(){
		let fontSize = parseInt($(".KanbanDesk").css("font-size").replace("px","")) -4 ;
		$(".KanbanDesk").css({
			"font-size": fontSize
		});
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
		let select ="";
		DeskList.forEach(function(element) {

            if (window.defaultDesk==element.Id) {
                select = `selected="selected"`;
            }else{
				select = ``;
			}
                $("#DeskList").append(`<option ${select} value="${element.Id}">${element.Name}</option>`);

		});
	});  

	$( "#DeskList" ).change(function() {
		window.KanbanDesk = new KanbanDesk($("#DeskList option:selected").val());
		window.KanbanDesk.GetDeskDataFromServerAndRefresh();

	});
}
