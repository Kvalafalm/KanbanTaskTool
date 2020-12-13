let TypeEventColor = [
	"rgba(248, 42, 162, 0.8)",// Блокер
	"rgba(248, 227, 42, 0.8)",// Пауза
	"rgba(33, 103, 207, 0.8)", //Дефект
]


class WorkItem {
	constructor(){
		this.div = document.createElement('div');
		this.isFullData = false;
		this.Template = "";
		this.Id = "";
		this.IdBitrix24 = "";
		this.IDDesk = "";
		this.Name = "";
		this.Stage = "";
		this.Swimline = "";     
		//this.DateStart = ""; 
		this.DueDate = undefined;
		this.Count  = 1;
		
		this.Users = new Array;         
		
		this.TypeTask  = "";    
		this.ClassOfService  = "";
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
		this.onPause = false; 
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
		this.calcMetrics()
	}

	updateData(data) {
		this.Id = data.Id;
		this.IdBitrix24 = data.IdBitrix24;
		this.Name = data.Name;
		if (this.Swimline != data.Swimline || this.Stage != data.Stage){
			this.Parent = $("#SL"+data.Swimline+" .Stage"+data.Stage+" .KanbanColumnContent");
			this.Parent.append(this.div);
		}

		this.Stage = data.Stage;
		this.IDDesk = data.IDDesk;
		this.DateStart = data.DateStart;
		this.LeadTime = data.LeadTime;
		this.CyrcleTime = data.CyrcleTime;
		
		this.LeadTimeInMinutes = data.LeadTimeInMinutes;
		this.WorkTimeInMinutes = data.WorkTimeInMinutes;
		this.FlowEffectives = Math.round(this.WorkTimeInMinutes / this.LeadTimeInMinutes*100); 


		if (data.DueDate == "0001-01-01T07:00:00+07:00" || data.DueDate === undefined){
			this.DueDate = undefined;
		}else{
			this.DueDate = new Date(data.DueDate)
		}  
		this.DateStartStage = data.DateStartStage;
		this.Users = data.Users;     
		this.ClassOfService = data.ClassOfService;  
		this.Swimline = data.Swimline;    
		this.TypeTask  = data.TypeTask;
	    
		this.IdProject =data.IdProject;    
		this.ImageProject= data.ImageProject;  
		this.NameProject = data.NameProject;
		if (data.StagesHistory != undefined) { 
			this.StagesHistory = data.StagesHistory;
		}
		this.ActiveBlokers= data.ActiveBlokers;
		this.onPause = false; 
		
		if (Array.isArray(data.Blokers)){
			this.Blokers = [];
			data.Blokers.forEach(element => {
				let Event = new EventOfWorkItem(element,this)
				this.Blokers.push(Event);
				if (Event.TypeEvent == 2 && !Event.Finished){
					this.onPause = true; 
				}
			});
		}
		
		this.СommentsCount= data.СommentsCount;
		//this.div.className = `Kanban typeTask${this.TypeTask.Id}`;
		this.div.className = `Kanban`;
		this.div.id=`${this.Id}`
		this.div.draggable = true; 
		//TODO
		if (
			this.Stage==1 
		 || this.Stage==2 
		 || this.Stage==3
		 || this.Stage==4
		 || this.Stage==5
		 || this.Stage==6
		 || this.Stage==7
		 || this.Stage==8
		 || this.Stage==9
		 || this.Stage==10
		 || this.Stage==11
		 || this.Stage==12
		 || this.Stage==13
		 || this.Stage==14
		 || this.Stage==15
		 || this.Stage==16
		 || this.Stage==17

		 ){
			this.div.style.borderLeft = `7px solid ${this.ClassOfService.Color}`;
		}else{
			this.div.style.borderLeft = `7px solid ${this.TypeTask.Color}`;
		}

		

		if (this.Id != 0 ){
			this.div.addEventListener("dragstart" , (e)=>{
				e.dataTransfer.setData("Text",this.Id);
			});
		}

		this.calcMetrics()
	}

