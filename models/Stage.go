package models

import "github.com/astaxie/beego/orm"

type GroupWorkItemType int

const (
	GROUPBY_NOTHING = iota
	GROUPBY_TYPEWORKITEM
	GROUPBY_CLASSOFSERVICE
	GROUPBY_PROJECT
)

type Stage struct {
	Id          int `orm:"pk" json:"Id,string"`
	Name        string
	Description string
	Order       int
	Group       GroupWorkItemType
}

func init() {
	orm.RegisterModel(new(Stage))

}

func GetStageFromDB(id int) (Stage Stage, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Stage").Filter("Id", id).All(&Stage)
	return Stage, err
}

func GetStages() (Stages []Stage, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Stage").All(&Stages)
	return Stages, err
}
