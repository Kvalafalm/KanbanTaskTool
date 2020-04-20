package models

import (
	"fmt"
	"time"

	"github.com/astaxie/beego/orm"
)

type Bloker struct {
	Id          int    `orm:"auto"`
	Idtask      *Tasks `orm:"rel(fk);column(idtask)"`
	Description string
	Startdate   time.Time
	Enddate     time.Time
	Diside      string
	Finished    bool
}

func init() {
	orm.RegisterModel(new(Bloker))
}

func GetActiveBlokersFromDB(idtask int) (ActiveBloker Bloker, count int, err error) {
	database := orm.NewOrm()
	database.Using("default")
	var count64 int64
	count64, err = database.QueryTable("bloker").Filter("idtask", idtask).Filter("finished", false).All(&ActiveBloker)

	return ActiveBloker, int(count64), err
}

func GetBlokerFromDBbyId(id int) (bloker Bloker, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("bloker").Filter("id", id).All(&bloker)

	return bloker, err
}

func GetAllBlokersFromDB(idtask int) (ActiveBloker []Bloker, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("bloker").Filter("idtask", idtask).All(&ActiveBloker)

	return ActiveBloker, err
}

func UpdateBlokerInDB(bloker Bloker) (err error) {
	database := orm.NewOrm()
	database.Using("default")
	emptydate := time.Time{}
	if bloker.Enddate != emptydate {
		bloker.Finished = true
	}
	Param := orm.Params{

		"idtask":      bloker.Idtask.Idtasks,
		"description": bloker.Description,
		"startdate":   bloker.Startdate.UTC(),
		"enddate":     bloker.Enddate.UTC(),
		"diside":      bloker.Diside,
		"finished":    bloker.Finished,
	}

	if bloker.Id == 0 {
		_, err = database.Insert(&bloker)
	} else {
		_, err = database.QueryTable(new(Bloker)).Filter("id", bloker.Id).Update(Param)
	}
	if err != nil {
		fmt.Println(err)
	}

	return nil
}
