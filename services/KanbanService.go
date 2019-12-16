package Services

import (
	model "KanbanTaskTool/Models"
	"html/template"
	"strconv"
	"time"

	"fmt"
	str "strings"

	"github.com/astaxie/beego"
)

type KanbanService struct {
}
type Bloker struct {
	Id          int       `json:"Id,string"`
	Idtask      int       `json:"Idtask,string"`
	Description string    `json:"Description"`
	Startdate   time.Time `json:"Startdate"`
	Enddate     time.Time `json:"Enddate"`
	Diside      string    `json:"Diside"`
	Finished    bool      `json:"Finished,string"`
}

type Tasks struct {
	ID             int       `json:"Id,string"`
	IDBitrix24     int       `json:"IdBitrix24"`
	Name           string    `json:"Name"`
	Stage          int       `json:"Stage,string"`
	DateSart       time.Time `json:"DateSart"`
	DateStartStage time.Time `json:"DateStartStage"`
	Users          []User    `json:"Users"`
	ActiveBlokers  struct {
		Id          int       `json:"id"`
		Description string    `json:"description"`
		Startdate   time.Time `json:"startdate"`
	} `json:"ActiveBlokers"`
	Swimlane      int    `json:"Swimlane"`
	TypeTask      int    `json:"typeTask"`
	IdProject     int    `json:"IdProject"`
	ImageProject  string `json:"ImageProject"`
	NameProject   string `json:"NameProject"`
	СommentsCount string `json:"СommentsCount"`
}

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Link string `json:"link"`
	Icon string `json:"icon"`
}

type Task struct {
	ID              int           `json:"Id,string"`
	IDBitrix24      int           `json:"IdBitrix24"`
	Name            string        `json:"Name"`
	Stage           int           `json:"Stage,string"`
	DateSart        time.Time     `json:"DateSart"`
	DateStartStage  time.Time     `json:"DateStartStage"`
	DescriptionHTML template.HTML `json:"DescriptionHTML"`
	Users           []User        `json:"Users"`

	Blokers       []model.Bloker `json:"Blokers"`
	Swimlane      int            `json:"Swimlane"`
	Type          string         `json:"Type"`
	IdProject     int            `json:"IdProject"`
	ImageProject  string         `json:"ImageProject"`
	NameProject   string         `json:"NameProject"`
	StagesHistory []StageHistory `json:"StagesHistory"`
	Comments      []Comments     `json:"Comments"`
}

type StageHistory struct {
	Id      int
	Idtask  int
	Idstage int
	Start   time.Time
	End     time.Time
	Name    string
}
type Stages struct {
	ID          int    `json:"Id"`
	Name        string `json:"Name"`
	WIP         int    `json:"WIP"`
	Description string `json:"Description"`
}

func (Cb *KanbanService) GetTaskList(id int) (tasks []Tasks, err error) {

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	TasksFromDB, err := model.GetTaskListFromDB(id)
	if err != nil {
		return nil, err

	}
	tasks = make([]Tasks, len(TasksFromDB))

	// Получаем данные из Битрикс24 по задачам

	StringTask := make([]int, len(TasksFromDB))
	for i, TaskFromDB := range TasksFromDB {
		StringTask[i] = TaskFromDB.Idbitrix24
	}

	values, errB24 := connectionBitrix24API.GetTaskListById(StringTask)
	if errB24 != nil {
		fmt.Println(errB24)
		return nil, errB24
	}

	// Получаем данные из Битрикс24 по проектам
	projects, errB24Pr := connectionBitrix24API.GetProjectListById(`["131","64", "125", "117", "111", "109"]`)
	if errB24Pr != nil {
		fmt.Println(errB24Pr)
		return nil, errB24Pr
	}

	for i, TaskFromDB := range TasksFromDB {

		tasks[i].ID = TaskFromDB.Idtasks
		tasks[i].IDBitrix24 = TaskFromDB.Idbitrix24
		tasks[i].Stage = TaskFromDB.Stageid
		tasks[i].TypeTask = TaskFromDB.Typetask

		for _, valuesB24 := range values.Result.Tasks {

			if valuesB24.ID == tasks[i].IDBitrix24 {
				Users := make([]User, 0)
				user := User{
					ID:   valuesB24.Responsible.ID,
					Name: valuesB24.Responsible.Name,
					Link: valuesB24.Responsible.Link,
					Icon: valuesB24.Responsible.Icon}
				Users = append(Users, user)

				for _, addUser := range valuesB24.Accomplices {
					UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(addUser)
					user := User{
						ID:   UserAccomplices.Result.ID,
						Name: UserAccomplices.Result.LastName + " " + UserAccomplices.Result.Name,
						Link: "",
						Icon: UserAccomplices.Result.Avatar}
					Users = append(Users, user)

				}
				tasks[i].Users = make([]User, len(Users))
				copy(tasks[i].Users, Users)

				tasks[i].Name = valuesB24.Title
				tasks[i].IdProject = valuesB24.GroupID
				tasks[i].СommentsCount = valuesB24.CommentsCount
			}

		}

		for _, valuesB24projects := range projects.Result {
			if valuesB24projects.ID == tasks[i].IdProject {
				tasks[i].ImageProject = valuesB24projects.IMAGE
				tasks[i].NameProject = valuesB24projects.NAME
			}
		}

		//Блокеры
		Bloker, count, err := model.GetActiveBlokersFromDB(TaskFromDB.Idtasks)
		if err != nil {
			return nil, err
		}
		if count > 0 {
			tasks[i].ActiveBlokers.Id = Bloker.Id
			tasks[i].ActiveBlokers.Description = Bloker.Description
			tasks[i].ActiveBlokers.Startdate = Bloker.Startdate
		}

	}

	return tasks, nil
}

