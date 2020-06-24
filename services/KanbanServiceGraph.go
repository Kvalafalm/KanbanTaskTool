package services

import (
	model "KanbanTaskTool/models"
	"strconv"
	"time"
)

type KanbanServiceGraph struct {
}

type Params struct {
	Startdate time.Time `json:"Startdate"`
	Enddate   time.Time `json:"Enddate"`
	Desk      string    `json:"Desk"`
	Stages    string    `json:"Stages"`
	StartID   string    `json:"StartId"`
	EndID     string    `json:"EndId"`
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
	endStage := params.EndID
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
			if firstIteration && value["stage_id"].(string) == endStage {
				deltaEndStageValue, _ = strconv.Atoi(value["counttask"].(string))
				firstIteration = false
			} else if !firstIteration && value["stage_id"].(string) == endStage {
				newvalue, _ := strconv.Atoi(value["counttask"].(string))
				newvalue = newvalue - deltaEndStageValue
				mm[value["stage_id"].(string)] = strconv.Itoa(newvalue)
			} else {
				mm[value["stage_id"].(string)] = value["counttask"].(string)
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
	paramMap[`endId`] = params.EndID
	paramMap[`startId`] = params.StartID
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

type TaskRow struct {
	TypeTask string `json:"typeTask"`
	Value    int    `json:"value"`
}

func (Cb *KanbanServiceGraph) GetSpectralChartData(params Params) (dataSpectralChart map[string]interface{}, err error) {

	paramMap := make(map[string]string)

	paramMap[`desk`] = params.Desk

	paramMap[`startDate`] = params.Startdate.Format("2006-01-02 15:04:05")
	paramMap[`endDate`] = params.Enddate.Format("2006-01-02 15:04:05")
	paramMap[`endId`] = params.EndID
	paramMap[`stages`] = params.Stages
	data, _ := model.GetDataForSpectralChartV2(paramMap)
	maxDay := 0
	tasksData := make(map[string]TaskRow)

	for _, raw := range data {

		if raw["end"] != nil && raw["start"] != nil {

			tasksData[raw["idtask"].(string)] = TaskRow{
				raw["type"].(string),
				DifferenceInDays(raw["start"].(string), raw["end"].(string)),
			}
		}
	}
	dataChart := make(map[int]map[string]int)
	for _, value := range tasksData {
		dayBe := false

		for _, rawGlobal := range dataChart {
			if value.Value == rawGlobal["day"] {
				rawGlobal["id"+value.TypeTask] = rawGlobal["id"+value.TypeTask] + 1
				dayBe = true
				break
			} else {
				dayBe = false
			}
		}

		if !dayBe {
			newRaw := make(map[string]int)
			newRaw["day"] = value.Value
			newRaw["id"+value.TypeTask]++
			dataChart[len(dataChart)] = newRaw
			if maxDay < value.Value {
				maxDay = value.Value
			}
		}

	}
	for i := 0; i <= maxDay; i++ {
		dayBe := false
		for _, rawGlobal := range dataChart {
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
			dataChart[len(dataChart)] = newRaw
		}
	}

	dataSpectralChart = make(map[string]interface{})
	dataSpectralChart["dataChart"] = dataChart
	dataSpectralChart["dataTask"] = tasksData

	return dataSpectralChart, nil
}

func (Cb *KanbanServiceGraph) GetThroughPutChartData(params Params) (data map[string]interface{}, err error) {
	paramMap := make(map[string]string)

	paramMap[`desk`] = params.Desk

	paramMap[`startDate`] = params.Startdate.Format("2006-01-02 15:04:05")
	paramMap[`endDate`] = params.Enddate.Format("2006-01-02 15:04:05")
	paramMap[`endId`] = params.EndID
	paramMap[`stages`] = params.Stages

	///data, _ := model.GetDataForSpectralChartV2(paramMap)

	return data, nil

}

func DifferenceInDays(start interface{}, end interface{}) (day int) {
	days := 0
	var f1 time.Time
	var t1 time.Time
	switch end := end.(type) {
	case string:
		f1, _ = time.Parse("2006-01-02 15:04:05", end)
	case time.Time:
		if end == (time.Time{}) {
			f1 = time.Now()
		} else {
			f1 = end
		}

	default:
		return 0
	}
	switch start := start.(type) {
	case string:
		t1, _ = time.Parse("2006-01-02 15:04:05", start)
	case time.Time:
		t1 = start

	default:
		return 0
	}
	endTime := time.Date(f1.Year(), f1.Month(), f1.Day(), 0, 0, 0, 0, time.UTC)
	startTime := time.Date(t1.Year(), t1.Month(), t1.Day(), 0, 0, 0, 0, time.UTC)
	if endTime.Before(startTime) {
		return 0
	}

	for {
		if startTime.Equal(endTime) {
			return days
		}
		if !isHoliday(startTime) {
			days++
		}
		startTime = startTime.Add(time.Hour * 24)
	}

}

func isHoliday(day time.Time) (t bool) {
	var Holidays = make([]time.Time, 30)
	Holidays = append(Holidays, time.Date(2019, 1, 1, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 1, 2, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 1, 3, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 1, 4, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 1, 7, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 1, 8, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 3, 8, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 5, 1, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 5, 2, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 5, 3, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 5, 9, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 5, 10, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 6, 12, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 11, 4, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2019, 12, 30, 0, 0, 0, 0, time.UTC))

	Holidays = append(Holidays, time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 1, 2, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 1, 3, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 1, 6, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 1, 8, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 1, 7, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 2, 24, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 3, 9, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 5, 1, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 5, 4, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 5, 5, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 5, 11, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 6, 12, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 11, 4, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 12, 30, 0, 0, 0, 0, time.UTC))

	if day.Weekday() == 6 || day.Weekday() == 0 {
		return true
	}

	for _, value := range Holidays {
		if day.Equal(value) {
			return true
		}
	}
	return false
}
