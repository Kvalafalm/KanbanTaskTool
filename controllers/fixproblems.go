package controllers

import (
	model "KanbanTaskTool/models"
	"fmt"

	"github.com/astaxie/beego/orm"
)

type fixProblems struct {
}

func (this *fixProblems) FixDateProblemsWithStageHistory() {

	database := orm.NewOrm()
	database.Using("default")
	taskId := 460

	taskListFromDB := []model.Tasks{}
	_, _ = database.QueryTable("Tasks").All(&taskListFromDB)

	for _, _ = range taskListFromDB {
		stagesHistory, _ := model.GetTaskHistoryStages(taskId)

		NotFirstRwo := false
		previousRow := model.Stagehistory{}

		for _, currentRow := range stagesHistory {
			if NotFirstRwo {
				fmt.Println(currentRow.Start.Local())
				if currentRow.Start != previousRow.End {

					Param := orm.Params{
						"end": currentRow.Start,
					}

					_, _ = database.QueryTable("Stagehistory").Filter("id", previousRow.Id).Update(Param)
				}
				previousRow = currentRow
			} else {
				previousRow = currentRow
				NotFirstRwo = true
			}
		}
	}
}

func (this *fixProblems) FixDateProblemsWithFirstStageHistory() {

}
