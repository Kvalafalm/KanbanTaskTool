package models

import (
	"fmt"
	"strconv"

	"github.com/astaxie/beego/orm"
)

type Tasks struct {
	Idtasks    int `orm:"auto"`
	Title      string
	Desk       int
	Idbitrix24 int
	Swimline   int
	Stageid    int
	Finished   bool
	Typetask   *TypeWorkItem `orm:"rel(fk)"`
}

func init() {
	orm.RegisterModel(new(Tasks))
}

func GetTaskListFromDB(id int) (taskListFromDB []Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	cond := orm.NewCondition()
	cond = cond.And("finished", false)

	cond2 := orm.NewCondition()
	deskStages, _ := GetDeskStagesFromDB(id)
	for _, Stage := range deskStages {
		cond2 = cond2.Or("stageid", Stage.Idstages)
	}
	cond = cond.AndCond(cond2)
	fmt.Println(database.QueryTable(new(Tasks)).SetCond(cond).Count())
	database.QueryTable(new(Tasks)).SetCond(cond).RelatedSel().All(&taskListFromDB)

	return taskListFromDB, err
}

func GetTaskFromDB(id int) (taskListFromDB Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Tasks)).Filter("Idtasks", id).RelatedSel().All(&taskListFromDB)

	return taskListFromDB, err
}

func UpdateTaskInDB(task Tasks) (err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Tasks)).Filter("idtasks", task.Idtasks).Update(orm.Params{
		"stageid":  task.Stageid,
		"swimline": task.Swimline,
		"typetask": task.Typetask.Id,
	})

	if err == nil {
		return nil
	}
	return err
}

func FinishTask(task Tasks) (err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Tasks)).Filter("idtasks", task.Idtasks).Update(orm.Params{
		"finished": true,
	})

	if err == nil {
		return nil
	}
	return err
}

func SetTaskFromBitrix24(NewTask map[string]string) (id int, err error) {

	database := orm.NewOrm()
	database.Using("default")

	task := Tasks{}
	task.Idbitrix24, _ = strconv.Atoi(NewTask["idBitrix"])
	task.Stageid, _ = strconv.Atoi(NewTask["Stage"])
	task.Title = NewTask["Title"]
	idType, _ := strconv.Atoi(NewTask["Typetask"])
	task.Typetask, _ = getTypeTask(idType)
	task.Swimline, _ = strconv.Atoi(NewTask["Swimline"])

	var idint int
	if NewTask["CheckUnicColluumn"] != "" {
		if created, id, err := database.ReadOrCreate(&task, NewTask["CheckUnicColluumn"]); err == nil {
			if created {
				fmt.Println("New Insert an object. Id:", id)
			} else {
				fmt.Println("Get an object. Id:", id)
			}
			idint = int(id)
		} else {
			return 0, err
		}
	} else {
		id, err := database.Insert(&task)
		if err != nil {
			return 0, err
		}
		idint = int(id)
	}

	return idint, nil

}
