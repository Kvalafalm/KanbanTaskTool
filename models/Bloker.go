package models

import (
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

//TypesEvent typeOfBlokers/Events
type TypesEvent int

//TypesEvent
const (
	EventBloker = iota
	EventPause
	EventFlaw
)

type Bloker struct {
	Id            int    `orm:"auto"`
	Idtask        *Tasks `orm:"rel(fk);column(idtask)"`
	IdStage       int
	Description   string
	Startdate     time.Time
	Enddate       time.Time
	Diside        string
	Finished      bool
	TypeEvent     TypesEvent
	Durationinmin int
}

func init() {
	orm.RegisterModel(new(Bloker))
}

func GetActiveBlokersFromDB(idtask int) (ActiveBlokers []Bloker, count int, err error) {
	database := orm.NewOrm()
	database.Using("default")
	var count64 int64
	count64, err = database.QueryTable(new(Bloker)).Filter("idtask", idtask).Filter("finished", false).All(&ActiveBlokers)

	return ActiveBlokers, int(count64), err
}

func BlokerDeleteInDB(BlokerId int) (err error) {
	database := orm.NewOrm()
	database.Using("default")
	if _, err := database.Delete(&Bloker{Id: BlokerId}); err != nil {
		return err
	}
	return nil
}

func GetBlokerFromDBbyId(id int) (bloker Bloker, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Bloker)).Filter("id", id).All(&bloker)

	return bloker, err
}

func GetAllBlokersFromDB(idtask int) (ActiveBloker []Bloker, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Bloker)).Filter("idtask", idtask).All(&ActiveBloker)

	return ActiveBloker, err
}

func UpdateBlokerInDB(bloker *Bloker) (err error) {
	database := orm.NewOrm()
	database.Using("default")
	emptydate := time.Time{}
	if bloker.Enddate != emptydate {
		bloker.Finished = true
	}
	Param := orm.Params{

		"idtask":        bloker.Idtask.Idtasks,
		"id_stage":      bloker.IdStage,
		"description":   bloker.Description,
		"startdate":     bloker.Startdate.UTC(),
		"enddate":       bloker.Enddate.UTC(),
		"diside":        bloker.Diside,
		"finished":      bloker.Finished,
		"TypeEvent":     bloker.TypeEvent,
		"durationinmin": bloker.Durationinmin,
	}
	if bloker.Id == 0 {
		var id int64
		id, err = database.Insert(bloker)
		bloker.Id = int(id)
	} else {
		_, err = database.QueryTable(new(Bloker)).Filter("id", bloker.Id).Update(Param)
	}
	if err != nil {
		beego.Error(err)
	}

	return nil
}

func GetAllFinishedEvents() (Blokers []Bloker, err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable(new(Bloker)).Filter("finished", true).All(&Blokers)
	return Blokers, err
}
