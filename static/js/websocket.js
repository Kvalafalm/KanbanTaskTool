var socket;

$(document).ready(function () {
    // Create a socket
    socket = new WebSocket('ws://' + window.location.host + '/ws/join');
    // Message received on the socket
    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);

        console.log(data);

        switch (data.Type) {
        case 0: // JOIN
            Notify.generate(`<b>`+ data.User  + `</b> присоединился к нам `, '', 0);
            break;
        case 1: // LEAVE
            Notify.generate(`<b>`+ data.User  + `</b> покинул нас `, '', 0);
            break;
        case 2: // MESSAGE
            var username = document.createElement('strong');
            var content = document.createElement('span');

            username.innerText = data.User;
            content.innerText = data.Content;

            break;
        
        case 3: // EVENT_REMOVECARD
            //$(".Kanban #"++)
            break;
        }
    };
    socket.onclose = function (event){
        Notify.generate(`Ошибка соединения.`, '', 3);
    }

    // Send messages.
    /*var postConecnt = function () {
        var uname = $('#uname').text();
        var content = $('#sendbox').val();
        socket.send(content);
        $('#sendbox').val('');
    }

    $('#sendbtn').click(function () {
        postConecnt();
    });*/
});

Notify = {				
    TYPE_INFO: 0,				
    TYPE_SUCCESS: 1,				
    TYPE_WARNING: 2,				
    TYPE_DANGER: 3,								

    generate: function (aText, aOptHeader, aOptType_int) {					
        var lTypeIndexes = [this.TYPE_INFO, this.TYPE_SUCCESS, this.TYPE_WARNING, this.TYPE_DANGER];					
        var ltypes = ['alert-info', 'alert-success', 'alert-warning', 'alert-danger'];										
        var ltype = ltypes[this.TYPE_INFO];					

        if (aOptType_int !== undefined && lTypeIndexes.indexOf(aOptType_int) !== -1) {						
            ltype = ltypes[aOptType_int];					
        }										

        var lText = '';					
        if (aOptHeader) {						
            lText += "<h4>"+aOptHeader+"</h4>";					
        }					
        lText += "<p>"+aText+"</p>";

        var lNotify_e = $(`<div class="alert `+ltype+` alert-dismissible fade show"  role="alert" style="z-index:999999999999999;bottom:0%;right:0%;width:30%;position:absolute;">
        ` + lText + `
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div> `);		
        if (aOptType_int != 3 ){			
            setTimeout(function () {						
                lNotify_e.alert('close');					
            }, 15000);					
        }
        lNotify_e.appendTo($(".notifications"));				
    }			
};