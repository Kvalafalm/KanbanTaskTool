package routers

import (
	"KanbanTaskTool/controllers"

	"github.com/astaxie/beego"
)

func init() {

	beego.Router("/KanbanTool/", &controllers.KanbanTool{})
	beego.Router("/KanbanToolAPI/:Type([\\w]/:id([0-9]+", &controllers.KanbanToolAPI{})

	beego.Router("/KanbanToolGraphAPI/:Type([\\w]/", &controllers.KanbanToolGraphAPI{})

	beego.Router("/KanbanToolGraph/", &controllers.KanbanToolGraph{})

	beego.Router("/login", &controllers.AuthController{})

	beego.Router("/", &controllers.MainController{})

	beego.Router("/ws", &controllers.KanbanToolWS{})
	beego.Router("/ws/join", &controllers.KanbanToolWS{}, "get:Join")
}
