package web

import (
	"strconv"

	"github.com/rocboss/paopao-ce/internal/conf"
	"github.com/rocboss/paopao-ce/internal/model/web"
)

func (s *privSrv) GetLiveToken(req *web.LiveTokenReq) (*web.LiveTokenResp, error) {
	if req.User == nil {
		return nil, web.ErrNoPermission
	}

	userId := strconv.FormatInt(req.User.ID, 10)
	userName := req.User.Username
	// Check if user is admin or specific role if needed to host
	isHost := req.User.IsAdmin // For demo, admins are hosts. Or maybe anyone can be host?
	// For PaoPao, maybe the room name is unique per user? Or user creates a room?
	// Let's assume room name is provided.

	token, err := s.ls.GetLiveToken(req.RoomName, userId, userName, isHost)
	if err != nil {
		return nil, err
	}

	return &web.LiveTokenResp{
		Token: token,
		Url:   conf.LiveKitSetting.Url,
	}, nil
}
