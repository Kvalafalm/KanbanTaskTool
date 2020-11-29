package main

import (
	model "KanbanTaskTool/models"
	_ "KanbanTaskTool/routers"
	"encoding/gob"
	"fmt"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/astaxie/beego/session/mysql"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	orm.RegisterDriver("mysql", orm.DRMySQL)
	orm.RegisterDataBase("default", "mysql", beego.AppConfig.String("MYSQL_USER")+":"+
		beego.AppConfig.String("MYSQL_PASSWORD")+"@/"+
		beego.AppConfig.String("MYSQL_DATABASE"))
	gob.Register(model.User{})
	name := "default"
	// Print log.
	verbose := true

	// Error.
	err := orm.RunSyncdb(name, false, verbose)
	if err != nil {
		fmt.Println(err)
	}

	beego.BConfig.WebConfig.Session.SessionProvider = "mysql"
	beego.BConfig.WebConfig.Session.SessionProviderConfig = beego.AppConfig.String("MYSQL_USER") + ":" +
		beego.AppConfig.String("MYSQL_PASSWORD") + "@/" +
		beego.AppConfig.String("MYSQL_DATABASE")
	beego.BConfig.WebConfig.Session.SessionGCMaxLifetime = 86400 * 30
	beego.BConfig.WebConfig.Session.SessionName = beego.AppConfig.String("COOKIE_NAME")

}

func main() {

	orm.Debug, _ = beego.AppConfig.Bool("debug")
	orm.DefaultTimeLoc = time.FixedZone("Novosibirsk", 25200)
	//	time.LoadLocation("Asia/Bangkok")
	beego.Run()

}
