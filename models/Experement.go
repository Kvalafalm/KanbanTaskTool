package models

import (
	"fmt"
	"time"

	"github.com/astaxie/beego/orm"
)

type Experement struct {
	Id                           int    `orm:"auto"`
	Desk                         *Desk  `orm:"rel(fk)"`
	Name                         string `orm:"size(100)"`
	ExperementBelive             string `orm:"size(2000)"`
	ExperementExpect             string `orm:"size(2000)"`
	ExperementSuccessfulCriteria string `orm:"size(2000)"`

	LerningObservedBehaivor string `orm:"size(2000)"`
	LerningWeWantSee        string `orm:"size(2000)"`
	LerningDiscovered       string `orm:"size(2000)"`

	Start   time.Time
	End     time.Time
	Finised bool
}

func init() {
	orm.RegisterModel(new(Experement))
}

//Experement save in DB
func (thisClass *Experement) Save() (err error) {
	database := orm.NewOrm()
	database.Using("default")

	if thisClass.End != (time.Time{}) {
		thisClass.Finised = true
	}

	Param := orm.Params{

		"Desk":                         thisClass.Desk.Id,
		"Name":                         thisClass.Name,
		"ExperementBelive":             thisClass.ExperementBelive,
		"ExperementExpect":             thisClass.ExperementExpect,
		"ExperementSuccessfulCriteria": thisClass.ExperementSuccessfulCriteria,

		"LerningObservedBehaivor": thisClass.LerningObservedBehaivor,
		"LerningWeWantSee":        thisClass.LerningWeWantSee,
		"LerningDiscovered":       thisClass.LerningDiscovered,
		"Start":                   thisClass.Start.UTC(),
		"End":                     thisClass.End.UTC(),
		"Finised":                 thisClass.Finised,
	}

	if thisClass.Id == 0 {
		var id int64
		id, err = database.Insert(thisClass)
		thisClass.Id = int(id)
	} else {
		_, err = database.QueryTable(new(Experement)).Filter("id", thisClass.Id).Update(Param)
	}
	if err != nil {
		fmt.Println(err)
	}

	return nil
}

/*func insert(this *Experement) (err error) {
	return err
}*/
func GetAllExperementFromDB(iddesk int) (Experements []Experement, err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable("Experement").Filter("desk_id", iddesk).All(&Experements)

	return Experements, err
}
