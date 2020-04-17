package main

import (
	_ "KanbanTaskTool/routers"
	"fmt"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"github.com/astaxie/beego/session"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	orm.RegisterDriver("mysql", orm.DRMySQL)
	orm.RegisterDataBase("default", "mysql", beego.AppConfig.String("MYSQL_USER")+":"+
		beego.AppConfig.String("MYSQL_PASSWORD")+"@/"+
		beego.AppConfig.String("MYSQL_DATABASE"))

	name := "default"
	// Print log.
	verbose := true

	// Error.
	err := orm.RunSyncdb(name, false, verbose)
	if err != nil {
		fmt.Println(err)
	}

	sessionconf := &session.ManagerConfig{
		CookieName:     beego.AppConfig.String("COOKIE_NAME"),
		CookieLifeTime: 86400 * 30,
		Gclifetime:     3600,
		Maxlifetime:    86400 * 30,
	}
	beego.GlobalSessions, _ = session.NewManager("file", sessionconf)
	go beego.GlobalSessions.GC()
}

func main() {

	orm.Debug, _ = beego.AppConfig.Bool("debug")

	beego.Run()

}
