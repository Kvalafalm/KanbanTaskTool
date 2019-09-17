package Models

import (
	"fmt"
	"time"

	"github.com/astaxie/beego/orm"
)

type Stagehistory struct {
	Id            int `orm:"auto"`
	Idtask        int
	Idstage       int
	Start         time.Time
	End           time.Time
	Durationinmin int
	Finised       bool
}

func init() {
	orm.RegisterModel(new(Stagehistory))

}
func GetCurrentTaskStage(TaskId int) (rowTaskHistory Stagehistory, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(&rowTaskHistory).Filter("idtask", TaskId).Filter("finised", false).All(&rowTaskHistory)
	if err != nil {
		fmt.Println(err)
		return rowTaskHistory, err
	}
	return rowTaskHistory, nil
}

func SetCurrentTaskStage(stageHistoryRow Stagehistory) (err error) {
	database := orm.NewOrm()
	database.Using("default")
	Param := orm.Params{
		"idstage":       stageHistoryRow.Idstage,
		"idtask":        stageHistoryRow.Idtask,
		"start":         stageHistoryRow.Start.Format(time.RFC3339),
		"end":           stageHistoryRow.End.Format(time.RFC3339),
		"durationinmin": stageHistoryRow.Durationinmin,
		"finised":       stageHistoryRow.Finised,
	}

	if stageHistoryRow.Id == 0 {
		_, err = database.Insert(&stageHistoryRow)
	} else {
		_, err = database.QueryTable(new(Stagehistory)).Filter("id", stageHistoryRow.Id).Update(Param)
	}
	if err != nil {
		fmt.Println(err)
	}
	return nil
}

func GetTaskHistoryStages(TaskId int) (rowTaskHistory []Stagehistory, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable("Stagehistory").Filter("idtask", TaskId).All(&rowTaskHistory)
	fmt.Println(rowTaskHistory)
	return rowTaskHistory, err
}
