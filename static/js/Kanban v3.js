var Columns = [];
var Kanbans;
let deskTypesWorkItem;
let CurrentStageDrop,CurrentKanbanDrop,FantomKanbanHeight;
let TypeEventColor = [
	"rgba(248, 42, 162, 0.8)",// Блокер
	"rgba(248, 227, 42, 0.8)",// Пауза
	"rgba(33, 103, 207, 0.8)", //Дефект
]
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

function calculationGapDatesString(StartDate, EndDate) {

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


class WorkItem {
	constructor(){
		this.div = document.createElement('div');
		this.Template = "";
		this.Id = "";
		this.IdBitrix24 = "";
		this.IDDesk = "";
		this.Name = "";
		this.Stage = "";
		this.Swimline = "";     
		//this.DateStart = "";      
		//this.DateStartStage = "";
		this.Users = "";         
		
		this.TypeTask  = "";    
		this.IdProject = "";    
		this.ImageProject= "";  
		this.NameProject = "";  
		this.ActiveBlokers= "";
		this.Blokers = new Array;
		this.StagesHistory = new Array;
		this.Comments = new Array;
		this.СommentsCount= "";
		this.Parent ="";
		this.newTask = false;

		this.div.addEventListener("dblclick" , ()=>{
			this.StartModalWindow()
		});
		//internal veriables
		this.blinking = false;
		/*  DescriptionHTML template.HTML      `json:"DescriptionHTML"`
		Blokers         []model.Bloker     `json:"Blokers"`
		StagesHistory   []StageHistory     `json:"StagesHistory"`
		Comments        []Comments         `json:"Comments"`
		*/
	
		/*ActiveBlokers  struct {
		   Id          int       `json:"id"`
		   Description string    `json:"description"`
		   Startdate   time.Time `json:"startdate"`
	   } `json:"ActiveBlokers"`
	   */
	}

	updateData(data) {
		this.Id = data.Id;
		this.IdBitrix24 = data.IdBitrix24;
		this.Name = data.Name;
		if (this.Swimline != data.Swimline || this.Stage != data.Stage){
			this.Parent = $("#SL"+data.Swimline+" .Stage"+data.Stage+" .KanbanColumnContent");
		}

		this.Stage = data.Stage;
		this.IDDesk = data.IDDesk;
		this.DateStart = data.DateStart;
		this.LeadTime = data.LeadTime;
		this.CyrcleTime = data.CyrcleTime;
		this.FlowEffectives = data.FlowEffectives; 
		this.DateStartStage = data.DateStartStage;
		this.Users = data.Users;         
		this.Swimline = data.Swimline;    
		this.TypeTask  = data.TypeTask;    
		this.IdProject =data.IdProject;    
		this.ImageProject= data.ImageProject;  
		this.NameProject = data.NameProject; 
		this.ActiveBlokers= data.ActiveBlokers;
		if (Array.isArray(data.Blokers)){
			this.Blokers = [];
			data.Blokers.forEach(element => {
				let Event = new EventOfWorkItem(element,this)
				this.Blokers.push(Event);
			});
		}
		
		this.СommentsCount= data.СommentsCount;
		this.div.className = `Kanban typeTask${this.TypeTask.Id}`;
		this.div.id=`${this.Id}`
		this.div.draggable = true; 
		this.div.style.borderLeft = `7px solid ${this.TypeTask.Color}`;

		this.Parent.append(this.div);

	}

	refreshCard(){

		this.div.className = `Kanban typeTask${this.TypeTask.Id}`;
		if (this.blinking){
			this.div.classList.add("blink");
		}
		this.div.id=`${this.Id}`
		this.div.draggable = true; 
		this.div.style.borderLeft = `7px solid ${this.TypeTask.Color}`;
		this.show();
	}

	hide(){
		this.div.classList.add("blink");
		setTimeout(() => {
			this.div.remove()}, 
		10000);	
	}

	show(){
	   // Заголовок РабочегоЭлемента
	   let innerHTML = `<div class="KanbanName"><div>`;

	   this.Blokers.forEach((element)=>{
			if (!element.Finished){
				innerHTML += `<span class="badge badge-pill" style="background-color: ${TypeEventColor[element.TypeEvent-1]};font-size: unset;" >`+  calculationDateStatusString(element.StartDate) + `</span>`;
			};
	   });
	   innerHTML += `<a target="_blank" style="color:black" href="https://rer.bitrix24.ru/company/personal/user/`+ window.Bitrix24id + `/tasks/task/view/`+this.IdBitrix24+`/">№` + this.IdBitrix24 + `</a></div>`  ;
	   if (Array.isArray(this.Users)){
			this.Users.forEach(function(item, i, arr) {
			   innerHTML += `<img class="UserIcon" src=` + item.icon + `>` ;
		   });
	   }
	   innerHTML += `</div>`;
	   // KanbanDescription
	   innerHTML += `<div class="KanbanDescription"> <span class='nameClient'>${this.Name}</span>
					 <div class="KanbanDurationStatus">
					 <div class="KanbanNameProject"><div style="text-align: right;" class="onhover">`;
	   


		 
	   if (this.СommentsCount> 0) {
		   innerHTML += `<i class="fa fa-comments-o fa-lg" aria-hidden="true">`+this.СommentsCount+`</i>`;
	   }
   
	   let duration = "";
	   if (this.LeadTime != undefined) {
   
		   let tapeInfo = "badge-success";
		   if (this.TypeTask.SLA < this.LeadTime && (Math.round(this.TypeTask.SLA*0.8)) < this.LeadTime){
			   tapeInfo = "badge-danger";  
		   }else if ( (this.TypeTask.SLA*0.7) < this.LeadTime ){
			   tapeInfo = "badge-warning";  
		   }
		   duration = `<span style="margin-left: 3px; margin-right: 3px; font-size:100%;" class="badge `+ tapeInfo+ `" style="font-size: 100%;">`+  this.LeadTime + ` д. </span>`;
		   //duration += `<span style="margin-left: 3px; margin-right: 3px; font-size:100%;" class="badge badge-warning" style="font-size: 100%;">Ct:`+  this.LeadTime + ` д. </span>`;
	   }
   
	   	innerHTML += `` + duration +`<span class="projectName">` + this.NameProject + `</span> </div>`;
	   	//innerHTML += `</div>`; 
   
	    this.div.innerHTML = innerHTML;
		let btn = document.getElementById(`btnFinishWorkItem${this.Id}`);
		if (btn !=null) {
			btn.parentNode.removeChild(btn)
		}

		let btnFinish = document.createElement("button");
		btnFinish.type = "button";
		btnFinish.id = `btnFinishWorkItem${this.Id}`;
		btnFinish.className = "btn btn-light btn-xs";
		btnFinish.insertAdjacentHTML("beforeend",`<i class="fa fa-flag" aria-hidden="true"></i>`);
		btnFinish.style.padding = "1px";
		btnFinish.addEventListener("click" , ()=>{
			this.finishTask();
		});
		$(`#${this.Id} .KanbanNameProject .onhover`).prepend(btnFinish);
		/*document.getElementById(`finishTask${this.Id}`).addEventListener("click" , ()=>{
			
		});*/


		

	   //$("#"+this.Id).dblclick();

	}
	
	/*refresh(){

	}*/
	//Открытие информации по Рабочему элементу 
	StartModalWindow(){
		let thisElement = this;
		let SaveFunction = ()=>{

			deskTypesWorkItem.forEach((element)=>{
				if (element.Id === $(".taskKanbanTool #Type option:selected").val()){
					this.TypeTask = element;
					return
				}
			});
			
			this.save();
		};
		
		
		document.getElementById("saveTask").addEventListener("click",SaveFunction);
		let closeFunction = ()=>{
			document.getElementById("saveTask").removeEventListener("click",SaveFunction);
			$("#KanbanMore").hide("slow");
			$(".TitleBitrix24").empty();
			$(".Descripion").empty();
			$(".StageMore").empty();
			$(".BlokersMore").empty();
			$(".KanbanMoreComents").empty();
			document.getElementById('preloaderbg').style.display = 'none';
			document.getElementById("сloseButton").removeEventListener("click",closeFunction);
		}
		
		document.getElementById("сloseButton").addEventListener("click",closeFunction);



		$("#KanbanMore").show("slow");
			   $.ajax({
				type: "GET",
				url: "/KanbanToolAPI/task/"+ this.Id ,
				crossDomain : true,
				data: ""
		
		   }).done(function (Kanbans) {
			if( Kanbans.errorId != undefined && Kanbans.errorId == "401" ){
				window.location.replace("/login")
				return
			}
				$(".taskKanbanTool").attr("id", this.Id);
				$(".taskKanbanTool").data("id", this.Id);
				$(".taskKanbanTool").data("stage", this.Stage);
				$(".taskKanbanTool").data("Swimline",this.Swimline);

				$(".TitleBitrix24").append(`<h3><a target="_blank" href="https://rer.bitrix24.ru/company/personal/user/`+ window.Bitrix24id + `/tasks/task/view/`+Kanbans.IdBitrix24+`/">№` + Kanbans.IdBitrix24 + " - " + Kanbans.Name + "</a></h3>");
				$(".Descripion").append(Kanbans.DescriptionHTML);
	
				$("#Parametrs #Type").empty();
				let selected="";
				// Вывод типов работ
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
						$("#Parametrs #Type").append('<option style="background-color:'+element.Color + ' "' + selected + ' value="' + element.Id+ '">'+ element.Name + '</option>');
		
				});
				let DefaultButton = ``;
				/*<button type="button" class="btn btn-link btn-xs " 
									style="padding:1px" 
									data-toggle="modal" 
									data-target="#exampleModal">
										<i class="fa fa-pencil" aria-hidden="true"></i>
				</button> 
				<button type="button" class="btn btn-link btn-xs" style="padding:1px">
					<i class="fa fa-trash" aria-hidden="true"></i>
				</button> `*/

				// Вывод истории по этапам
				Kanbans.StagesHistory.forEach(function(element) {
	
					const startDate = (new Date(element.Start)).toLocaleDateString();
					let endDate,Stringdate
					if (element.End =="0001-01-01T00:00:00Z"){
						Stringdate = " настоящее время";
					}else{
						Stringdate = (new Date(element.End)).toLocaleDateString();
					}
	
					const StringSS = `
						<span id="`+element.Id+`" class="onhover"> 
							<b>`+element.Name +'</b> c ' + startDate + ' по ' + Stringdate + ` (${element.Duration} д.)`+ DefaultButton + `
						</span>` 
					$(".StageMore").append(StringSS);
				});
				// Добавить Событие
				let clickAddBtn = ()=> {
					let newEvent = new EventOfWorkItem({
						"Idtask": parseInt(thisElement.Id),
						"StartDate"	:new Date().toISOString()
					},thisElement);
					
					//newEvent.showPreview();
					newEvent.edit();
				};
		
				let addEvent = document.getElementById('ModalWindow__addEvent');
				document.getElementById("сloseButton").addEventListener("click",()=>{
					document.getElementById('ModalWindow__addEvent').removeEventListener('click', clickAddBtn);
				});
				
				addEvent.addEventListener('click', clickAddBtn);

				//TODO 
				if (Array.isArray(Kanbans.Blokers)){
					thisElement.Blokers = [];
					Kanbans.Blokers.forEach(elementK => {
						let Event = new EventOfWorkItem(elementK,thisElement)
						thisElement.Blokers.push(Event);
					});
				}
				// Вывод событий/Блокеров
				thisElement.Blokers.forEach(function(element) {
					element.showPreview();
				});
				// Вывод комментариев
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
											font-size: 100%;" 
					> `+ date.toLocaleDateString() +' ' +   date.toLocaleTimeString() + `
						</span>
						</div>
						<div class="CMdescription">`+ Message +`
						</div>
					</div>`)
				});
				
				document.getElementById('preloaderbg').style.display = 'none';
			
					
			});

	}

	blink(){
		this.blinking = true;
		this.div.classList.toggle("blink");
		setTimeout(() => {
			this.div.classList.toggle("blink")
			this.blinking= false}, 
		10000);
	}
	
	finishTask(){
		$.ajax({
			type: "POST",
			url: "/KanbanToolAPI/task.complete/"+this.Id,
			crossDomain : true,
			async:false,
			data: ""
	
	   }).done( (element)=> {
		if (element){
			if( element.errorId != undefined && element.errorId == "401" ){
				window.location.replace("/login")
				return 
			}
			this.div.classList.add("finished");

			setTimeout(() => {
				this.div.style.display = "none"
			}, 5000);
		}
	   });
	}

	save(){

		if (this.newTask){
			$.ajax({
				type: "POST",
				url: "/KanbanToolAPI/task.new/0",
				contentType: "application/json; charset=utf-8",
				crossDomain : true,
				processData: false,
				data: JSON.stringify(this,(key, value)=> {
					if (key === 'Blokers' || key === 'Parent'|| key === 'div') {
					  return undefined; 
					}
					return value;
				  }),
				async: true
		   }).done((element) => {
					if( element.errorId != undefined && element.errorId == "401" ){
						window.location.replace("/login")
						return false
					}
					this.newTask=false;
					this.updateData(element);
					this.refreshCard();

		   });		
		}else{
		   $.ajax({
				type: "POST",
				url: "/KanbanToolAPI/task.update/0",
				contentType: "application/json; charset=utf-8",
				crossDomain : true,
				processData: false,
				data: JSON.stringify(this,(key, value)=> {
					if (key === 'Blokers' || key === 'Parent') {
					  return undefined; 
					}
					return value;
				  }),
				async: true
			}).done((element) => {
				if (element){
					if( element.errorId != undefined && element.errorId == "401" ){
						window.location.replace("/login")
						return false
					}
				}
				this.refreshCard();
			});
		}

	}
	
}

class EventOfWorkItem {
	constructor(data,task) {
		this.Id = data.Id;
		this.Task = task;
		this.Idtask = data.Idtask;
		(data.Description!=undefined?this.Description= data.Description:this.Description = "");
		(data.Diside!=undefined?this.Diside= data.Diside:this.Diside = "")
		//TO DO 
		//(data.EndDate!=undefined?this.EndDate= "0001-01-01T00:00:00Z":this.EndDate=data.EndDate);
		if(this.Id == undefined){
			this.newEvent = true;
		}else{
			this.newEvent = false;
		}
		
		this.StartDate = new Date(data.StartDate)
		this.StartDateString = this.StartDate.toLocaleDateString()
		

		if (data.EndDate == "0001-01-01T00:00:00Z" || data.EndDate === undefined){
			this.EndDate = undefined;
			this.EndDateString = "настоящее время";
			this.Finished = false;
			this.Duration = calculationGapDatesString(this.StartDate,new Date());		
		}else{
			this.EndDate = new Date(data.EndDate)
			this.EndDateString = this.EndDate.toLocaleDateString();
			this.Finished = true;
			this.Duration = calculationGapDatesString(this.StartDate,this.EndDate);
		}
		this.TypeEvent = data.TypeEvent;

	}
	addInputRow(Title,Id,type,value,placeholder) {
		const row = `
		<div class="form-group">
			<label >`+ Title + `</label>
			<input type="`+ type + `" class="form-control" value="`+value + `" id="`+ Id+ `" placeholder="`+ placeholder+ `">
		</div>`;
		return row;
	}
	edit(){
		const footer = $(".modal-footer")
		const body = $(".modal-body");
		$("#exampleModalLabel").empty();
		body.empty();
		footer.empty();
		let form;
		form = `<input type="hidden"  id="BlokerId" value="${this.IdProject}" aria-hidden="true">`
		form = `
			<select class="form-control" id="BlokerType">
				<option style="background-color: ${TypeEventColor[0]}"    `+ (this.TypeEvent == 1 ? `selected="selected"` : ``)+` value="1">Блокировка</option>
				<option style="background-color: ${TypeEventColor[1]}" `+ (this.TypeEvent == 2 ? `selected="selected"` : ``)+`	value="2">Пауза</option>
				<option style="background-color: ${TypeEventColor[2]}"	  `+ (this.TypeEvent == 3 ? `selected="selected"` : ``)+`value="3">Дефект</option>
			</select>
		`;

		form += this.addInputRow("Причина","BlokerReason","text",this.Description,"");
		form += this.addInputRow("Решение","BlokerDecision","text",this.Diside,"");
		form += this.addInputRow("Время начала","BlokerStart","text",this.StartDate.toISOString(),"");
		if (!this.newEvent){
			if (this.Finished){
				form += this.addInputRow("Время окончания","BlokerEnd","text",this.EndDate.toISOString(),"");
			}else{
				form += this.addInputRow("Время окончания","BlokerEnd","text",(new Date()).toISOString(),"");
			}
		}else{
			form += this.addInputRow("Время окончания","BlokerEnd","text","","");
		}

		body.append(form);

		let btn = document.getElementById("btnSaveEvent");
		if (btn !=null) {
			btn.parentNode.removeChild(btn)
		}
		let btnSave = document.createElement("button");
		btnSave.className = "btn btn-primary";
		btnSave.dataset.dismiss = "modal";
		btnSave.innerText="Сохранить";
		btnSave.id ="btnSaveEvent";
		const SaveTask = ()=>{
			this.Description = document.getElementById("BlokerReason").value;
			this.Diside = $("#BlokerDecision")[0].value;
			this.StartDate = new Date($("#BlokerStart")[0].value);
			if($("#BlokerEnd")[0].value!=""){
				this.EndDate = new Date($("#BlokerEnd")[0].value);
				this.Finished = true;
			}else{
				this.EndDate = undefined;
				this.Finished = false;
			}
			this.TypeEvent = parseInt($("#BlokerType")[0].value);
			if(this.newEvent){
				this.Task.Blokers.push(this);
			}
			this.save();
			this.showPreview();
		};
		btnSave.removeEventListener("click" ,SaveTask ,false);
		btnSave.addEventListener("click" ,SaveTask ,false);

		let btnClose = document.createElement("button");
		btnClose.className = "btn btn-primary";
		btnClose.dataset.dismiss = "modal";
		btnClose.innerText="Отменить";
		btnClose.id ="сloseButton";
		const closeEvent = ()=>{
			let span = document.getElementById(`eventId${this.Id}`);
		
			if(span === null){
				span = document.createElement("span")
			}else{
				span.parentNode.removeChild(span);
			}
		};
		btnClose.removeEventListener("click" ,closeEvent ,false);
		btnClose.addEventListener("click" ,closeEvent ,false);

		footer.append(btnClose);
		footer.append(btnSave);

		
		$("#exampleModalLabel").append("Событие");

	}

	showPreview(){
		let span = document.getElementById(`eventId${this.Id}`);
		
		if(span === null){
			span = document.createElement("span")
		}else{
			span.innerHTML="";
		}

		let btn = document.getElementById("btnEditEvent");
		if (btn !=null) {
			btn.parentNode.removeChild(btn)
		}
		let btnEdit = document.createElement("button");
		btnEdit.type = "button"
		btnEdit.className = "btn btn-link btn-xs";
		btnEdit.dataset.toggle = "modal";
		btnEdit.id = "btnEditEvent";
		btnEdit.dataset.target = "#exampleModal";
		btnEdit.insertAdjacentHTML("beforeend",`<i class="fa fa-pencil" aria-hidden="true"></i>`);
		btnEdit.style.padding = "1px";
		btnEdit.addEventListener("click" , ()=>{
			this.edit()
		});

		let btnDelete = document.createElement("button");
		btnDelete.className = "btn btn-link btn-xs";
		btnDelete.style.padding = "1px";
		btnDelete.type = "button"
		btnEdit.insertAdjacentHTML("beforeend",`<i class="fa fa-trash" aria-hidden="true"></i>`);

		
		span.classList.add("onhover");
		span.style.backgroundColor = TypeEventColor[this.TypeEvent-1];

		span.id = `eventId${this.Id}`;
		span.innerHTML = `<b>${this.Description}</b> c ${this.StartDateString} по 
		${this.EndDateString} (${this.Duration})
		${this.Diside} </span>`;
		span.append(btnEdit);
		span.append(btnDelete);
		if (this.Finished){ 
			span.insertAdjacentHTML("afterbegin",`<i class="fa fa-check-square-o" aria-hidden="true"></i> `);
		}else{
			span.insertAdjacentHTML("afterbegin",`<i class="fa fa-exclamation-circle" aria-hidden="true"></i> `);
		}
		$(".BlokersMore").append(span);

	}

	// Блокеры
	save(th){
		let curretntTask = this.Task
		$.ajax({
			type: "POST",
			url: "/KanbanToolAPI/bloker.update/0",
			contentType: "application/json; charset=utf-8",
			crossDomain : true,
			processData: false,
			data: JSON.stringify(this,(key, value)=> {
				if (key === 'Task') {
				  return undefined; 
				}
				return value;
			  })
		}).done(function (element) {
			if( element.errorId != undefined && element.errorId == "401" ){
				window.location.replace("/login")
				return
			}
			curretntTask.refreshCard();
		});   
	}
}