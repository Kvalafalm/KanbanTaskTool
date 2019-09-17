package controllers

import (
	"github.com/astaxie/beego"
)

type KanbanTool struct {
	beego.Controller
}

func (this *KanbanTool) Get() {

	session := this.StartSession()
	User := session.Get("User")
	if User == nil {
		this.Redirect("/login", 307)
		return
	}

	this.Data["Website"] = beego.AppConfig.String("WebSite")
	this.Data["Email"] = "415@rernsk.ru"

	this.TplName = "KanbanTool.tpl"

}
