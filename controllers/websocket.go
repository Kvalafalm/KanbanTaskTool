package controllers

import (
	Models "KanbanTaskTool/Models"
	"encoding/json"
	"net/http"

	"github.com/astaxie/beego"
	"github.com/beego/samples/WebIM/models"
	"github.com/gorilla/websocket"
)

type KanbanToolWS struct {
	beego.Controller
}

func (this *KanbanToolWS) Get() {

	uname := this.GetString("uname")
	if len(uname) == 0 {
		this.Redirect("/", 302)
		return
	}

	this.TplName = "websocket.html"
	this.Data["IsWebSocket"] = true
	this.Data["UserName"] = uname
}

// Join method handles WebSocket requests for WebSocketController.
func (this *KanbanToolWS) Join() {

	session := this.StartSession()
	User := session.Get("User")
	if User == nil {
		this.Redirect("/login", 307)
		return
	}

	// Upgrade from http request to WebSocket.
	ws, err := websocket.Upgrade(this.Ctx.ResponseWriter, this.Ctx.Request, nil, 1024, 1024)
	if _, ok := err.(websocket.HandshakeError); ok {
		http.Error(this.Ctx.ResponseWriter, "Not a websocket handshake", 400)
		return
	} else if err != nil {
		beego.Error("Cannot setup WebSocket connection:", err)
		return
	}

	// Join chat room.
	FullUserName := User.(Models.User).Firstname + " " + User.(Models.User).Secondname
	Join(FullUserName, ws)
	defer Leave(FullUserName)
	this.TplName = "login.tpl"
	// Message receive loop.
	for {
		_, p, err := ws.ReadMessage()
		if err != nil {
			return
		}
		publish <- newEvent(models.EVENT_MESSAGE, FullUserName, string(p))
	}
}

// broadcastWebSocket broadcasts messages to WebSocket users.
func broadcastWebSocket(event models.Event) {
	data, err := json.Marshal(event)
	if err != nil {
		beego.Error("Fail to marshal event:", err)
		return
	}

	for sub := subscribers.Front(); sub != nil; sub = sub.Next() {
		// Immediately send event to WebSocket users.
		ws := sub.Value.(Subscriber).Conn
		if ws != nil {
			if ws.WriteMessage(websocket.TextMessage, data) != nil {
				// User disconnected.
				unsubscribe <- sub.Value.(Subscriber).Name
			}
		}
	}
}
