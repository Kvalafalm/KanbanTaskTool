package controllers

import (
	Models "KanbanTaskTool/Models"
	m "KanbanTaskTool/Models"
	services "KanbanTaskTool/Services"

	"github.com/astaxie/beego"
)

type AuthController struct {
	beego.Controller
}
type UserAnswer struct {
	UserName string `form:"UserName"`
	Password string `form:"Password"`
}

func (this *AuthController) Get() {
	session := this.StartSession()
	defer session.SessionRelease(this.Ctx.ResponseWriter)
	User := session.Get("User")

	logout := this.GetString("logout")
	server_domain := this.GetString("server_domain")

	if logout == "yes" {

		if User != nil {
			Leave(User.(Models.User).Firstname)
			session.Delete("User")
		}

		this.Redirect("/", 307)
		this.TplName = "login.tpl"
		return
	}

	if server_domain == "oauth.bitrix.info" {
		//User = services.GetUserOauth2Bitrix24();

		User, err := services.GetUserOauth2Bitrix24(this.GetString("code"))
		if err == nil {
			session.Set("User", User)
			this.Data["Website"] = beego.AppConfig.String("WebSite")
			this.Redirect("/KanbanTool/", 302)
		} else {
			this.Data["error"] = err
			this.TplName = "login.tpl"
		}
	}
	this.TplName = "login.tpl"
}

func (this *AuthController) Post() {

	session := this.StartSession()
	var UserAnswer UserAnswer
	errParse := this.ParseForm(&UserAnswer)

	if errParse != nil {
		this.Redirect("/login/", 302)
	}

	User, err := m.ValidUser(UserAnswer.UserName, UserAnswer.Password)
	if err == nil {
		session.Set("User", User)
		this.Data["Website"] = beego.AppConfig.String("WebSite")
		this.Redirect("/KanbanTool/", 302)
	} else {
		this.Data["error"] = err
		this.TplName = "login.tpl"
	}

}
