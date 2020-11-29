package controllers

import (
	"KanbanTaskTool/models"
	model "KanbanTaskTool/models"
	s "KanbanTaskTool/services"
	"container/list"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/session"

	"github.com/gorilla/websocket"
)

// Subscriber users who subscube to websocetevent
type Subscriber struct {
	UserID int
	Name   string
	Conn   *websocket.Conn // Only for WebSocket users; otherwise nil.
}

func init() {
	go EventsBox()
}

var (
	// Channel for new join users.
	subscribe = make(chan Subscriber, 100)
	// Channel for exit users.
	unsubscribe = make(chan int, 10)
	// Send events here to publish them.
	publish = make(chan models.Event, 100)
	// Long polling waiting list.
	waitingList = list.New()
	subscribers = list.New()
)

// EventsBox storage to webSocetEvents
func EventsBox() {
	for {
		select {

		case sub := <-subscribe:
			subscribers.PushBack(sub) // Add user to the end of list.
			publish <- newEvent(models.EVENT_JOIN, sub.UserID, sub.Name, "", nil)
			//Делам запись что пользователь присоединился
			user := model.User{
				Id: sub.UserID,
			}
			user.Join()

			beego.Info("New user:", sub.Name, ";WebSocket:", sub.Conn != nil)

		case event := <-publish:
			// Notify waiting list.
			for ch := waitingList.Back(); ch != nil; ch = ch.Prev() {
				ch.Value.(chan bool) <- true
				waitingList.Remove(ch)
			}

			broadcastWebSocket(event)
			models.NewArchive(event)

			connectionBitrix24API := s.ConnectionBitrix24{
				beego.AppConfig.String("BitrixDomen"),
				beego.AppConfig.String("BitrixUser"),
				beego.AppConfig.String("BitrixWebHook")}
			connectionBitrix24API.SendMessage("chat6843", event.Content)

			if event.Type == models.EVENT_MESSAGE {
				beego.Info("Message from", event.User, ";Content:", event.Content)
			}
		case unsub := <-unsubscribe:
			for sub := subscribers.Front(); sub != nil; sub = sub.Next() {
				if sub.Value.(Subscriber).UserID == unsub {
					subscribers.Remove(sub)
					// Clone connection.
					ws := sub.Value.(Subscriber).Conn
					if ws != nil {
						ws.Close()
						beego.Error("WebSocket closed:", unsub)
					}
					publish <- newEvent(models.EVENT_LEAVE, unsub, sub.Value.(Subscriber).Name, "", nil) // Publish a LEAVE event.
					break
				}
			}
		}
	}
}

//Join this method subcsribe to websocet events
func Join(UserID int, user string, ws *websocket.Conn, ss session.Store) {
	subscribe <- Subscriber{UserID: UserID, Name: user, Conn: ws}
}

//Leave this method unsubcsribe to websocet events
func Leave(user int) {
	unsubscribe <- user
}

//newEvent this method generate new event
func newEvent(ep models.EventType, userID int, user string, msg string, Object interface{}) models.Event {
	return models.Event{ep, userID, user, int(time.Now().Unix()), msg, Object}
}
