package v1

import (
	. "github.com/alimy/mir/v5"
	"github.com/alimy/mir/v5/engine"
	"github.com/rocboss/paopao-ce/internal/model/web"
)

func init() {
	Entry(new(Live))
}

// Live LiveKit interface
type Live struct {
	Group `mir:"v1"`

	// GetLiveToken get livekit token
	GetLiveToken func(Post, *web.LiveTokenReq) *web.LiveTokenResp `mir:"/live/token"`
}
