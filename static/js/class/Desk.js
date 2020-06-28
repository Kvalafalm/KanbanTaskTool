
class KanbanDesk {
	constructor(Id){
		this.div = document.createElement('div');
		this.Id = Id;
		this.Name = "";
		this.Des = "";     
		this.Users = ""; 
		this.TypesWorkItem = new Array;        
		this.ClassWorkItem = new Array;
		this.Users = new Array;
		this.WorkItems = new Array;
		this.Innerhtml = "";
		this.isLoading = true;
		this.Endstage = "";
		this.Startstage = "";
		this.Stages = new Array;

	}
	GetDeskDataFromServerAndRefresh(){
		$.ajax({
			type: "GET",
			url: "/KanbanToolAPI/desk/"+this.Id ,
			crossDomain : true,
			data: ""
	
		}).done( (desk)=> {
			if( desk.errorId != undefined && desk.errorId == "401" ){
				window.location.replace("/login")
				return
			}
			this.TypesWorkItem = desk.TypeWorkItems;
			this.ClassWorkItem = desk.ClassOfService;
			this.Innerhtml = desk.Innerhtml;
			this.Name = desk.Name;
			this.isLoading = false;
			this.Endstage = desk.Endstage;
			this.Startstage = desk.Startstage;
			this.Stages = desk.Stages;
			this.Stages.sort(function (a, b) {
				if (a.Order > b.Order) {
				  return 1;
				}
				if (a.Order < b.Order) {
				  return -1;
				}
				return 0;
			}); 
			this.StartLoading();
			this.Show();
			this.UpdateWorkItemList();
			
		});
	}

	GetDeskDataFromServer(){
		$.ajax({
			type: "GET",
			url: "/KanbanToolAPI/desk/"+this.Id ,
			crossDomain : true,
			data: ""
	
		}).done( (desk)=> {
			if( desk.errorId != undefined && desk.errorId == "401" ){
				window.location.replace("/login")
				return
			}
			this.TypesWorkItem = desk.TypeWorkItems;
			this.ClassWorkItem = desk.ClassOfService;
			this.Innerhtml = desk.Innerhtml;
			this.Endstage = desk.Endstage;
			this.Startstage = desk.Startstage;
			this.Stages = desk.Stages;
			this.Stages.sort(function (a, b) {
				if (a.Order > b.Order) {
				  return 1;
				}
				if (a.Order < b.Order) {
				  return -1;
				}
				return 0;
			}); 

			this.Name = desk.Name;
			this.isLoading = false;
			
		});
	}

