package Models

import (
	"fmt"
	"time"

	"github.com/astaxie/beego/orm"
)

type Bloker struct {
	Id          int `orm:"auto"`
	Idtask      int
	Description string
	Startdate   time.Time
	Enddate     time.Time
	Diside      string
	Finished    bool
}

func init() {
	orm.RegisterModel(new(Bloker))

}

func GetActiveBlokersFromDB(idtask int) (ActiveBloker Bloker, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("bloker").Filter("idtask", idtask).Filter("finished", false).All(&ActiveBloker)

	return ActiveBloker, err
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

		"idtask":      bloker.Idtask,
		"description": bloker.Description,
		"startdate":   bloker.Startdate.Format(time.RFC3339),
		"enddate":     bloker.Enddate.Format(time.RFC3339),
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

func SetBlokerFromBitrix24(Id string) (err error) {

	//database := orm.NewOrm()
	//database.Using("default")
	//task := Tasks{}
	//task.Idbitrix24, _ = strconv.Atoi(Id)
	//if created, id, err := database.ReadOrCreate(&task, "idbitrix24"); err == nil {
	//	if created {
	//		fmt.Println("New Insert an object. Id:", id)
	//	} else {
	//		fmt.Println("Get an object. Id:", id)
	//	}
	//} else {
	//	return err
	//}

	return nil

}
