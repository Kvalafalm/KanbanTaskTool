package controllers

import (
	service "KanbanTaskTool/services"
	"encoding/json"
	"strconv"
	s "strings"

	"fmt"
	"strings"

	"github.com/astaxie/beego"
)

type KanbanToolAPI struct {
	beego.Controller
}

func (this *KanbanToolAPI) Get() {
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
	TypeAction := strings.ToLower(this.Ctx.Input.Param(":Type"))
	var serv = service.KanbanService{}
	fmt.Println(TypeAction)
	switch TypeAction {

	case "tasklist":
		task, _ := serv.GetTaskList("0")
		this.Data["json"] = &task
		this.ServeJSON()

	case "stages":
		stages, _ := serv.GetStages("0")
		this.Data["json"] = &stages
		this.ServeJSON()

	case "task":
		idInt, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))

		taks, _ := serv.GetTask(idInt)
		this.Data["json"] = &taks
		this.ServeJSON()

	case "bloker":
		idInt, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))
		bloker, _ := serv.GetBloker(idInt)
		this.Data["json"] = &bloker
		this.ServeJSON()

	default:
		this.Data["json"] = "{ \"error\" : \"Ошибка значения + " + TypeAction + " - " + this.Ctx.Input.Param(":id") + " \" }"
		this.ServeJSON()
	}

}

func (this *KanbanToolAPI) Post() {

	//	session := this.StartSession()
	//	User := session.Get("User")
	//	if User == nil {
	//		this.Redirect("/login", 307)
	//	return
	//}

	TypeAction := strings.ToLower(this.Ctx.Input.Param(":Type"))
	var serv = service.KanbanService{}
	switch TypeAction {

	case "task.update":

		task := service.Tasks{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &task)
		err := serv.SetTask(task)
		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			this.Data["json"] = "{ \"successful\" : \"true\" }"
		}
		this.ServeJSON()

	case "task.create":
		param := getParamBitrix24(string(this.Ctx.Input.RequestBody))
		if param["auth[application_token]"] == beego.AppConfig.String("BitrixWebHookIncoming") {
			serv.SetTaskByIdFromBitrix24(param["data[FIELDS_AFTER][ID]"])
		}
		this.ServeJSON()

	case "bloker.update":
		bloker := service.Bloker{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &bloker)
		fmt.Println(bloker)
		err := serv.UpdateBloker(bloker)

		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			this.Data["json"] = "{ \"successful\" : \"true\" }"
		}
		this.ServeJSON()

	default:
		this.Data["json"] = "{ \"error\" : \"Ошибка значения + " + TypeAction + " - " + this.Ctx.Input.Param(":id") + " \" }"
		this.ServeJSON()
	}

}

func getParamBitrix24(dataIn string) (data map[string]string) {
	mapData := make(map[string]string)
	dataIn = s.Replace(dataIn, "%3A", ":", -1)
	dataIn = s.Replace(dataIn, "%5B", "[", -1)
	dataIn = s.Replace(dataIn, "%5D", "]", -1)
	dataIn = s.Replace(dataIn, "%2F", "/", -1)
	dataIn = s.Replace(dataIn, "%20", " ", -1)

	dateString := s.Split(dataIn, "&")
	for _, value := range dateString {
		date := s.Split(value, "=")
		mapData[date[0]] = date[1]
	}

	return mapData
}
