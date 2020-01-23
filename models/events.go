package Models

type EventType int

const (
	EVENT_JOIN = iota
	EVENT_LEAVE
	EVENT_MESSAGE
	EVENT_REMOVECARD
	EVENT_SESSIONEND //5
)

type Event struct {
	Type      EventType // JOIN, LEAVE, MESSAGE
	User      string
	Timestamp int // Unix timestamp (secs)
	Content   string
}
