package models

import "container/list"

type EventType int

const (
	EVENT_JOIN = iota
	EVENT_LEAVE
	EVENT_MESSAGE
	EVENT_REMOVECARD
	EVENT_UPDATECARD
	EVENT_SESSIONEND //5
	EVENT_NEWCARD
)

type Event struct {
	Type      EventType // JOIN, LEAVE, MESSAGE
	UserID    int
	User      string
	Timestamp int // Unix timestamp (secs)
	Content   string
	Object    interface{}
}

// Event archives.
var archive = list.New()

const archiveSize = 20

// NewArchive saves new event to archive list.
func NewArchive(event Event) {
	if archive.Len() >= archiveSize {
		archive.Remove(archive.Front())
	}
	archive.PushBack(event)
}

// GetEvents returns all events after lastReceived.
func GetEvents(lastReceived int) []Event {
	events := make([]Event, 0, archive.Len())
	for event := archive.Front(); event != nil; event = event.Next() {
		e := event.Value.(Event)
		if e.Timestamp > int(lastReceived) {
			events = append(events, e)
		}
	}
	return events
}
