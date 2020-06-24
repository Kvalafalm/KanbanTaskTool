
var Columns = [];
var Kanbans;
let deskTypesWorkItem,deskClassWorkItem;
let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;

window.WorkItems = new Array;
window.onload = function() {
	window.WorkItems = new Array;
	$.event.addProp('dataTransfer');
	refreshDeskList();
	FillInKanbanDesk($("#DeskList option:selected").val());
	
	$("#refreshDesk").click(function(){
		window.WorkItems = new Array;
		FillInKanbanDesk($("#DeskList option:selected").val());
	});
	
	$("#ZoomPlus").click(function(){
		let fontSize = parseInt($(".KanbanDesk").css("font-size").replace("px","")) +4 ;
		$(".KanbanDesk").css({
			"font-size": fontSize
		});
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
		deskClassWorkItem = desk.ClassOfService;
		$(".KanbanDeskCanvas").append(desk.Innerhtml)
		$(".SwimlineName").each(function () {
			$(this).find(".StageInfo").addClass("onhover").append(`
			<span class="count"> (0 / 0)</span>
			<button type="button" class="btn btn-light btn-xs infoCollumn" style="padding:2px" ><i class="fa fa-info" aria-hidden="true"></i></button>
			<button type="button" class="btn btn-light btn-xs openOnFullWindow" style="padding:2px" ><i class="fa fa-clone" aria-hidden="true"></i></button>
			<button type="button" class="btn btn-light btn-xs addKanban" style="padding:2px"  ><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
			<button type="button" class="btn btn-light btn-xs showhideSL" style="padding:2px"><i class="fa fa-angle-double-up" aria-hidden="true"></i></button>
			`);
		});
		$(".openOnFullWindow").click(function(){
			
			alert($(this).closest(".KanbanColumn").attr('id') );
		});

		$(".showhideSL").click(function(){
			element = $(this).closest(".Swimline").find(".SwimlineContent");
			if (element.is(":visible")){
				element.hide();
			}else{
				element.show();
			}
		});

		$(".addKanban").click(function(){
			let firstPress = true;
			$(".NewKanban").remove();
			$(this).closest(".Swimline").children(".SwimlineContent").children(".Stage" + $(this).closest(".StageInfo").attr("id").replace("StageInfo","")).children(".KanbanColumnContent").append(`
			<div draggable="true" class="Kanban NewKanban">
				<div class="KanbanDescription">
					<div class="input-group">
						<textarea class="form-control newWorkItemText" aria-label="With textarea"></textarea>
					</div>
				</div>
			</div>`);
			$(".NewKanban").keydown(function(e) {
				if (firstPress){
					if (e.keyCode == 27) {
						e.target.value = "";
						$(".NewKanban").remove();
						e.target.blur();     
					}else if(e.ctrlKey && e.keyCode == 13  ){
						firstPress = false;
						let newWorkItems = new WorkItem();
						newWorkItems.Name = $(".newWorkItemText")[0].value;
						newWorkItems.Stage = $(".NewKanban")[0].parentElement.parentElement.className.replace("Stage","");
						newWorkItems.IDDesk = $("#DeskList option:selected").val();
						newWorkItems.Swimline = $(".NewKanban").closest(".Swimline").attr('id').replace("SL","");
						newWorkItems.div = $(".NewKanban")[0];
						newWorkItems.div.addEventListener("dblclick" , ()=>{
							newWorkItems.StartModalWindow();
						});
						newWorkItems.Parent = $("#SL"+newWorkItems.Swimline+" .Stage"+newWorkItems.Stage+" .KanbanColumnContent");
						newWorkItems.newTask = true;
						newWorkItems.save();
						WorkItems.push(newWorkItems);

					}
				}
			});
			$(".newWorkItemText").focus();
			
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
				let workItems = new WorkItem();
				WorkItems.push(workItems);
				workItems.updateData(element);
				workItems.show();
			});

		   $(".KanbanColumnContent").each(function(){
				$(this).closest(".Swimline").children(".SwimlineName").children("#StageInfo" + this.parentElement.className.replace("Stage","")).children(".count").text(" ( "
								+ this.childElementCount + " / 0 ) ");
			});

			document.getElementById('preloaderbg').style.display = 'none';

			setFunctionDADOnCollumn();

		
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
	 /* $(".Kanban").on("dragstart",function(e){
		e.originalEvent.dataTransfer.setData("Text",e.target.id);
		FantomKanbanHeight = $(e.target).closest(".Kanban").height();
	  });*/

	  //ОтпустилиКарточку
	  $("td").on("drop",function(e){

		e.preventDefault();
		let data=e.originalEvent.dataTransfer.getData("Text");
		let fromId = $("#"+data).closest(".KanbanColumnContent")[0].parentElement.id.replace("Stage","");
		
		if (
			fromId != CurrentStageDrop.id.replace("Stage","") 
			||  $("#"+data).closest(".Swimline")[0].id.replace("SL","") != CurrentStageDrop.parentElement.parentElement.id.replace("SL","")
			) {
				window.WorkItems.forEach(element => {
					if (element.Id == data){
						element.Stage = CurrentStageDrop.id.replace("Stage","");
						element.Swimline = CurrentStageDrop.parentElement.parentElement.id.replace("SL","");
						element.Parent = $("#SL"+element.Swimline+" .Stage"+element.Stage+" .KanbanColumnContent");
						element.Blokers.forEach((element)=>{
							if (!element.Finished){
								element.Finished=true;
							}
						});
						element.refreshCard();
						element.save();
					}
				});
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

function allowDrop(eventKanban) {
	eventKanban.preventDefault();
}
  
function drop(eventKanban) {
	eventKanban.preventDefault();
	var data = eventKanban.dataTransfer.getData("text");
	eventKanban.target.appendChild(document.getElementById(data));
}

/* Конец Блока перетаскивания */ 


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