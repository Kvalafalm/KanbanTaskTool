package controllers

import (
	service "KanbanTaskTool/Services"
	"encoding/json"
	"fmt"

	"strings"

	"github.com/astaxie/beego"
)

type KanbanToolGraphAPI struct {
	beego.Controller
}

func (this *KanbanToolGraphAPI) Get() {
	session := this.StartSession()
	userID := session.Get("User")
	logout := this.GetString("logout")
	if logout == "yes" {

		if userID != nil {
			session.Delete("User")
		}
		this.Redirect("/", 307)
		return
	}

}

func (this *KanbanToolGraphAPI) Post() {

	/*session := this.StartSession()
	User := session.Get("User")
	if User == nil {
		this.Redirect("/login", 307)
		return
	}*/

	TypeAction := strings.ToLower(this.Ctx.Input.Param(":Type"))
	var serv = service.KanbanServiceGraph{}
	switch TypeAction {

	case "cfd":
		param := service.Params{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &param)
		fmt.Println(param)
		data, err := serv.GetCFDData(param)

		if err != nil {

		}

		this.Data["json"] = data
		this.ServeJSON()

	case "schart":
		param := service.Params{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &param)
		fmt.Println(param)
		data, err := serv.GetSpectralChartData(param)

		if err != nil {

		}

		this.Data["json"] = data
		this.ServeJSON()
	default:
		this.Data["json"] = "{ \"error\" : \"Ошибка значения + " + TypeAction + " - " + this.Ctx.Input.Param(":id") + " \" }"
		this.ServeJSON()
	}

}