func (Cb *KanbanService) GetStages(id int) (stagesAPI Stages, err error) {

	stagesFromDB, err := model.GetStageFromDB(id)
	if err != nil {
		return stagesAPI, err
	}

	stagesAPI = Stages{stagesFromDB.Idstage, stagesFromDB.Name, 0, stagesFromDB.Description}

	return stagesAPI, nil
}

func (Cb *KanbanService) SetTask(tasks Tasks) (err error) {
	var task = model.Tasks{}

	task.Idtasks = tasks.ID
	task.Stageid = tasks.Stage

	err = model.UpdateTaskInDB(task)
	if err != nil {
		return err
	}

	rowHistory, err := model.GetCurrentTaskStage(tasks.ID)
	timeNow := time.Now().UTC()
	if rowHistory.Id > 0 {
		rowHistory.Finised = true
		rowHistory.End = timeNow
		err = model.SetCurrentTaskStage(rowHistory)
		if err != nil {
			fmt.Println(err)
			return err
		}
	}
	newRowHistory := model.Stagehistory{
		Idtask:  tasks.ID,
		Idstage: tasks.Stage,
		Start:   timeNow,
	}
	err = model.SetCurrentTaskStage(newRowHistory)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func (Cb *KanbanService) NewTask(task Task, user model.User) (id int, err error) {

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	taskMap := make(map[string]string)
	taskMap["TITLE"] = task.Name + " [KT]"
	taskMap["GROUP_ID"] = "109"
	taskMap["RESPONSIBLE_ID"] = strconv.Itoa(user.Bitrix24id)

	taskB24, err := connectionBitrix24API.AddTask(taskMap)
	//Записать задачу в нашу базу
	if err != nil {
		return 0, err
	}

	id, err = model.SetTaskFromBitrix24(taskB24.ID, task.Stage)

	if err != nil {
		return 0, err
	}
	// TODO
	commitmentPointId := 1
	if task.Stage != commitmentPointId {
		newRowHistory := model.Stagehistory{
			Idtask:  id,
			Idstage: commitmentPointId,
			Start:   time.Now(),
			End:     time.Now(),
			Finised: true,
		}
		err = model.SetCurrentTaskStage(newRowHistory)
		if err != nil {
			fmt.Println(err)
			return 0, err
		}
	}
	newRowHistory := model.Stagehistory{
		Idtask:  id,
		Idstage: task.Stage,
		Start:   time.Now(),
	}
	err = model.SetCurrentTaskStage(newRowHistory)
	if err != nil {
		fmt.Println(err)
		return 0, err
	}

	return id, err
}

func (Cb *KanbanService) CompleteTask(taskId int) (err error) {

	taskDb, err := model.GetTaskFromDB(taskId)

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	err = connectionBitrix24API.CompleteTask(taskDb.Idbitrix24)
	if err != nil {
		return err
	}
	rowHistory, err := model.GetCurrentTaskStage(taskId)
	timeNow := time.Now()
	if rowHistory.Id > 0 {
		rowHistory.Finised = true
		rowHistory.End = timeNow
		err = model.SetCurrentTaskStage(rowHistory)
		if err != nil {
			fmt.Println(err)
			return err
		}
	}

	model.FinishTask(taskDb)

	return nil
}

func (Cb *KanbanService) GetTaskForDesk(id int) (task Tasks, err error) {
	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	TaskFromDB, err := model.GetTaskFromDB(id)
	if err != nil {
		return task, err

	}
	task = Tasks{}

	// Получаем данные из Битрикс24 по задачам

	StringTask := make([]int, 1)
	StringTask[0] = TaskFromDB.Idbitrix24

	values, errB24 := connectionBitrix24API.GetTaskListById(StringTask)
	if errB24 != nil {
		fmt.Println(errB24)
		return task, errB24
	}

	// Получаем данные из Битрикс24 по проектам
	projects, errB24Pr := connectionBitrix24API.GetProjectListById(`["131","64", "125", "117", "111", "109"]`)
	if errB24Pr != nil {
		fmt.Println(errB24Pr)
		return task, errB24Pr
	}

	task.ID = TaskFromDB.Idtasks
	task.IDBitrix24 = TaskFromDB.Idbitrix24
	task.Stage = TaskFromDB.Stageid

	for _, valuesB24 := range values.Result.Tasks {
		if valuesB24.ID == task.IDBitrix24 {
			Users := make([]User, 0)
			user := User{
				ID:   valuesB24.Responsible.ID,
				Name: valuesB24.Responsible.Name,
				Link: valuesB24.Responsible.Link,
				Icon: valuesB24.Responsible.Icon}
			Users = append(Users, user)

			for _, addUser := range valuesB24.Accomplices {
				UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(addUser)
				user := User{
					ID:   UserAccomplices.Result.ID,
					Name: UserAccomplices.Result.LastName + " " + UserAccomplices.Result.Name,
					Link: "",
					Icon: UserAccomplices.Result.Avatar}
				Users = append(Users, user)

			}
			task.Users = make([]User, len(Users))
			copy(task.Users, Users)

			task.Name = valuesB24.Title
			task.IdProject = valuesB24.GroupID
		}
	}

	for _, valuesB24projects := range projects.Result {
		if valuesB24projects.ID == task.IdProject {
			task.ImageProject = valuesB24projects.IMAGE
			task.NameProject = valuesB24projects.NAME
		}
	}

	//Блокеры
	Bloker, count, err := model.GetActiveBlokersFromDB(id)
	if err != nil {
		return task, err
	}
	if count > 0 {
		task.ActiveBlokers.Id = Bloker.Id
		task.ActiveBlokers.Description = Bloker.Description
		task.ActiveBlokers.Startdate = Bloker.Startdate
	}

	return task, nil
}

func (Cb *KanbanService) GetTask(id int) (task Task, err error) {
	//var task = model.Task{}

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	// Получаем данные из Битрикс24 по задачам

	taskBD, _ := model.GetTaskFromDB(id)
	task.ID = taskBD.Idtasks
	task.IDBitrix24 = taskBD.Idbitrix24
	task.Stage = taskBD.Stageid

	taskB24, errB24 := connectionBitrix24API.GetTask(strconv.Itoa(taskBD.Idbitrix24))
	if errB24 != nil {
		fmt.Println(errB24)
		return task, errB24
	}
	task.Name = taskB24.Result.TITLE
	//task.DateSart = taskB24.Result.DATESTART
	//task.DateStartStage		= ;
	task.DescriptionHTML = taskB24.Result.DESCRIPTIONHTML
	stages, _ := model.GetStages()

	StagesHistory, _ := model.GetTaskHistoryStages(id)

	if err != nil {
		return task, err
	}
	task.StagesHistory = make([]StageHistory, 0)
	for _, row := range StagesHistory {
		newRow := StageHistory{
			row.Id,
			row.Idtask,
			row.Idstage,
			row.Start,
			row.End,
			"",
		}
		for _, rowStage := range stages {
			if rowStage.Idstage == row.Idstage {
				newRow.Name = rowStage.Name
			}
		}
		task.StagesHistory = append(task.StagesHistory, newRow)
	}

	task.Blokers, _ = model.GetAllBlokersFromDB(id)
	CommentsB24, err := connectionBitrix24API.GetCommentsById(taskB24.Result.ID)

	if err != nil {
		fmt.Println(err)
		return task, err
	}
	task.Comments = make([]Comments, 0)
	for _, row := range CommentsB24.Result {
		task.Comments = append(task.Comments, row)
	}

	return task, nil
}

func (Cb *KanbanService) SetTaskByIdFromBitrix24(Id string) {

	var ConnectionBitrix24 = ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}
	//idInt, _ := strconv.Atoi(Id)
	taskBitrix24, _ := ConnectionBitrix24.GetTask(Id)
	projects := `["131","64", "125", "117", "111", "109"]`

	if str.Count(projects, taskBitrix24.Result.GROUPID) > 0 && taskBitrix24.Result.GROUPID != "0" {
		model.SetTaskFromBitrix24(taskBitrix24.Result.ID, 9)
	}

}