	UpdateWorkItemList(){
		let thisClass = this
		$.ajax({
			type: "GET",
			url: "/KanbanToolAPI/taskList/"+this.Id,
			crossDomain : true,
			data: ""
	   }).done(function (Kanbans) {
			if( Kanbans.errorId != undefined && Kanbans.errorId == "401" ){
				window.location.replace("/login")
				return
			}


				thisClass.WorkItems = new Array;
				
				Kanbans.forEach(element=> {
					let workItem = new WorkItem();
					thisClass.WorkItems.push(workItem);
					workItem.updateData(element);
					workItem.show();
					
					thisClass.AddUser(workItem.Users);

				});
	
			   $(".KanbanColumnContent").each(function(){
					$(this).closest(".Swimline").children(".SwimlineName").children("#StageInfo" + this.parentElement.className.replace("Stage","")).children(".count").text(" ( "
									+ this.childElementCount + " / 0 ) ");
				});
	
				
				
	
				thisClass.StopLoading();
		});
	}
	AddUser(Users){
		let isUnicUser = true;
		if (Array.isArray(Users)){
			Users.forEach((NewUser)=>{
				this.Users.forEach((curUser)=>{
					if (curUser.id == NewUser.id || NewUser.id == "301") {
						isUnicUser = false;
					}

				});
				if(isUnicUser){
					this.Users.push(NewUser);
				}
			});

		}
	}
	StartLoading() {
		document.getElementById('preloaderbg').style.display = 'block';
	}
	StopLoading(){
		document.getElementById('preloaderbg').style.display = 'none';
	}
	InfoDesk(){

		if ($(".KanbanDesk__Info").css('display')==`none`){
			const info = $(".KanbanDesk__Info");
			info.empty();
			info.show();
			const ShowHideUserWorkItem = (userId)=> {
					this.WorkItems.forEach(element=>{
						if (element.thisElementHaveUser(userId)){
							element.div.style.display = "block";
						}else{
							element.div.style.display = "none";
						}
				});
			}
			const resetFiltr = ()=> {
				this.WorkItems.forEach(element=>{
						element.div.style.display = "block";
				});
			}
			const spanCancel = document.createElement("span");
			spanCancel.textContent = "Отменить фильтр"
			const btnReset = document.createElement("button");
			btnReset.type = "button";
			btnReset.id = `btnFinishWorkItem${this.Id}`;
			btnReset.className = "btn btn-light btn-xs";
			btnReset.insertAdjacentHTML("beforeend",`<i class="fa fa-ban"" aria-hidden="true"></i>`);
			btnReset.style.padding = "1px";
			btnReset.addEventListener("click" , resetFiltr);

			spanCancel.append(btnReset);	

			let row = document.createElement("span");
			row.insertAdjacentHTML("beforeend",`Юзер - всего РЭ/ РЭ в работе`);
			info.append(row);			

			this.Users.forEach((element )=>{
				let row = document.createElement("span");
				row.id = `userInfo${element.id}`;
				const countAll = $(".User"+element.id).length;
				let countWIP = 0;
				let startCount= false;
				this.Stages.forEach(elementStage=>{

					if (elementStage.Id == this.Endstage){
						return
					}

					if(startCount){
						countWIP = countWIP+ $(`.Stage${elementStage.Id} .User${element.id}`).length
					}
					if (elementStage.Id == this.Startstage){
						startCount = true;
					}



				});
				row.insertAdjacentHTML("beforeend",`<img class="UserIcon" src=${element.icon} style="float: left">${element.name} - ${countAll}/${countWIP}`);
				row.removeEventListener("click",ShowHideUserWorkItem);
				row.addEventListener("click",() => ShowHideUserWorkItem(element.id));
				info.append(row);
			});

			info.append(spanCancel);
		}else{
			$(".KanbanDesk__Info").empty();
			$(".KanbanDesk__Info").css("display", "none");
		}

	}
	Show(){
		$(".KanbanDeskCanvas").empty();
		$(".KanbanDeskCanvas").append(this.Innerhtml)

		//$(".SwimlineName").each(function () {
			$(".KanbanDeskCanvas").find(".StageInfo").addClass("onhover").append(`
			<span class="count"> (0 / 0)</span>
			<button type="button" class="btn btn-light btn-xs infoCollumn" style="padding:2px" ><i class="fa fa-info" aria-hidden="true"></i></button>
			<button type="button" class="btn btn-light btn-xs openOnFullWindow" style="padding:2px" ><i class="fa fa-clone" aria-hidden="true"></i></button>
			<button type="button" class="btn btn-light btn-xs addKanban" style="padding:2px"  ><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
			<button type="button" class="btn btn-light btn-xs showhideSL" style="padding:2px"><i class="fa fa-angle-double-up" aria-hidden="true"></i></button>
			`);
		//});

/*		$(".openOnFullWindow").click(function(){
			alert($(this).closest(".KanbanColumn").attr('id') );
		});
*/
		$(".showhideSL").click(function(){
			let element = $(this).closest(".Swimline").find(".SwimlineContent");
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
		this.setFunctionDADOnCollumn();   
	}

	setFunctionDADOnCollumn(){

		//ОтпустилиКарточку
		$("td").on("drop",(e)=>{
	
		  e.preventDefault();
		  let data=e.originalEvent.dataTransfer.getData("Text");
		  let fromId = $("#"+data).closest(".KanbanColumnContent")[0].parentElement.id.replace("Stage","");
		  
		  if (
			  fromId != CurrentStageDrop.id.replace("Stage","") 
			  ||  $("#"+data).closest(".Swimline")[0].id.replace("SL","") != CurrentStageDrop.parentElement.parentElement.id.replace("SL","")
			  ) {
				  this.WorkItems.forEach(element => {
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
		  $(CurrentStageDrop).find(".count").text("( "+ $(e.currentTarget).find(".KanbanColumnContent")[0].childElementCount + "/0)");
		  
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