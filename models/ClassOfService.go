package models

import (
	"github.com/astaxie/beego/orm"
)

//ClassOfService workItem
type ClassOfService struct {
	Id          int `orm:"pk;column(id)" json:"Id,string"`
	Name        string
	Description string
	Color       string
	Order       int
}

func init() {
	orm.RegisterModel(new(ClassOfService))
}

func getClass(id int) (data *ClassOfService, err error) {
	database := orm.NewOrm()
	database.Using("default")

	err = database.QueryTable(new(ClassOfService)).Filter("id", id).One(&data)

	return data, err
}
