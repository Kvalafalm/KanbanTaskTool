package models

import (
	"fmt"
	"strings"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type Stagehistory struct {
	Id            int `orm:"auto"`
	Idtask        int
	Idstage       int
	Start         time.Time
	End           time.Time
	Durationinmin int
	Finished      bool
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
    desk_stages.stage_id,
    CASE
        WHEN Stages.counttask IS NULL THEN 0
        ELSE Stages.counttask
    END AS counttask,
    Stages.date
	FROM
    kanbantool.desk_stages
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
    INNER JOIN kanbantool.desk_stages ON stagehistory.idstage = desk_stages.stage_id
    INNER JOIN kanbantool.stage ON stagehistory.idstage = stage.id
    WHERE
        stagehistory.start <= ?
            AND (stagehistory.end >= ?
            OR stagehistory.end IS NULL)
            AND desk_stages.desk_id = ?
    GROUP BY stagehistory.idstage
    ORDER BY stage.order DESC) AS Stages ON Stages.idstage = desk_stages.stage_id
	WHERE
    desk_stages.desk_id = ?`, endTimeUTC, endTimeUTC, endTimeUTC, param[`desk`], param[`desk`]).Values(&mapRaw)
	//.QueryRows(&raws)
	if err != nil && num > 0 {
		return mapRaw, err // slene
	}

	return mapRaw, nil
}

func GetCurrentTaskStage(TaskId int) (rowTaskHistory Stagehistory, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(&rowTaskHistory).Filter("idtask", TaskId).Filter("finished", false).All(&rowTaskHistory)
	if err != nil {
		fmt.Println(err)
		return rowTaskHistory, err
	}
	_, offset := rowTaskHistory.Start.Zone()
	Duration := time.Duration(int64(int(time.Second) * offset))

	rowTaskHistory.Start = rowTaskHistory.Start.UTC().Add(Duration)
	rowTaskHistory.End = rowTaskHistory.End.UTC().Add(Duration)
	return rowTaskHistory, nil
}

func SetCurrentTaskStage(stageHistoryRow Stagehistory) (err error) {
	database := orm.NewOrm()
	database.Using("default")
	Param := orm.Params{
		"idstage":       stageHistoryRow.Idstage,
		"idtask":        stageHistoryRow.Idtask,
		"start":         stageHistoryRow.Start,
		"end":           stageHistoryRow.End,
		"durationinmin": stageHistoryRow.Durationinmin,
		"Finished":      stageHistoryRow.Finished,
	}

	if stageHistoryRow.Id == 0 {
		_, err = database.Insert(&stageHistoryRow)
	} else {
		_, err = database.QueryTable(new(Stagehistory)).Filter("id", stageHistoryRow.Id).Update(Param)
	}
	if err != nil {
		beego.Error(err)
	}
	return nil
}

func GetTaskHistoryStages(TaskId int) (rowTaskHistory []Stagehistory, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Stagehistory)).Filter("idtask", TaskId).OrderBy("start").All(&rowTaskHistory)
	return rowTaskHistory, err
}
func GetAllFinishedStages() (rowTaskHistory []Stagehistory, err error) {
	database := orm.NewOrm()
	database.Using("default")

	_, err = database.QueryTable(new(Stagehistory)).OrderBy("start").All(&rowTaskHistory)
	return rowTaskHistory, err
}

func GetDataForSpectralChart(param map[string]string) (raws []orm.Params, err error) {
	database := orm.NewOrm()
	database.Using("default")

	var mapRaw []orm.Params

	num, err := database.Raw(`SELECT
	stageStart.idtask,
	stageStart.start as start,
	stageEnd.start as end,
	CEIL((TO_DAYS(stageEnd.start) - TO_DAYS(stageStart.start))) as duration,
	tasks.typetask
	FROM 
	(SELECT 
		stagehistory.idtask,
		stagehistory.start
	FROM
		kanbantool.stagehistory
	WHERE
		stagehistory.idstage = ?
			AND stagehistory.start >= ?
			AND stagehistory.start <= ?
	) as stageStart
		LEFT JOIN 
		(SELECT 
		stagehistory.idtask,
		MAX(stagehistory.start) as start 
	FROM
		kanbantool.stagehistory
	WHERE
		stagehistory.idstage = ?
	group by
		stagehistory.idtask) as stageEnd
		ON stageStart.idtask =stageEnd.idtask
		LEFT JOIN kanbantool.tasks
		ON stageStart.idtask = tasks.idtasks
	 WHERE   
	 tasks.finished
	 AND stageEnd.start IS NOT NULL 
	 ORDER BY 
	 stageEnd.start `, param[`startId`], param[`startDate`], param[`endDate`], param[`endId`]).Values(&mapRaw)
	if err != nil && num > 0 {
		return mapRaw, err
	}

	return mapRaw, nil
}
func GetDataForSpectralChartV2(param map[string]string) (raws []orm.Params, err error) {
	database := orm.NewOrm()
	database.Using("default")

	var mapRaw []orm.Params

	stages := strings.Split(param[`stages`], ",")
	var WhereText string
	firstRow := true
	for _, value := range stages {
		if firstRow {
			WhereText += `Where stagehistory.idstage = ` + value
			firstRow = false
		} else {
			WhereText += ` OR stagehistory.idstage = ` + value
		}
	}
	var text = `SELECT
		TableTasks.idtask,
		MIN(TableTasks.start) as start,
		MAX(TableTasks.end) as end,
		TableTasks.type
	FROM 
	(SELECT 
		stagehistory.idtask,
		stagehistory.start,
		stagehistory.idstage,
		stagehistory.end,
		tableTask.typetask as type,
		tableTask.finished
	FROM
		(SELECT 
			stagehistory.idtask,
			tasks.typetask,
			tasks.finished
		FROM
			kanbantool.stagehistory
		LEFT JOIN kanbantool.tasks ON stagehistory.idtask = tasks.idtasks
		WHERE
		stagehistory.idstage = ?
		AND stagehistory.start <= ?
		AND stagehistory.start >= ?
		GROUP BY stagehistory.idtask,tasks.typetask,tasks.finished) AS tableTask 
			LEFT JOIN
			kanbantool.stagehistory
		ON stagehistory.idtask = tableTask.idtask
		` + WhereText + `) as TableTasks
	GROUP BY 
		TableTasks.idtask,
		TableTasks.type`

	num, err := database.Raw(text, param[`endId`], param[`endDate`], param[`startDate`]).Values(&mapRaw)
	if err != nil && num > 0 {
		return mapRaw, err
	}

	return mapRaw, nil
}
func GetDateCommitmentPointList(iddesk int) (raws []orm.Params, err error) {
	database := orm.NewOrm()
	database.Using("default")

	var mapRaw []orm.Params

	num, err := database.Raw(`SELECT 
			stagehistory.*
		FROM 
			(SELECT 
				MIN(stagehistory.start) as start ,
				stagehistory.idtask,
				stagehistory.idstage,
				tasks.finished,
				tasks.stageid,
				desk_stages.desk_id
			FROM 
				kanbantool.stagehistory
				LEFT JOIN
					kanbantool.tasks
				ON 
				tasks.idtasks = stagehistory.idtask
			LEFT join
				kanbantool.desk_stages as desk_stages
			On 
				stagehistory.idstage = desk_stages.stage_id      
		WHERE NOT tasks.finished

		Group by
				stagehistory.idtask,
				stagehistory.idstage,
				tasks.finished,
				tasks.stageid,
				desk_stages.desk_id
		) as stagehistory 
			INNER JOIN 
			kanbantool.desk
			ON desk.startstage = stagehistory.idstage
			AND desk.endstage <> stagehistory.stageid
		WHERE 
			stagehistory.desk_id = ?
		;
		`, iddesk).Values(&mapRaw)
	if err != nil && num > 0 {
		return mapRaw, err
	}

	return mapRaw, nil
}

func GetDataForThroughPutChart(param map[string]string) (raws []orm.Params, err error) {
	database := orm.NewOrm()
	database.Using("default")

	var mapRaw []orm.Params
	var period string

	switch param[`Typeperiod`] {
	case "0":
		period = "DATE_FORMAT(max(stagehistory.start),'%m/%d')"
	case "1":
		period = `
		CASE 
			WHEN LENGTH(WEEK(max(stagehistory.start),1)) = 1 
		THEN
			CONCAT("0",WEEK(max(stagehistory.start),1))
		ELSE 
			WEEK(max(stagehistory.start),1)
		END `
		//period = "WEEK(max(stagehistory.start),1)"
	case "2":
		period = "DATE_FORMAT(max(stagehistory.start),'%m')" //MONTH(max(stagehistory.start))"
	case "3":
		period = "QUARTER(max(stagehistory.start))"
	default:
		period = "WEEK(max(stagehistory.start),1)"
	}
	var text = `Select 
			Data.Id,
			Data.type,
			CONCAT(Data.Year,"/",Data.period) as Period
		From 
		(SELECT 
		task.idtasks As Id,
		YEAR(max(stagehistory.start)) As Year,
		` + period + ` as Period,
		task.typetask as type
	FROM
		kanbantool.tasks AS task
			INNER JOIN
		(SELECT 
			desk_stages.stage_id
		FROM
			kanbantool.desk AS desk
		LEFT JOIN kanbantool.desk_stages AS desk_stages ON desk.id = desk_stages.desk_id
		WHERE
			desk.id = ?) AS DeskStages ON DeskStages.stage_id = task.stageid
			AND task.finished
			LEFT JOIN
		kanbantool.stagehistory AS stagehistory ON stagehistory.idtask = task.idtasks
			AND stagehistory.idstage = task.stageid
	WHERE
		stagehistory.start BETWEEN ? AND ?

	group by
		task.idtasks,
		task.typetask
	Order By
		Year,
		period) as Data`

	num, err := database.Raw(text, param[`desk`], param[`startDate`], param[`endDate`]).Values(&mapRaw)

	if err != nil && num > 0 {
		return mapRaw, err
	}

	return mapRaw, nil
}
