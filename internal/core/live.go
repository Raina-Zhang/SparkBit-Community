package core

// LiveService 直播服务
type LiveService interface {
	GetLiveToken(roomName, userId, userName string, isHost bool) (string, error)
}
