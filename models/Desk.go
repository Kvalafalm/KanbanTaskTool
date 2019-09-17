package Models

import "github.com/astaxie/beego/orm"

type Desk struct {
	Id          int `orm:"auto"`
	Name        string
	Description string
	ProjectsB24 string
	Innerhtml   string
}

func init() {
	orm.RegisterModel(new(Desk))
}

func GetDeskFromDBById(id int) (desk Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Desk").Filter("id", id).All(&desk)
	return desk, err
}

func GetDesksFromDBById() (desks []Desk, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Desk").OrderBy("Name").All(&desks)
	return desks, err
}
