
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
		window.KanbanDesk = new KanbanDesk($("#DeskList option:selected").val());
		window.KanbanDesk.GetDeskDataFromServerAndRefresh();
	});
}
