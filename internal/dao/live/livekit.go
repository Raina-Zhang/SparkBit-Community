package live

import (
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/rocboss/paopao-ce/internal/conf"
	"github.com/rocboss/paopao-ce/internal/core"
)

type liveKitService struct {
	apiKey    string
	secretKey string
}

func NewLiveService() core.LiveService {
	return &liveKitService{
		apiKey:    conf.LiveKitSetting.ApiKey,
		secretKey: conf.LiveKitSetting.SecretKey,
	}
}

func (s *liveKitService) GetLiveToken(roomName, userId, userName string, isHost bool) (string, error) {
	at := auth.NewAccessToken(s.apiKey, s.secretKey)
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     roomName,
	}
	if isHost {
		grant.RoomCreate = true
		grant.RoomAdmin = true
		grant.RoomRecord = true
	}
	at.AddGrant(grant).
		SetIdentity(userId).
		SetName(userName).
		SetValidFor(time.Hour * 24)

	return at.ToJWT()
}
