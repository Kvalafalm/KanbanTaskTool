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

	_, err = database.QueryTable("Stagehistory").Filter("idtask", TaskId).OrderBy("start").All(&rowTaskHistory)
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
				deskstages.iddesk
			FROM 
				kanbantool.stagehistory
				LEFT JOIN
					kanbantool.tasks
				ON 
				tasks.idtasks = stagehistory.idtask
			LEFT join
				kanbantool.deskstages as deskstages
			On 
				stagehistory.idstage = deskstages.idstages      
		WHERE NOT tasks.finished

		Group by
				stagehistory.idtask,
				stagehistory.idstage,
				tasks.finished,
				tasks.stageid,
				deskstages.iddesk
		) as stagehistory 
			INNER JOIN 
			kanbantool.desk
			ON desk.startstage = stagehistory.idstage
			AND desk.endstage <> stagehistory.stageid
		WHERE 
			stagehistory.iddesk = ?
		;
		`, iddesk).Values(&mapRaw)
	if err != nil && num > 0 {
		return mapRaw, err
	}

	return mapRaw, nil
}