	calcMetrics(){
		this.LeadTimeInMinutes = 0;
		this.WorkTimeInMinutes = 0;
		this.FlowEffectives= 100 ;
		this.StagesHistory.forEach((stage)=>{
				if (thisStageIsWork(stage.Idstage)){
					this.WorkTimeInMinutes += stage.Duration;	
				}
				if (thisStageIsOnDesk(stage.Idstage)){
					this.LeadTimeInMinutes += stage.Duration;	
				}		
			
		});

		this.Blokers.forEach((event)=>{
			if (!thisStageIsWork(event.Idstage)){
				this.WorkTimeInMinutes += event.WorkTimeInMinutes;	
			}else{
				this.WorkTimeInMinutes -= event.WorkTimeInMinutes;
			}
		});
		if(this.LeadTimeInMinutes > 0){
			this.FlowEffectives = Math.round(this.WorkTimeInMinutes / this.LeadTimeInMinutes*100); 
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

		//this.div.className = `Kanban typeTask${this.TypeTask.Id}`;
		this.div.className = `Kanban`;
		if (this.blinking){
			this.div.classList.add("blink");
		}

		if (
			   this.Stage==1 
			|| this.Stage==2 
			|| this.Stage==3
			|| this.Stage==4
			|| this.Stage==5
			|| this.Stage==6
			|| this.Stage==7
			|| this.Stage==8
			|| this.Stage==9
			|| this.Stage==10
			|| this.Stage==11
			|| this.Stage==12
			|| this.Stage==13
			|| this.Stage==14
			|| this.Stage==15
			|| this.Stage==16
			|| this.Stage==17

			){
			this.div.style.borderLeft = `7px solid ${this.ClassOfService.Color}`;
		}else{
			this.div.style.borderLeft = `7px solid ${this.TypeTask.Color}`;
		}
		this.show();
		this.div.id=this.Id
		this.div.draggable = true; 
	}
	getDataFromSrerver(){
		const thisObj = this
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', `/KanbanToolAPI/task/${this.Id}`, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 ){
				if (xhr.status != 200) {
					console.log( xhr.status + ': ' + xhr.statusText );
				} else {
					thisObj.updateData(JSON.parse(xhr.responseText));
					thisObj.isFullData = true;
					thisObj.refreshCard();
				}
			}
		}



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
					 <div class="KanbanNameProject"><div style="text-align: right;" class="onhover"><span class="projectName">${this.TypeTask.Name}</span><br>`;
		 
	   if (this.СommentsCount> 0) {
		   innerHTML += `<i class="fa fa-comments-o fa-lg" aria-hidden="true">`+this.СommentsCount+`</i>`;
	   }
   
	   let duration = "";
	   let NewIndicatorSLA = "";
	   let ProgressInfo = "bg-success";
	   let style = ``;

	   if (this.LeadTime != undefined) {
			let SLAleft = this.TypeTask.SLA - this.LeadTime;
		   let tapeInfo = "badge-success";
		   style = `style="width: ${100-Math.round(this.LeadTime/ this.TypeTask.SLA*100)}%;margin-left: auto;"`;

		   if (this.TypeTask.SLA < this.LeadTime){
			   tapeInfo = "badge-danger";  
			   ProgressInfo = "bg-danger";
			   style = `style="width: ${Math.round(this.LeadTime/ this.TypeTask.SLA*100)}%"`;
			   SLAleft = SLAleft*-1;
		   }else if ( (this.TypeTask.SLA*0.7) < this.LeadTime ){
			   tapeInfo = "badge-warning"; 
			   ProgressInfo = "bg-warning"; 
			   SLAleft = this.TypeTask.SLA - this.LeadTime;
		   }
		  
		   duration = `<span style="margin-left: 3px; margin-right: 3px; font-size:100%;" class="badge `+ tapeInfo+ `" style="font-size: 100%;">`+  this.LeadTime + ` д. </span>`;
		   NewIndicatorSLA = `
		   	<div class="progress" style="margin-top:2px;background-color: #a9abad; height:10px;font-size: .60rem;">
		   		<div class="progress-bar progress-bar-striped ${ProgressInfo}" role="progressbar" ${style}">
					<span style="margin:auto">`+  SLAleft + ` д.</span>
		   		</div>
		 	</div>`;
	   }
	   let DueDate
		if (this.DueDate != undefined){
			DueDate = `<span style="margin-left: 3px; margin-right: 3px; font-size:100%;" class="badge badge-primary" style="font-size: 100%;">${this.DueDate.toLocaleDateString()}</span>`
		}else{
			DueDate = "";
		}
	   	innerHTML += `` + DueDate+  duration +`<span class="projectName">` + this.NameProject + `</span> </div></div> ${NewIndicatorSLA}</div> `;
   
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
//		$(`#${this.Id} .KanbanNameProject .onhover`).prepend(btnFinish);
		this.div.querySelector('.onhover').prepend(btnFinish);
		let btnOnPause = document.createElement("button");
		btnOnPause.type = "button";
		btnOnPause.id = `btnOnPause${this.Id}`;
		btnOnPause.className = "btn btn-light btn-xs";
		if (this.onPause) {
			btnOnPause.insertAdjacentHTML("beforeend",`<i class="fa fa-play-circle-o" aria-hidden="true"></i>`);
			btnOnPause.addEventListener("click" , ()=>{
				this.SetPause(true);
			});
		}else{
			btnOnPause.insertAdjacentHTML("beforeend",`<i class="fa fa-pause-circle-o " aria-hidden="true"></i>`);
			btnOnPause.addEventListener("click" , ()=>{
				this.SetPause(false);
			});
		}

