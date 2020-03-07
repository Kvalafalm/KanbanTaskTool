package controllers

import (
	Models "KanbanTaskTool/models"
	service "KanbanTaskTool/services"
	"encoding/json"

	"strings"

	"github.com/astaxie/beego"
)

type KanbanToolGraphAPI struct {
	beego.Controller
}

func (this *KanbanToolGraphAPI) Get() {
	session := this.StartSession()

	User := session.Get("User")
	if User == nil {
		errorJson := make(map[string]string)
		errorJson["error"] = "Ошибка авторизации + "
		errorJson["errorId"] = "401"
		this.Data["json"] = errorJson
		this.ServeJSON()
		return
	}
	defer session.SessionRelease(this.Ctx.ResponseWriter)

}

func (this *KanbanToolGraphAPI) Post() {

	session := this.StartSession()
	User := session.Get("User")
	TypeAction := strings.ToLower(this.Ctx.Input.Param(":Type"))
	if User == nil {
		errorJson := make(map[string]string)
		errorJson["error"] = "Ошибка авторизации + " + TypeAction + " - " + this.Ctx.Input.Param(":id")
		errorJson["errorId"] = "401"
		this.Data["json"] = errorJson
		this.ServeJSON()
		return
	}
	defer session.SessionRelease(this.Ctx.ResponseWriter)

	var serv = service.KanbanServiceGraph{}
	beego.Info("U:", User.(Models.User).Id, " ", User.(Models.User).Firstname, " - R:", TypeAction, "; id-", this.Ctx.Input.Param(":id"))

	switch TypeAction {

	case "cfd":
		param := service.Params{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &param)
		data, err := serv.GetCFDData(param)

		if err != nil {

		}

		this.Data["json"] = data
		this.ServeJSON()

	case "controlchart":
		param := service.Params{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &param)

		data, err := serv.ControlChart(param)

		if err != nil {

		}

		this.Data["json"] = data
		this.ServeJSON()

	case "schart":
		param := service.Params{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &param)

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
