package Models

import (
	"fmt"
	"strconv"

	"github.com/astaxie/beego/orm"
)

type Tasks struct {
	Idtasks    int `orm:"auto"`
	Desk       int
	Idbitrix24 int
	Stageid    int
}

func init() {
	orm.RegisterModel(new(Tasks))

}

func GetTaskListFromDB(id int) (taskListFromDB []Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	cond := orm.NewCondition()
	deskStages, _ := GetDeskStagesFromDB(id)
	for _, Stage := range deskStages {
		cond = cond.Or("stageid", Stage.Idstages)
	}

	fmt.Println(database.QueryTable("Tasks").SetCond(cond).Count())
	database.QueryTable("Tasks").SetCond(cond).All(&taskListFromDB)

	return taskListFromDB, err
}

func GetTaskFromDB(id int) (taskListFromDB Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Tasks").Filter("Idtasks", id).All(&taskListFromDB)

	return taskListFromDB, err
}

func UpdateTaskInDB(task Tasks) (err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Tasks)).Filter("idtasks", task.Idtasks).Update(orm.Params{
		"stageid": task.Stageid,
	})

	if err == nil {
		return nil
	}
	return err
}

func SetTaskFromBitrix24(Id string, stage int) (id int, err error) {

	database := orm.NewOrm()
	database.Using("default")

	task := Tasks{}
	task.Idbitrix24, _ = strconv.Atoi(Id)
	task.Stageid = stage
	var idint int

	if created, id, err := database.ReadOrCreate(&task, "idbitrix24"); err == nil {
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
		idint = int(id)
	} else {
		return 0, err
	}

	return idint, nil

}
