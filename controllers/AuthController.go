package controllers

import (
	m "KanbanTaskTool/Models"

	"github.com/astaxie/beego"
)

type AuthController struct {
	beego.Controller
}
type UserAnswer struct {
	UserName string `form:"UserName"`
	Password string `form:"Password"`
}

func (c *AuthController) Get() {
	session := c.StartSession()
	userID := session.Get("User")
	logout := c.GetString("logout")
	if logout == "yes" {

		if userID != nil {
			session.Delete("User")
		}
		c.Redirect("/", 307)
		return
	}

	c.TplName = "login.tpl"
}

func (this *AuthController) Post() {

	session := this.StartSession()
	var UserAnswer UserAnswer
	errParse := this.ParseForm(&UserAnswer)

	if errParse != nil {
		this.Redirect("/login/", 302)
	}

	User, err := m.ValidUser(UserAnswer.UserName, UserAnswer.Password)
	if err == "" {
		session.Set("User", User)
		this.Data["Website"] = beego.AppConfig.String("WebSite")
		this.Redirect("/", 302)
	} else {
		this.Data["error"] = err
		this.TplName = "login.tpl"
	}

}
