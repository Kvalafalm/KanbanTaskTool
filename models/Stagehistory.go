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
type RawStageHistoryForCFD struct {
	Idstage   int
	Counttask int
	Date      time.Time
}

func init() {
	orm.RegisterModel(new(Stagehistory))

}

func GetDataForCFDFromBD(param map[string]string) (raws []orm.Params, err error) {
	database := orm.NewOrm()
	database.Using("default")

	var mapRaw []orm.Params

	endTime, err := time.Parse(time.RFC3339, param[`date`])
	utcLocation, _ := time.LoadLocation("UTC")
	endTimeUTC := endTime.In(utcLocation)

	if err != nil {
		fmt.Println(err)
	}
	num, err := database.Raw(`SELECT 
    deskstages.idstages,
    CASE
        WHEN Stages.counttask IS NULL THEN 0
        ELSE Stages.counttask
    END AS counttask,
    Stages.date
FROM
    kanbantool.deskstages
        LEFT JOIN
    (SELECT 
        stagehistory.idstage,
            COUNT(stagehistory.idtask) AS counttask,
            MAX(CASE
                WHEN stagehistory.end IS NULL THEN ?
                ELSE stagehistory.end
            END) AS date
    FROM
        kanbantool.stagehistory
    INNER JOIN kanbantool.deskstages ON stagehistory.idstage = deskstages.idstages
    INNER JOIN kanbantool.stage ON stagehistory.idstage = stage.idstage
    WHERE
        stagehistory.start <= ?
            AND (stagehistory.end >= ?
            OR stagehistory.end IS NULL)
            AND deskstages.iddesk = ?
    GROUP BY stagehistory.idstage
    ORDER BY stage.order DESC) AS Stages ON Stages.idstage = deskstages.idstages
WHERE
    deskstages.iddesk = ?`, endTimeUTC, endTimeUTC, endTimeUTC, param[`desk`], param[`desk`]).Values(&mapRaw)
	//.QueryRows(&raws)
	if err != nil && num > 0 {
		return mapRaw, err // slene
	}

	return mapRaw, nil
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
	return rowTaskHistory, err
}