func (Cb *KanbanService) GetBloker(id int) (bloker model.Bloker, err error) {

	bloker, err = model.GetBlokerFromDBbyId(id)
	if err != nil {
		return bloker, err
	}

	return bloker, nil
}

func (Cb *KanbanService) UpdateBloker(bloker Bloker) (err error) {
	blokerDb := model.Bloker{}
	blokerDb.Id = bloker.Id
	blokerDb.Idtask = bloker.Idtask
	blokerDb.Startdate = bloker.Startdate
	blokerDb.Enddate = bloker.Enddate
	blokerDb.Description = bloker.Description
	blokerDb.Diside = bloker.Diside
	emptyDate := time.Time{}
	fmt.Println(emptyDate)
	fmt.Println(blokerDb.Enddate)
	if blokerDb.Enddate != emptyDate {
		blokerDb.Finished = true
	} else {
		blokerDb.Finished = false
	}

	err = model.UpdateBlokerInDB(blokerDb)
	if err != nil {
		return err
	}

	return nil
}

func (Cb *KanbanService) GetDeskList(id int) (desk []model.Desk, err error) {
	desk, err = model.GetDeskListFromDB()
	return desk, err
}

func (Cb *KanbanService) GetDeskById(id int) (desk model.Desk, err error) {
	desk, err = model.GetDeskFromDBById(id)
	return desk, err
}