		btnOnPause.style.padding = "1px";
		//$(`#${this.Id} .KanbanNameProject .onhover`).prepend(btnOnPause);
		this.div.querySelector('.onhover').prepend(btnOnPause);
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
					this.ClassOfService = element;
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
				thisElement.updateData(Kanbans);
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
	
					if (element.Id == Kanbans.ClassOfService.Id){
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
				const StringSS = `
				<span class="onhover"> 
					<b> ${calculationGapDatesString(new Date(),new Date(),thisElement.WorkTimeInMinutes)} / ${calculationGapDatesString( new Date(),new Date(),thisElement.LeadTimeInMinutes)} = ${thisElement.FlowEffectives} % </b>
				</span>`
				$(".StageMore").append(StringSS);

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
						<span id="${element.Id}" class="onhover"> 
							<b>`+element.Name +'</b> c ' + startDate + ' по ' + Stringdate + ` (${calculationGapDatesString(element.Start,element.End,element.Duration)})`+ DefaultButton + `
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

	SetPause(setPause){
		if (setPause){
			this.Blokers.forEach((element)=>{
				if (element.TypeEvent==2){
					element.EndDate = new Date().toISOString();
					element.Finished = true;
					element.Diside = "Нашли время (btn)";
					element.save();
				}
			});
			this.onPause = false;
			this.refreshCard();
		}else{
			const pause = new EventOfWorkItem({
				"Idtask": parseInt(this.Id),
				"StartDate"	:new Date().toISOString()
			},this)
			pause.Description = "Нет времени (btn)";
			//this.Diside = $("#BlokerDecision")[0].value;
			pause.EndDate = undefined;
			pause.Finished = false;
			pause.TypeEvent = 2;
			pause.IdStage = this.Stage;
			this.Blokers.push(pause);
			this.onPause = true;
			pause.save();
			pause.showPreview();
		}

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
		this.IdStage = data.IdStage;
		this.Idtask = data.Idtask;
		(data.Description!=undefined?this.Description= data.Description:this.Description = "");
		(data.Diside!=undefined?this.Diside= data.Diside:this.Diside = "")
		//TO DO 
		if(this.Id == undefined){
			this.newEvent = true;
		}else{
			this.newEvent = false;
		}
		
		this.StartDate = new Date(data.StartDate)
		this.Durationinmin = data.Durationinmin

		if (!data.Finished){
			this.EndDate = undefined;
			this.Finished = false;
			this.Duration = calculationGapDatesString(this.StartDate,new Date(),data.Durationinmin);		
		}else{
			this.EndDate = new Date(data.EndDate)
			this.Finished = true;
			this.Duration = calculationGapDatesString(this.StartDate,this.EndDate,data.Durationinmin);
		}
		
		this.TypeEvent = data.TypeEvent;

		if (thisStageIsWork(parseInt(this.IdStage))){
			if (this.TypeEvent == 3){
				this.WorkTimeInMinutes = 0;
			} else {
				this.WorkTimeInMinutes = data.Durationinmin*-1;
			}
		}else{
			if (this.TypeEvent == 3){
				this.WorkTimeInMinutes = data.Durationinmin
			}else{
				this.WorkTimeInMinutes = 0
			}
		}


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
		const footer = $(".modal-footer");
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
		form += this.addInputRow("Время начала","BlokerStart","datetime-local",this.StartDate.getDateTimetoLocalString(),"");
		form += `
		<div class="form-group">
			<label >Завершенна</label>
			<input type="checkbox" class="form-check-input"id="BlokerFinished" ${this.Finished?` checked `:``}  >
		</div>`;

		if (!this.newEvent){
			if (this.Finished){
				form += this.addInputRow("Время окончания","BlokerEnd","datetime-local",this.EndDate.getDateTimetoLocalString(),"");
			}else{
				form += this.addInputRow("Время окончания","BlokerEnd","datetime-local",(new Date()).getDateTimetoLocalString(),"");
			}
		}else{
			form += this.addInputRow("Время окончания","BlokerEnd","datetime-local","","");
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
			if(document.getElementById("BlokerFinished").checked){
				this.EndDate = new Date($("#BlokerEnd")[0].value);
				this.Finished = true;
			}else{
				this.EndDate = undefined;
				this.Finished = false;
			}
			this.TypeEvent = parseInt($("#BlokerType")[0].value);
			if(this.newEvent){
				this.Task.Blokers.push(this);
				this.IdStage = this.Task.Stage;
			}
			if(this.TypeEvent==2 && !this.Finished){
				this.Task.onPause = true;
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
		//this.span = document.getElementById(`eventId${this.Id}`);
		
		if(this.span === undefined){
			this.span = document.createElement("span")
		}else{
			this.span.innerHTML="";
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
			this.edit();
		});

		const btnDelete = document.createElement("button");
		btnDelete.className = "btn btn-link btn-xs";
		btnDelete.style.padding = "1px";
		btnDelete.type = "button"
		btnDelete.insertAdjacentHTML("beforeend",`<i class="fa fa-trash" aria-hidden="true"></i>`);
		btnDelete.addEventListener("click" , ()=>{
			this.delete();
		});
		
		//span.classList.add("onhover");
		this.span.style.backgroundColor = TypeEventColor[this.TypeEvent-1];

		this.span.id = `eventId${this.Id}`;
		this.span.innerHTML = `<b>${this.Description}</b> c ${this.StartDate.toLocaleDateString()} по 
		${this.EndDate!=undefined?this.EndDate.toLocaleDateString():"настоящее время"} (${this.Duration})
		${this.Diside} `;
		this.span.append(btnEdit);
		this.span.append(btnDelete);
		if (this.Finished){ 
			this.span.insertAdjacentHTML("afterbegin",`<i class="fa fa-check-square-o" aria-hidden="true"></i> `);
		}else{
			this.span.insertAdjacentHTML("afterbegin",`<i class="fa fa-exclamation-circle" aria-hidden="true"></i> `);
		}
		$(".BlokersMore").append(this.span);

	}

	// Блокеры
	save(){
		//let curretntTask = this.Task;
		let EventTask = this;
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
			EventTask.IdStage = EventTask.Task.Stage;
			EventTask.Id = element.Id
			EventTask.showPreview();
			EventTask.Task.refreshCard();
		});   
	}

