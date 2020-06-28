let TypeEventColor = [
	"rgba(248, 42, 162, 0.8)",// Блокер
	"rgba(248, 227, 42, 0.8)",// Пауза
	"rgba(33, 103, 207, 0.8)", //Дефект
]


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
		this.Users = new Array;         
		
		this.TypeTask  = "";    
		this.Class  = "";
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
			this.StartModalWindow();
		});
		//internal veriables
		if (this.Id != 0 ){
			this.div.addEventListener("dragstart" , (e)=>{
				e.dataTransfer.setData("Text",this.Id);
			});
		}
		this.div.addEventListener("dragenter" , (e)=>{ 
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

		this.blinking = false;

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
		this.Class = data.Class;  
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

		if (this.Id != 0 ){
			this.div.addEventListener("dragstart" , (e)=>{
				e.dataTransfer.setData("Text",this.Id);
			});
		}
	}

	thisElementHaveUser(id){
		let thisUserWeHave = false;
		this.Users.forEach((element)=>{
			if (element.id == id){
				thisUserWeHave = true
			}
		});
		
		return thisUserWeHave
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
			   innerHTML += `<img class="UserIcon User${item.id}" src="${item.icon}">` ;
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
	   }
   
	   	innerHTML += `` + duration +`<span class="projectName">` + this.NameProject + `</span> </div>`;
   
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

	}

	//Открытие информации по Рабочему элементу 
	StartModalWindow(){
		document.getElementById('preloaderbg2').style.display = 'block';
		let thisElement = this;
		let SaveFunction = ()=>{

			window.KanbanDesk.TypesWorkItem.forEach((element)=>{
				if (element.Id === $(".taskKanbanTool #Type option:selected").val()){
					this.TypeTask = element;
					return
				}
			});

			window.KanbanDesk.ClassWorkItem.forEach((element)=>{
				if (element.Id === $(".taskKanbanTool #ClassWorkItem option:selected").val()){
					this.Class = element;
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
				$(".TitleBitrix24").empty();
				$(".Descripion").empty();
				$(".StageMore").empty();
				$(".BlokersMore").empty();
				$(".KanbanMoreComents").empty();
				$(".taskKanbanTool").attr("id", this.Id);
				$(".taskKanbanTool").data("id", this.Id);
				$(".taskKanbanTool").data("stage", this.Stage);
				$(".taskKanbanTool").data("Swimline",this.Swimline);

				$(".TitleBitrix24").append(`<h3><a target="_blank" href="https://rer.bitrix24.ru/company/personal/user/`+ window.Bitrix24id + `/tasks/task/view/`+Kanbans.IdBitrix24+`/">№` + Kanbans.IdBitrix24 + " - " + Kanbans.Name + "</a></h3>");
				$(".Descripion").append(Kanbans.DescriptionHTML);
	
				$("#Parametrs #Type").empty();
				let selected="";
				// Вывод типов работ
				window.KanbanDesk.TypesWorkItem.sort(function (a, b) {
					if (a.Order > b.Order) {
					  return 1;
					}
					if (a.Order < b.Order) {
					  return -1;
					}
					return 0;
				});

				window.KanbanDesk.TypesWorkItem.forEach(function(element) {
	
						if (element.Id == Kanbans.TypeTask.Id){
							selected = 'selected="selected"';
						}else {
							selected = "";
						}
						$("#Parametrs #Type").append('<option style="background-color:'+element.Color + ' "' + selected + ' value="' + element.Id+ '">'+ element.Name + '</option>');
		
				});
				$("#Parametrs #ClassWorkItem").empty();
				window.KanbanDesk.ClassWorkItem.sort(function (a, b) {
					if (a.Order > b.Order) {
					  return 1;
					}
					if (a.Order < b.Order) {
					  return -1;
					}
					return 0;
				});

				window.KanbanDesk.ClassWorkItem.forEach(function(element) {
	
					if (element.Id == Kanbans.Class.Id){
						selected = 'selected="selected"';
					}else {
						selected = "";
					}
					$("#Parametrs #ClassWorkItem").append('<option style="background-color:'+element.Color + ' "' + selected + ' value="' + element.Id+ '">'+ element.Name + '</option>');
	
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
				
				document.getElementById('preloaderbg2').style.display = 'none';
			
					
			});

	}

	blink(){
		
		if (!this.blinking) {
			this.div.classList.add("blink");
			this.blinking = true;
			setTimeout(() => {
				this.div.classList.remove("blink")
				this.blinking= false}, 
			10000);
		}

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
					if (key === 'Blokers' || key === 'Parent'|| key === 'div') {
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
				if (this.Id == undefined){
					span.parentNode.removeChild(span);
				}
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
		const btnEdit = document.createElement("button");
		btnEdit.type = "button"
		btnEdit.className = "btn btn-link btn-xs";
		btnEdit.dataset.toggle = "modal";
		btnEdit.id = `btnEditEvent${this.Id}`;
		btnEdit.dataset.target = "#exampleModal";
		btnEdit.insertAdjacentHTML("beforeend",`<i class="fa fa-pencil" aria-hidden="true"></i>`);
		btnEdit.style.padding = "1px";
		btnEdit.addEventListener("click" , ()=>{
			this.edit()
		});

		const btnDelete = document.createElement("button");
		btnDelete.className = "btn btn-link btn-xs";
		btnDelete.style.padding = "1px";
		btnDelete.type = "button"
		btnDelete.insertAdjacentHTML("beforeend",`<i class="fa fa-trash" aria-hidden="true"></i>`);

		
		span.classList.add("onhover");
		span.style.backgroundColor = TypeEventColor[this.TypeEvent-1];

		span.id = `eventId${this.Id}`;
		span.innerHTML = `<b>${this.Description}</b> c ${this.StartDateString} по 
		${this.EndDateString} (${this.Duration})
		${this.Diside} `;
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
			this.Id = element.Id
			curretntTask.refreshCard();
		});   
	}
}

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

Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};