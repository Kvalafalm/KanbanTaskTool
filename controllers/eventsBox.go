package controllers

import (
	"container/list"
	"time"

	"github.com/astaxie/beego"
	"github.com/beego/samples/WebIM/models"
	"github.com/gorilla/websocket"
)

type Subscriber struct {
	Name string
	Conn *websocket.Conn // Only for WebSocket users; otherwise nil.
}

func init() {
	go EventsBox()
}

var (
	// Channel for new join users.
	subscribe = make(chan Subscriber, 100)
	// Channel for exit users.
	unsubscribe = make(chan string, 10)
	// Send events here to publish them.
	publish = make(chan models.Event, 100)
	// Long polling waiting list.
	waitingList = list.New()
	subscribers = list.New()
)

func EventsBox() {
	for {
		select {

		case sub := <-subscribe:
			subscribers.PushBack(sub) // Add user to the end of list.
			publish <- newEvent(models.EVENT_JOIN, sub.Name, "")
			beego.Info("New user:", sub.Name, ";WebSocket:", sub.Conn != nil)

		case event := <-publish:
			// Notify waiting list.
			for ch := waitingList.Back(); ch != nil; ch = ch.Prev() {
				ch.Value.(chan bool) <- true
				waitingList.Remove(ch)
			}

			broadcastWebSocket(event)
			models.NewArchive(event)

			if event.Type == models.EVENT_MESSAGE {
				beego.Info("Message from", event.User, ";Content:", event.Content)
			}
		case unsub := <-unsubscribe:
			for sub := subscribers.Front(); sub != nil; sub = sub.Next() {
				if sub.Value.(Subscriber).Name == unsub {
					subscribers.Remove(sub)
					// Clone connection.
					ws := sub.Value.(Subscriber).Conn
					if ws != nil {
						ws.Close()
						beego.Error("WebSocket closed:", unsub)
					}
					publish <- newEvent(models.EVENT_LEAVE, unsub, "") // Publish a LEAVE event.
					break
				}
			}
		}
	}
}

func Join(user string, ws *websocket.Conn) {
	subscribe <- Subscriber{Name: user, Conn: ws}
}

func Leave(user string) {
	unsubscribe <- user
}

func newEvent(ep models.EventType, user, msg string) models.Event {
	return models.Event{ep, user, int(time.Now().Unix()), msg}
}