	delete(){
		let EventTask = this;
		EventTask.span.insertAdjacentHTML("beforeend",`<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`);
		$.ajax({
			type: "POST",
			url: "/KanbanToolAPI/bloker.delete/"+EventTask.Id,
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
			if( element.resultId != undefined && element.resultId === "401" ){
				window.location.replace("/login")
				return
			}else if(element.resultId != undefined && element.resultId === "100"){
				EventTask.clearSpan();
				EventTask.Task.Blokers.splice(EventTask.Task.Blokers.indexOf(EventTask),1);
				EventTask.Task.refreshCard();
			}else{
				EventTask.showPreview();
			}


		});   
	}
	clearSpan(){
		this.span.parentNode.removeChild(this.span);

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

function thisStageIsWork(Id){
	let isWorkStage = false
	window.KanbanDesk.Stages.forEach((Stage)=>{
		if (parseInt(Stage.Id)===Id){
			isWorkStage = Stage.WorkTime 
		}
	});
	return isWorkStage
}

function thisStageIsOnDesk(Id){
	let IsOnDesk = false
	window.KanbanDesk.Stages.forEach((Stage)=>{
		if (parseInt(Stage.Id)===Id && window.KanbanDesk.Endstage != Id ){
			IsOnDesk = true
		}
	});
	return IsOnDesk
}


function calculationGapDatesString(StartDate= new Date(), EndDate= new Date(), Minutes=undefined) {
	let times;
	if (Minutes == undefined ){
		times= Math.ceil(Math.abs(EndDate.getTime() - StartDate.getTime()) / (1000 * 60));
	}else{
		times = Minutes
	}
	

	if (Math.floor(times/(60*9)) > 0){
		days = Math.floor(times/(60*9))
		hours = Math.floor( (times - (days*60*9) )/60)
		/*let numWorkDays = 0;
		let checkDate =StartDate ;      
		while (checkDate <= EndDate) {
			// Skips Sunday and Saturday
			if (checkDate.getDay() !== 0 && checkDate.getDay() !== 6) {
				numWorkDays++;
			}
			checkDate = checkDate.addDays(1);
		}*/

		Result = days + " д. " + hours + " ч.";

	}else if(Math.floor(times/(60)) > 0 ){
		hours = Math.floor(Minutes/60)
		min = Math.floor( (Minutes - (hours*60) )/60)
		Result = hours + " ч. " + min + " м."  ;
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

Date.prototype.GetFormatDate = function () {
	
	const year = this.getFullYear();
	let month = this.getMonth()+1;
	
	if (month<10){
		month = "0"+month;
	}
	let day = this.getDate();
	if (day<10){
		day = "0"+day;
	}
	formatDate = `${year}-${month}-${day}`;
	return formatDate;
};

Date.prototype.getDateTimetoLocalString= function(){

	let formatterTime = new Intl.DateTimeFormat("ru", {
	hour: "numeric",
	minute:"numeric"
	});
	const year = this.getFullYear();
	let month = this.getMonth()+1;
	
	if (month<10){
		month = "0"+month;
	}
	let day = this.getDate();
	if (day<10){
		day = "0"+day;
	}

	return `${year}-${month}-${day}T${formatterTime.format(this)}`;
			   
}
