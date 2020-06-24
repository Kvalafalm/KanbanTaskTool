package models

import (
	"html/template"

	"github.com/astaxie/beego/orm"
)

//Desk model KanbanDesk
type Desk struct {
	Id             int `orm:"auto"`
	Name           string
	Description    string
	Projectsb24    string
	Innerhtml      template.HTML
	Startstage     int
	Endstage       int
	ClassOfService []*ClassOfService `orm:"rel(m2m)"`
	TypeWorkItems  []*TypeWorkItem   `orm:"rel(m2m)"`
	Stages         []*Stage          `orm:"rel(m2m)"`
}

func init() {
	orm.RegisterModel(new(Desk))
}

func GetDeskFromDBById(id int) (desk Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")

	err = database.QueryTable(new(Desk)).Filter("id", id).One(&desk)
	database.LoadRelated(&desk, "TypeWorkItems")
	database.LoadRelated(&desk, "Stages")
	database.LoadRelated(&desk, "ClassOfService")
	return desk, err
}

func GetDeskByIdFromBitrix24Projects(Projectsb24 string) (desk Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")
	err = database.QueryTable(new(Desk)).Filter("projectsb24__contains", Projectsb24).RelatedSel().One(&desk)
	if err != nil {
		return desk, err
	}
	return desk, nil
}

func GetDeskListFromDB() (desks []Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable(new(Desk)).OrderBy("Name").All(&desks, "Id", "Name", "Description")
	return desks, err
}
