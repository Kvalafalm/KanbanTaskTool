package main

import (
	_ "KanbanTaskTool/routers"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"github.com/astaxie/beego/session"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	orm.RegisterDriver("mysql", orm.DRMySQL)
	//parts := []string{os.Getenv("MYSQL_USER"), ":", os.Getenv("MYSQL_PASSWORD"),
	//	"@", os.Getenv("MYSQL_HOST"), ":3306/", os.Getenv("MYSQL_DATABASE")}
	//	orm.RegisterDataBase("default", "mysql", "kanbanUser:kanbanUser@/Kanbantool")
	orm.RegisterDataBase("default", "mysql", beego.AppConfig.String("MYSQL_USER")+":"+
		beego.AppConfig.String("MYSQL_PASSWORD")+"@/"+
		beego.AppConfig.String("MYSQL_DATABASE"))

	sessionconf := &session.ManagerConfig{
		CookieName:     beego.AppConfig.String("COOKIE_NAME"),
		CookieLifeTime: 3600,
		Maxlifetime:    600,
		Gclifetime:     600,
	}
	beego.GlobalSessions, _ = session.NewManager("memory", sessionconf)
	go beego.GlobalSessions.GC()
}

func main() {

	orm.Debug, _ = beego.AppConfig.Bool("debug")

	beego.Run()

}
