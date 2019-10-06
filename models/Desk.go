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
}

func init() {
	orm.RegisterModel(new(Desk))
}

func GetDeskFromDBById(id int) (desk Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")

	err = database.QueryTable("Desk").Filter("id", id).One(&desk)
	return desk, err
}

func GetDeskListFromDB() (desks []Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Desk").OrderBy("Name").All(&desks, "Id", "Name", "Description")
	return desks, err
}
