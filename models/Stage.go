package models

import (
	"fmt"

	"github.com/astaxie/beego/orm"
)

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
	WorkTime    bool
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

func SetStages(stage Stage) (err error) {

	database := orm.NewOrm()
	database.Using("default")
	Param := orm.Params{
		"Name":        stage.Name,
		"Description": stage.Description,
		"Order":       stage.Order,
		"Group":       stage.Group,
		"WorkTime":    stage.WorkTime,
	}
	if stage.Id == 0 {
		var id int64
		id, err = database.Insert(stage)
		stage.Id = int(id)
	} else {
		_, err = database.QueryTable(new(Stage)).Filter("id", stage.Id).Update(Param)
	}

	if err != nil {
		fmt.Println(err)
	}

	return err
}
