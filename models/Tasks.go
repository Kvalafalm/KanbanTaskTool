package models

import (
	"fmt"
	"strconv"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type Tasks struct {
	Idtasks        int `orm:"auto"`
	Title          string
	Desk           int
	Idbitrix24     int
	Swimline       int
	Stageid        int
	Finished       bool
	ClassOfService *ClassOfService `orm:"rel(fk);column(class_id)"`
	Typetask       *TypeWorkItem   `orm:"rel(fk);column(typetask)"`
	Blokers        []*Bloker       `orm:"reverse(many)"`
	Users          []*User         `orm:"rel(m2m)"`
	Duedate        time.Time       `orm:"null;column(duedate)"`
	Group          *Group          `orm:"rel(fk);column(idGroup)"`
	Сommentscount  string          `orm:"null"`
	SmallWorkItem  bool            `orm:"column(Smallworkitem)"`
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
	desk, _ := GetDeskFromDBById(id)
	for _, Stage := range desk.Stages {
		cond2 = cond2.Or("stageid", Stage.Id)
	}
	cond = cond.AndCond(cond2)

	database.QueryTable(new(Tasks)).SetCond(cond).All(&taskListFromDB)
	//fmt.Println(database.QueryTable(new(Tasks)).SetCond(cond).Count())
	for i, task := range taskListFromDB {
		database.LoadRelated(&task, "Blokers")
		taskListFromDB[i].Blokers = task.Blokers
		database.LoadRelated(&task, "ClassOfService")
		taskListFromDB[i].ClassOfService = task.ClassOfService
		database.LoadRelated(&task, "Typetask")
		taskListFromDB[i].Typetask = task.Typetask
		database.LoadRelated(&task, "Group")
		taskListFromDB[i].Group = task.Group
		database.LoadRelated(&task, "Users")
		taskListFromDB[i].Users = task.Users
		//database.LoadRelated(&task, "Class")
	}
	return taskListFromDB, err
}

func GetAllTaskListFromDB(id int) (taskListFromDB []Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	cond := orm.NewCondition()
	cond = cond.And("finished", false)

	cond2 := orm.NewCondition()
	desk, _ := GetDeskFromDBById(id)
	for _, Stage := range desk.Stages {
		cond2 = cond2.Or("stageid", Stage.Id)
	}
	cond = cond.AndCond(cond2)

	database.QueryTable(new(Tasks)).SetCond(cond).All(&taskListFromDB)

	return taskListFromDB, err
}

func GetTaskFromDB(id int) (taskFromDB Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Tasks)).Filter("Idtasks", id).All(&taskFromDB)
	database.LoadRelated(&taskFromDB, "Blokers")
	database.LoadRelated(&taskFromDB, "ClassOfService")
	database.LoadRelated(&taskFromDB, "Typetask")
	database.LoadRelated(&taskFromDB, "Users")
	return taskFromDB, err
}

func GetTaskFromDBbyB24(id int) (task Tasks, err error) {
	database := orm.NewOrm()
	database.Using("default")

	err = database.QueryTable(new(Tasks)).Filter("idbitrix24", id).One(&task, "Idtasks")
	return task, err
}

func UpdateTaskInDB(task Tasks) (err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Tasks)).Filter("idtasks", task.Idtasks).Update(orm.Params{
		"title":         task.Title,
		"stageid":       task.Stageid,
		"swimline":      task.Swimline,
		"typetask":      task.Typetask.Id,
		"class_id":      task.ClassOfService.Id,
		"Duedate":       task.Duedate.UTC(),
		"idGroup":       task.Group.ID,
		"Сommentscount": task.Сommentscount,
		"Smallworkitem": task.SmallWorkItem,
	})
	m2m := database.QueryM2M(&task, "Users")
	_, err = m2m.Clear()
	if err != nil {
		beego.Error(err)
		return err
	}

	_, err = m2m.Add(task.Users)
	if err == nil {
		return nil
	}
	beego.Error(err)
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
	typeWorkItem := TypeWorkItem{Id: idType}
	task.Typetask = &typeWorkItem
	idTmp, _ := strconv.Atoi(NewTask["Class"])
	task.ClassOfService = &ClassOfService{Id: idTmp}
	idTmp, _ = strconv.Atoi(NewTask["GROUP_ID"])
	task.Group = &Group{ID: idTmp}
	//getTypeTask(idType)
	task.SmallWorkItem = false
	if NewTask["GROUP_ID"] == "1" {
		task.SmallWorkItem = true
	}

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
