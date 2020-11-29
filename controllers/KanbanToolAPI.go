package controllers

import (
	"KanbanTaskTool/models"
	Models "KanbanTaskTool/models"
	service "KanbanTaskTool/services"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	s "strings"

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
	beego.Info("Request:", TypeAction, "; id-", this.Ctx.Input.Param(":id"))
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

	case "serviceduration.update":
		err := serv.ServiceUpdateDuration()

		resultJSON := make(map[string]string)
		if err == nil {
			resultJSON["result"] = "successful"
			resultJSON["resultId"] = "100"
		} else {
			resultJSON["result"] = err.Error()
			resultJSON["resultId"] = "401"
		}
		this.Data["json"] = resultJSON
		this.ServeJSON()

	case "servicebitrix24.update":
		err := serv.ServiceUpdateDateFromBitrix24(idInt)

		resultJSON := make(map[string]string)
		if err == nil {
			resultJSON["result"] = "successful"
			resultJSON["resultId"] = "100"
		} else {
			resultJSON["result"] = err.Error()
			resultJSON["resultId"] = "401"
		}
		this.Data["json"] = resultJSON
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
	beego.Info("Request:", TypeAction, "; id-", this.Ctx.Input.Param(":id"))
	param, err := getParamBitrix24(string(this.Ctx.Input.RequestBody))

	if param["bitrix24request"] == "false" && User == nil && err != nil {
		errorJSON := make(map[string]string)
		errorJSON["error"] = "Ошибка авторизации + " + TypeAction + " - " + this.Ctx.Input.Param(":id")
		errorJSON["errorId"] = "401"
		this.Data["json"] = errorJSON
		this.ServeJSON()
		return
	}

	defer session.SessionRelease(this.Ctx.ResponseWriter)
	if User != nil {
		beego.Info("From user:", User.(Models.User).Id, " ", User.(Models.User).Firstname, " - request:", TypeAction, "; id-", this.Ctx.Input.Param(":id"))
	} else {
		beego.Info("Request:", TypeAction, "; id-", this.Ctx.Input.Param(":id"))
	}
	var serv = service.KanbanService{}
	switch TypeAction {

	case "task.update":
		task := service.Tasks{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &task)
		err := serv.SetTask(task)
		taskPublish, _ := serv.GetTask(task.ID)

		publish <- newEvent(
			models.EVENT_UPDATECARD,
			User.(Models.User).Id,
			User.(Models.User).Firstname,
			User.(Models.User).Firstname+" "+User.(Models.User).Secondname+" обновил(а) задаче №"+strconv.Itoa(taskPublish.IDBitrix24),
			&taskPublish)

		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			this.Data["json"] = "{ \"successful\" : \"true\" }"
		}
		this.ServeJSON()

	case "task.new":
		task := service.WorkItem{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &task)
		id, err := serv.NewTask(task, User.(Models.User))

		taskPublish, _ := serv.GetTask(id)
		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			publish <- newEvent(
				models.EVENT_NEWCARD,
				User.(Models.User).Id,
				User.(Models.User).Firstname,
				User.(Models.User).Firstname+" "+User.(Models.User).Secondname+" создал(а) новую задачу №"+strconv.Itoa(taskPublish.IDBitrix24),
				&taskPublish)

			this.Data["json"] = &taskPublish
		}

		this.ServeJSON()

	case "task.create":
		serv.SetTaskByIdFromBitrix24(param["data[FIELDS_AFTER][ID]"])
		this.ServeJSON()

	case "task.updateb24":
		ID, err := serv.GetIdtaskByBitrix24(param["data[FIELDS_AFTER][ID]"])
		if err != nil {
			beego.Error(err)
		} else {
			serv.CheckUpdateWorkItem(ID)
			if err != nil {
				beego.Error(err)
				return
			}
			task, err := serv.GetTask(ID)
			if err != nil {
				beego.Error(err)
				return
			}
			publish <- newEvent(
				models.EVENT_UPDATECARD,
				0,
				"",
				"Рабочий элемент №"+strconv.Itoa(task.IDBitrix24)+" в битрикс24 обновлен",
				&task)
			this.ServeJSON()
		}

	case "task.complete":
		id, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))
		err := serv.CompleteTask(id)
		publish <- newEvent(
			models.EVENT_REMOVECARD,
			User.(Models.User).Id,
			User.(Models.User).Firstname,
			User.(Models.User).Firstname+" "+User.(Models.User).Secondname+" завершил(а) задачу ",
			id)
		if err != nil {
			this.Data["json"] = "false"
		} else {
			this.Data["json"] = "true"
		}

		this.ServeJSON()
	case "stage.save":

		stage := service.Stages{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &stage)
		fmt.Println(stage)
		err := serv.StageSave(&stage)

		/*publish <- newEvent(
		models.EVENT_REMOVECARD,
		User.(Models.User).Id,
		User.(Models.User).Firstname,
		User.(Models.User).Firstname+" "+User.(Models.User).Secondname+" Обновил настройки этапа ",
		id)*/
		resultJSON := make(map[string]string)
		if err == nil {
			resultJSON["result"] = "successful"
			resultJSON["resultId"] = "100"
		} else {
			resultJSON["result"] = err.Error()
			resultJSON["resultId"] = "401"
		}
		this.Data["json"] = resultJSON
		this.ServeJSON()

		this.ServeJSON()

	case "bloker.update":
		bloker := service.Bloker{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &bloker)
		err := serv.BlokerUpdate(&bloker)

		taskPublish, _ := serv.GetTask(bloker.Idtask)
		publish <- newEvent(
			models.EVENT_UPDATECARD,
			User.(Models.User).Id,
			User.(Models.User).Firstname,
			User.(Models.User).Firstname+" "+User.(Models.User).Secondname+" измененил(а)/добавил(а) событие по задаче №"+strconv.Itoa(taskPublish.IDBitrix24),
			&taskPublish)
		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			this.Data["json"] = bloker
		}
		this.ServeJSON()

	case "bloker.delete":

		id, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))
		err := serv.BlokerDelete(id)
		bloker := service.Bloker{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &bloker)
		taskPublish, _ := serv.GetTask(bloker.Idtask)
		publish <- newEvent(
			models.EVENT_UPDATECARD,
			User.(Models.User).Id,
			User.(Models.User).Firstname,
			User.(Models.User).Firstname+" "+User.(Models.User).Secondname+" удалил событие по задаче №"+strconv.Itoa(taskPublish.IDBitrix24),
			&taskPublish)
		resultJSON := make(map[string]string)
		if err == nil {
			resultJSON["result"] = "successful"
			resultJSON["resultId"] = "100"
		} else {
			resultJSON["result"] = err.Error()
			resultJSON["resultId"] = "401"
		}
		this.Data["json"] = resultJSON
		this.ServeJSON()

	case "experement.new":
		experement := models.Experement{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &experement)
		experement.Save()
		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			this.Data["json"] = experement
		}
		this.ServeJSON()
	case "experement.update":
		experement := models.Experement{}
		json.Unmarshal(this.Ctx.Input.RequestBody, &experement)
		experement.Save()
		if err != nil {
			this.Data["json"] = "{ \"successful\" : \"false\" }"
		} else {
			this.Data["json"] = experement
		}
		this.ServeJSON()

	default:
		this.Data["json"] = "{ \"error\" : \"Ошибка значения + " + TypeAction + " - " + this.Ctx.Input.Param(":id") + " \" }"
		this.ServeJSON()
	}

}

func getParamBitrix24(dataIn string) (data map[string]string, err error) {
	mapData := make(map[string]string)
	if len(dataIn) > 0 {
		dataIn = s.Replace(dataIn, "%3A", ":", -1)
		dataIn = s.Replace(dataIn, "%5B", "[", -1)
		dataIn = s.Replace(dataIn, "%5D", "]", -1)
		dataIn = s.Replace(dataIn, "%2F", "/", -1)
		dataIn = s.Replace(dataIn, "%20", " ", -1)

		dateString := s.Split(dataIn, "&")
		if len(dateString) > 1 {
			for _, value := range dateString {
				date := s.Split(value, "=")
				mapData[date[0]] = date[1]
			}
		}
		if mapData["auth[application_token]"] != beego.AppConfig.String("BitrixWebHookIncomingNewTask") ||
			mapData["auth[application_token]"] != beego.AppConfig.String("BitrixWebHookIncomingUpdateTask") {
			mapData["bitrix24request"] = "true"
			return mapData, nil
		} else {
			mapData["bitrix24request"] = "false"
			err = errors.New("bad bitrix24 request")
		}

	}
	err = errors.New("is not bitrix24 request")
	return mapData, err
}
