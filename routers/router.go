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
	beego.Router("/Bitrix24/:Type([\\w]/:id([0-9]+", &controllers.BitrixControllerApi{})
	beego.Router("/Bitrix24/", &controllers.BitrixControllerApi{})

	beego.Router("/login", &controllers.AuthController{})

	beego.Router("/", &controllers.MainController{})
}
