package models

import (
	"github.com/astaxie/beego/orm"
)

type TypeWorkItem struct {
	Id          int `orm:"pk" json:"Id,string"`
	Name        string
	Description string
	Color       string
	Order       int
	SLA         int
	//Desk        []*Desk `orm:"reverse(many)"`
}

func init() {
	orm.RegisterModel(new(TypeWorkItem))
}

func (u *TypeWorkItem) TableName() string {
	return "typeworkitem"
}

func getTypeTask(id int) (typeWorkItem *TypeWorkItem, err error) {
	database := orm.NewOrm()
	database.Using("default")

	err = database.QueryTable(new(TypeWorkItem)).Filter("id", id).RelatedSel().One(typeWorkItem)

	return typeWorkItem, err
}
