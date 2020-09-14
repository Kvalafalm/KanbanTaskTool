//import { wo } from "Kanban v3";
let socket;
let Notify;
$(document).ready(function () {
    socket = getNewSocket('ws://' + window.location.host + '/ws/join');
});

function getNewSocket(site){
        socket = new WebSocket(site);
        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
    
            console.log(data);
    
            switch (data.Type) {
            case 0: // JOIN
                Notify = new NotifyClass(`<b>`+ data.User  + `</b> вошёл `, '', 0);
                break;
            case 1: // LEAVE
                Notify = new NotifyClass(`<b>`+ data.User  + `</b> вышел `, '', 0);
                break;
            case 2: // MESSAGE
                var username = document.createElement('strong');
                var content = document.createElement('span');
    
                username.innerText = data.User;
                content.innerText = data.Content;
    
                break;
    
            case 3: // EVENT_REMOVECARD
                window.KanbanDesk.WorkItems.forEach(element => {
                    if (element.Id == data.Object){
                        element.hide();
                        Notify = new NotifyClass(`Завершили карточку №${element.IdBitrix24}`, '', 1);
                    }
                });
                break;       
    
            case 4: // EVENT_UPDATEWORKITEM
                window.KanbanDesk.WorkItems.forEach(element => {
                    if (element.Id == data.Object.Id){
                        element.updateData(data.Object);
                        element.refreshCard();
                        element.blink();
                        Notify = new NotifyClass(data.Content, '', 1);
                    }
                });
                
                break;
            case 6: // EVENT_NEWCARD
                if ($("#SL"+data.Object.Swimline+" .Stage"+data.Object.Stage+" .KanbanColumnContent").length == 1) {
                    let newWorkItems = new WorkItem();
                    newWorkItems.updateData(data.Object);
                    newWorkItems.show();
                    newWorkItems.blink();
                    window.KanbanDesk.WorkItems.push(newWorkItems);
                    Notify = new NotifyClass(`Новая карточка №${data.Object.IdBitrix24}`, '', 1);
                }
                break;
                
            }
        };
        socket.onclose = function (event){
            Notify = new NotifyClass(`Ошибка соединения.`, '', 3);
            socket = getNewSocket(site);
            socket.onopen= ()=>{Notify.hideNoty()};	
        }        
        return  socket ;
}

class NotifyClass {				
								
    constructor(aText, aOptHeader, aOptType_int){
        const TYPE_INFO = 0;
        const TYPE_SUCCESS= 1;
        const TYPE_WARNING= 2;
        const TYPE_DANGER= 3;

        var lTypeIndexes = [TYPE_INFO, TYPE_SUCCESS, TYPE_WARNING, TYPE_DANGER];					
        var ltypes = ['alert-info', 'alert-success', 'alert-warning', 'alert-danger'];										
        var ltype = ltypes[TYPE_INFO];					

        if (aOptType_int !== undefined && lTypeIndexes.indexOf(aOptType_int) !== -1) {						
            ltype = ltypes[aOptType_int];					
        }										

        var lText = '';					
        if (aOptHeader) {						
            lText += "<h4>"+aOptHeader+"</h4>";					
        }					
        lText += "<p>"+aText+"</p>";

        this.lNotify_e = $(`<div class="alert `+ltype+` alert-dismissible fade show"  role="alert" style="z-index:999999999999999;bottom:0%;right:0%;width:30%;position:absolute;">
        ` + lText + `
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div> `);		
        if (aOptType_int != 3 ){			
            setTimeout( () => {						
                this.hideNoty();					
            }, 15000);					
        }
        this.lNotify_e.appendTo($(".notifications"));
    }

    hideNoty(){
        this.lNotify_e.alert('close');
    }	
};