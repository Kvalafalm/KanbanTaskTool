package Services

import (
	model "KanbanTaskTool/Models"
	"strconv"
	"time"
)

type KanbanServiceGraph struct {
}

type Params struct {
	Startdate time.Time `json:"Startdate"`
	Enddate   time.Time `json:"Enddate"`
	Desk      string    `json:"Desk"`
	StartId   string    `json:"startId"`
	EndId     string    `json:"endId"`
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

	//TODO
	// Запрос из параметров доски какой последний этап чтобы в первый день вычесть его
	//
	endStage := "8"
	firstIteration := true
	deltaEndStageValue := 0
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
			if firstIteration && value["idstages"].(string) == endStage {
				deltaEndStageValue, _ = strconv.Atoi(value["counttask"].(string))
				firstIteration = false
			} else if !firstIteration && value["idstages"].(string) == endStage {
				newvalue, _ := strconv.Atoi(value["counttask"].(string))
				newvalue = newvalue - deltaEndStageValue
				mm[value["idstages"].(string)] = strconv.Itoa(newvalue)
			} else {
				mm[value["idstages"].(string)] = value["counttask"].(string)
			}
		}
		CFDdataReturn = append(CFDdataReturn, mm)
		day++
	}

	return CFDdataReturn, nil
}

func (Cb *KanbanServiceGraph) ControlChart(params Params) (dataControlChart []map[string]string, err error) {

	paramMap := make(map[string]string)

	paramMap[`desk`] = params.Desk

	paramMap[`startDate`] = params.Startdate.Format("2006-01-02 15:04:05")
	paramMap[`endDate`] = params.Enddate.Format("2006-01-02 15:04:05")
	paramMap[`endId`] = params.EndId
	paramMap[`startId`] = params.StartId
	data, _ := model.GetDataForSpectralChart(paramMap)
	for i, raw := range data {
		newRaw := make(map[string]string)
		durationInWorkDays := DifferenceInDays(raw["start"].(string), raw["end"].(string))
		newRaw["typetask"] = raw["typetask"].(string)
		newRaw["id"+raw["typetask"].(string)+"_x"] = strconv.Itoa(i)
		newRaw["id"+raw["typetask"].(string)+"_y"] = strconv.Itoa(durationInWorkDays)
		newRaw["id"+raw["typetask"].(string)+"_idtask"] = raw["idtask"].(string)
		dataControlChart = append(dataControlChart, newRaw)
	}

	return dataControlChart, nil
}

func (Cb *KanbanServiceGraph) GetSpectralChartData(params Params) (dataSpectralChart []map[string]int, err error) {

	paramMap := make(map[string]string)

	paramMap[`desk`] = params.Desk

	paramMap[`startDate`] = params.Startdate.Format("2006-01-02 15:04:05")
	paramMap[`endDate`] = params.Enddate.Format("2006-01-02 15:04:05")
	paramMap[`endId`] = params.EndId
	paramMap[`startId`] = params.StartId
	data, _ := model.GetDataForSpectralChart(paramMap)
	maxDay := 0
	for _, raw := range data {
		dayBe := false

		durationInWorkDays := DifferenceInDays(raw["start"].(string), raw["end"].(string))
		for _, rawGlobal := range dataSpectralChart {
			_, _ = strconv.Atoi(raw["duration"].(string))
			if durationInWorkDays == rawGlobal["day"] {
				rawGlobal["id"+raw["typetask"].(string)]++
				dayBe = true
				break
			} else {
				dayBe = false
			}
		}

		if !dayBe {
			newRaw := make(map[string]int)
			duration, _ := strconv.Atoi(raw["duration"].(string))
			newRaw["day"] = durationInWorkDays
			newRaw["id"+raw["typetask"].(string)]++

			dataSpectralChart = append(dataSpectralChart, newRaw)
			if maxDay < duration {
				maxDay = duration
			}
		}
	}

	for i := 0; i <= maxDay; i++ {
		dayBe := false
		for _, rawGlobal := range dataSpectralChart {
			if i == rawGlobal["day"] {
				dayBe = true
				break
			} else {
				dayBe = false
			}
		}

		if !dayBe {
			newRaw := make(map[string]int)
			newRaw["day"] = i
			dataSpectralChart = append(dataSpectralChart, newRaw)
		}
	}

	return dataSpectralChart, nil
}

func DifferenceInDays(start string, end string) (day int) {
	days := 0

	if start > end {
		return 0
	}

	f1, _ := time.Parse("2006-01-02 15:04:05", end)
	f := time.Date(f1.Year(), f1.Month(), f1.Day(), 0, 0, 0, 0, time.UTC)

	t1, _ := time.Parse("2006-01-02 15:04:05", start)
	t := time.Date(t1.Year(), t1.Month(), t1.Day(), 0, 0, 0, 0, time.UTC)
	for {
		if t.Equal(f) {
			return days
		}
		if t.Weekday() != 6 && t.Weekday() != 7 {
			days++
		}
		t = t.Add(time.Hour * 24)
	}

}
