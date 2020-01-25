package controllers

import (
	Models "KanbanTaskTool/Models"
	service "KanbanTaskTool/Services"
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

	var serv = service.KanbanService{}

	idInt, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))

	beego.Info("U:", User.(Models.User).Id, " ", User.(Models.User).Firstname, " - R:", TypeAction)

	switch TypeAction {

	case "tasklist":
		task, _ := serv.GetTaskList(idInt)
		this.Data["json"] = &task
		this.ServeJSON()

	case "ping":
		this.Data["json"] = "{ \"error\" : \"Все хорошо\", \"errorId\" : \"200\" }"
		this.ServeJSON()

	case "desklist":
		task, _ := serv.GetDeskList(idInt)
		this.Data["json"] = &task
		this.ServeJSON()

	case "desk":
		task, _ := serv.GetDeskById(idInt)
		this.Data["json"] = &task
		this.ServeJSON()

	case "stage":
		stages, _ := serv.GetStages(idInt)
		this.Data["json"] = &stages
		this.ServeJSON()

	case "task":

		taks, _ := serv.GetTask(idInt)
		this.Data["json"] = &taks
		this.ServeJSON()

	case "bloker":

		bloker, _ := serv.GetBloker(idInt)
		this.Data["json"] = &bloker
		this.ServeJSON()

	default:
		this.Data["json"] = "{ \"error\" : \"Ошибка значения + " + TypeAction + " - " + this.Ctx.Input.Param(":id") + " \", \"errorId\" : \"402\" }"
		this.ServeJSON()
	}

}

func (this *KanbanToolAPI) Post() {

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
	beego.Info("From user:", User.(Models.User).Id, " ", User.(Models.User).Firstname, " - request:", TypeAction, "; id-", this.Ctx.Input.Param(":id"))

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

	case "task.new":
		task := service.Task{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &task)
		id, _ := serv.NewTask(task, User.(Models.User))
		newTask, _ := serv.GetTaskForDesk(id)
		this.Data["json"] = &newTask
		this.ServeJSON()

	case "task.create":
		param := getParamBitrix24(this.Ctx.Input.Param(":Type"))
		if param["auth[application_token]"] == beego.AppConfig.String("BitrixWebHookIncoming") {
			serv.SetTaskByIdFromBitrix24(param["data[FIELDS_AFTER][ID]"])
		}
		this.ServeJSON()

	case "task.complete":
		id, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))
		err := serv.CompleteTask(id)
		if err != nil {
			this.Data["json"] = "false"
		} else {
			this.Data["json"] = "true"
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
