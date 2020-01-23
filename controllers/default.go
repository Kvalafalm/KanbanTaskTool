package controllers

import (
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (this *MainController) Get() {

	//FixProblems := fixProblems{}
	//FixProblems.FixDateProblemsWithStageHistory()

	session := this.StartSession()
	defer session.SessionRelease(this.Ctx.ResponseWriter)
	this.Data["Website"] = beego.AppConfig.String("WebSite")
	this.Data["Email"] = "415@rernsk.ru"
	this.Data["User"] = session.Get("User")
	this.TplName = "index.tpl"

}
