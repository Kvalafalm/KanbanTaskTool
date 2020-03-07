package controllers

import (
	model "KanbanTaskTool/models"
	"fmt"
	"strings"

	services "KanbanTaskTool/services"

	"github.com/astaxie/beego"
)

type BitrixControllerApi struct {
	beego.Controller
}

func (this *BitrixControllerApi) Get() {

	session := this.StartSession()
	User := session.Get("User")
	if User == nil {
		this.Redirect("/login", 307)
		return
	}

	TypeAction := strings.ToLower(this.Ctx.Input.Param(":Type"))

	var connectionBitrix24 = services.ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	switch TypeAction {

	case "task":
		//idInt, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))
		task, _ := connectionBitrix24.GetTask(this.Ctx.Input.Param(":id"))
		this.Data["json"] = &task
		this.ServeJSON()

	case "user":
		userB24, _ := connectionBitrix24.GetUser(this.Ctx.Input.Param(":id"))
		this.Data["json"] = &userB24
		this.ServeJSON()

	case "project":
		value, _ := connectionBitrix24.GetProjectListById(`["131", "125", "117", "111", "109"]`)
		this.Data["json"] = &value
		this.ServeJSON()

	case "tasklist":
		/*Массив проектов для постоянного мониторинга задач битрикса*/
		bitrix24Projects := [5]string{
			"131",
			"125",
			"117",
			"111",
			"109",
		}
		for _, project := range bitrix24Projects {
			tasks, _ := connectionBitrix24.GetTaskList(project)
			for _, _ = range tasks.Result {
				task := make(map[string]string)
				_, _ = model.SetTaskFromBitrix24(task)
			}
		}

		this.Data["json"] = "{ \"WellDone\" : \"Все ок° + " + TypeAction + " - " + this.GetString("Id") + " \" }"
		this.ServeJSON()
	default:
		this.Data["json"] = "{ \"error\" : \" Ошибка значения ° + " + TypeAction + " - " + this.GetString("Id") + " \" }"
		this.ServeJSON()
	}

}

// необходимо перенести в сервис
/*func GetTask(IdTask string, this *BitrixControllerApi, ConnectionBitrix24 services.ConnectionBitrix24) {

	if IdTask != "" {
		idInt, _ := strconv.Atoi(IdTask)
		task, err := ConnectionBitrix24.GetTask(idInt)
		if err == nil {
			(*this).Data["Task"] = task
		}
		(*this).Data["Comments"], _ = ConnectionBitrix24.GetCommentsById(IdTask)
	}
}*/

func (this *BitrixControllerApi) Post() {

	session := this.StartSession()
	User := session.Get("User")
	TypeAction := this.Ctx.Input.Param(":Type")

	if User == nil {
		this.Redirect("/login", 307)
		return
	}

	var ConnectionBitrix24 = services.ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	switch TypeAction {
	case "task":
		//idInt, _ := strconv.Atoi(this.Ctx.Input.Param(":id"))
		task, _ := ConnectionBitrix24.GetTask(this.Ctx.Input.Param(":id"))
		fmt.Println(this.Ctx.Input.Param(":id"))
		this.Data["json"] = &task
		this.ServeJSON()

	case "user":
		userB24, _ := ConnectionBitrix24.GetUser(this.GetString("id"))
		fmt.Println(this.Ctx.Input.Param(":id"))
		this.Data["json"] = &userB24
		this.ServeJSON()

	default:
		this.Data["json"] = "{ \"error\" : \"Ошибка + " + TypeAction + " - " + this.GetString("Id") + " \" }"
		this.ServeJSON()
	}

}
