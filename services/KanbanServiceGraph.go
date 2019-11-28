package Services

import (
	model "KanbanTaskTool/Models"
	"time"
)

type KanbanServiceGraph struct {
}

type Params struct {
	Startdate time.Time `json:"Startdate"`
	Enddate   time.Time `json:"Enddate"`
	Desk      string    `json:"Desk"`
}

func (Cb *KanbanServiceGraph) GetCFDData(params Params) (CFDdataReturn []map[string]string, err error) {

	paramMap := make(map[string]string)

	paramMap[`desk`] = params.Desk

	currentYear, currentMonth, currentDay := params.Startdate.Date()
	startDay := time.Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0, params.Startdate.Location())

	currentYear, currentMonth, currentDay = params.Enddate.Date()
	endDay := time.Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0, params.Enddate.Location())

	deltaDays := (endDay.Unix() - startDay.Unix()) / 60 / 60 / 24
	var day time.Duration
	for i := 0; i <= int(deltaDays); i++ {

		currentYear, currentMonth, currentDay = startDay.Add(time.Minute * 24 * 60 * day).Date()
		dateForSQL := time.Date(currentYear, currentMonth, currentDay, 23, 59, 59, 0, startDay.Add(time.Minute*24*60*day).Location())
		if dateForSQL.Weekday() == 0 || dateForSQL.Weekday() == 6 {
			day++
			continue
		}
		paramMap[`date`] = dateForSQL.Format(time.RFC3339)

		dataStage, _ := model.GetDataForCFDFromBD(paramMap)
		mm := make(map[string]string)

		mm[`date`] = dateForSQL.Format(time.RFC3339)
		for _, value := range dataStage {
			mm[value["idstages"].(string)] = value["counttask"].(string)
		}
		CFDdataReturn = append(CFDdataReturn, mm)
		day++
	}

	return CFDdataReturn, nil
}
