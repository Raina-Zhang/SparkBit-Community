package web

type LiveTokenReq struct {
	BaseInfo `json:"-" binding:"-"`
	RoomName string `json:"room_name" binding:"required"`
}

type LiveTokenResp struct {
	Token string `json:"token"`
	Url   string `json:"url"`
}
