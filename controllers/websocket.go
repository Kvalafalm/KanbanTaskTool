package controllers

import (
	"KanbanTaskTool/models"
	Models "KanbanTaskTool/models"
	"encoding/json"
	"net/http"

	"github.com/astaxie/beego"
	"github.com/gorilla/websocket"
)

//KanbanToolWS webSocetController
type KanbanToolWS struct {
	beego.Controller
}

//Get method
func (Cont *KanbanToolWS) Get() {

	uname := Cont.GetString("uname")
	if len(uname) == 0 {
		Cont.Redirect("/", 302)
		return
	}

	Cont.TplName = "websocket.html"
	Cont.Data["IsWebSocket"] = true
	Cont.Data["UserName"] = uname
}

//Join method handles WebSocket requests for WebSocketController.
func (Cont *KanbanToolWS) Join() {

	session := Cont.StartSession()
	User := session.Get("User")
	if User == nil {
		Cont.Redirect("/login", 307)
		return
	}

	// Upgrade from http request to WebSocket.
	ws, err := websocket.Upgrade(Cont.Ctx.ResponseWriter, Cont.Ctx.Request, nil, 1024, 1024)
	if _, ok := err.(websocket.HandshakeError); ok {
		http.Error(Cont.Ctx.ResponseWriter, "Not a websocket handshake", 400)
		return
	} else if err != nil {
		beego.Error("Cannot setup WebSocket connection:", err)
		return
	}

	// Join chat room.
	FullUserName := User.(Models.User).Firstname + " " + User.(Models.User).Secondname
	Join(User.(Models.User).Id, FullUserName, ws, session)
	defer Leave(User.(Models.User).Id)
	Cont.TplName = "login.tpl"
	// Message receive loop.
	for {
		_, p, err := ws.ReadMessage()
		if err != nil {
			return
		}
		publish <- newEvent(models.EVENT_MESSAGE, User.(Models.User).Id, FullUserName, string(p), nil)
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
		if sub.Value.(Subscriber).UserID != event.UserID {
			ws := sub.Value.(Subscriber).Conn
			if ws != nil {
				if ws.WriteMessage(websocket.TextMessage, data) != nil {
					// User disconnected.
					unsubscribe <- sub.Value.(Subscriber).UserID
				}
			}
		}
	}
}
