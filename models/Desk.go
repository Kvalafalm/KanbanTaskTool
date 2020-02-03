package Models

import (
	"html/template"

	"github.com/astaxie/beego/orm"
)

type Desk struct {
	Id          int `orm:"auto"`
	Name        string
	Description string
	Projectsb24 string
	Innerhtml   template.HTML
	Startstage  int
	Endstage    int
}

type Deskstages struct {
	Iddesk   int `orm:"auto"`
	Idstages int
}

func init() {
	orm.RegisterModel(new(Desk))
	orm.RegisterModel(new(Deskstages))
}

func GetDeskFromDBById(id int) (desk Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")

	err = database.QueryTable("Desk").Filter("id", id).One(&desk)
	return desk, err
}

func GetDeskByIdFromBitrix24Projects(Projectsb24 string) (desk Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")
	err = database.QueryTable("Desk").Filter("projectsb24__contains", Projectsb24).One(&desk)
	if err != nil {
		return desk, err
	}
	return desk, nil
}

func GetDeskListFromDB() (desks []Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable("Desk").OrderBy("Name").All(&desks, "Id", "Name", "Description")
	return desks, err
}

func GetDeskStagesFromDB(iddesk int) (deskstages []Deskstages, err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable("deskstages").Filter("iddesk", iddesk).All(&deskstages)
	return deskstages, err
}
