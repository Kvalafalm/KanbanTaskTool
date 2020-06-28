package services

import (
	model "KanbanTaskTool/models"
	"html/template"
	"strconv"
	"strings"
	"time"

	"fmt"

	"github.com/astaxie/beego"
)

//KanbanService method
type KanbanService struct {
}

//Bloker need for WorkItems
type Bloker struct {
	Id          int              `json:"Id"`
	Idtask      int              `json:"Idtask"`
	Description string           `json:"Description"`
	Startdate   time.Time        `json:"StartDate"`
	Enddate     time.Time        `json:"EndDate"`
	Diside      string           `json:"Diside"`
	Finished    bool             `json:"Finished"`
	TypeEvent   model.TypesEvent `json:"TypeEvent"`
}

//User need for WorkItems
type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Link string `json:"link"`
	Icon string `json:"icon"`
}

// WorkItem type need for send to frontEnd workItem
type WorkItem struct {
	ID              int                  `json:"Id,string"`
	IDBitrix24      int                  `json:"IdBitrix24"`
	Name            string               `json:"Name"`
	Stage           int                  `json:"Stage,string"`
	DateStart       time.Time            `json:"DateStart"`
	DateStartStage  time.Time            `json:"DateStartStage"`
	Users           []User               `json:"Users"`
	LeadTime        int                  `json:"LeadTime"`
	CyrcleTime      int                  `json:"CyrcleTime"`
	FlowEffectives  int                  `json:"FlowEffectives"`
	Blokers         []Bloker             `json:"Blokers"`
	TypeTask        model.TypeWorkItem   `json:"TypeTask"`
	Class           model.ClassOfService `json:"Class"`
	IDProject       int                  `json:"IdProject"`
	ImageProject    string               `json:"ImageProject"`
	NameProject     string               `json:"NameProject"`
	Swimline        int                  `json:"Swimline,string"`
	СommentsCount   string               `json:"СommentsCount"`
	IDDesk          string               `json:"IDDesk"`
	DescriptionHTML template.HTML        `json:"DescriptionHTML"`
	StagesHistory   []StageHistory       `json:"StagesHistory"`
	Comments        []Comments           `json:"Comments"`
}

//Tasks need for show on desk OLD
type Tasks struct {
	ID             int                  `json:"Id,string"`
	IDBitrix24     int                  `json:"IdBitrix24"`
	Name           string               `json:"Name"`
	Stage          int                  `json:"Stage,string"`
	DateStart      time.Time            `json:"DateStart"`
	DateStartStage time.Time            `json:"DateStartStage"`
	Users          []User               `json:"Users"`
	Blokers        []Bloker             `json:"Blokers"`
	Swimline       int                  `json:"Swimline,string"`
	TypeTask       model.TypeWorkItem   `json:"TypeTask"`
	Class          model.ClassOfService `json:"Class"`
	IdProject      int                  `json:"IdProject"`
	ImageProject   string               `json:"ImageProject"`
	NameProject    string               `json:"NameProject"`
	СommentsCount  string               `json:"СommentsCount"`
	LeadTime       int                  `json:"LeadTime"`
	CyrcleTime     int                  `json:"CyrcleTime"`
	FlowEffectives int                  `json:"FlowEffectives"`
}

//StageHistory need for WorkItems
type StageHistory struct {
	Id       int
	Idtask   int
	Idstage  int
	Start    time.Time
	End      time.Time
	Duration int
	Name     string
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

	comitmentPoints, err := model.GetDateCommitmentPointList(id)
	if err != nil {
		//beego.ERROR(err);
		return tasks, err
	}

	// Получаем данные из Битрикс24 по проектам
	// TODO
	projects, errB24Pr := connectionBitrix24API.GetProjectListById(`["131","64", "125", "117", "111", "109"]`)
	if errB24Pr != nil {
		fmt.Println(errB24Pr)
		return nil, errB24Pr
	}

	for i, TaskFromDB := range TasksFromDB {

		tasks[i].ID = TaskFromDB.Idtasks
		tasks[i].IDBitrix24 = TaskFromDB.Idbitrix24
		tasks[i].Stage = TaskFromDB.Stageid
		tasks[i].Swimline = TaskFromDB.Swimline
		tasks[i].TypeTask = *TaskFromDB.Typetask
		tasks[i].Class = *TaskFromDB.Class
		tasks[i].Name = TaskFromDB.Title
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
						ID:   addUser,
						Name: UserAccomplices.Result.Name,
						Link: "",
						Icon: UserAccomplices.Result.Avatar}
					Users = append(Users, user)
				}
				tasks[i].Users = make([]User, len(Users))
				copy(tasks[i].Users, Users)
				if tasks[i].Name == "" {
					tasks[i].Name = valuesB24.Title
				}
				tasks[i].IdProject = valuesB24.GroupID
				tasks[i].СommentsCount = valuesB24.CommentsCount
			}

		}

		for _, values := range comitmentPoints {
			if strconv.Itoa(tasks[i].ID) == values["idtask"] {
				tasks[i].DateStart, _ = time.Parse("2006-01-02 15:04:05", values["start"].(string))
				tasks[i].LeadTime = DifferenceInDays(values["start"].(string), time.Now().Format("2006-01-02 15:04:05"))
			}
		}

		for _, valuesB24projects := range projects.Result {
			if valuesB24projects.ID == tasks[i].IdProject {
				tasks[i].ImageProject = valuesB24projects.IMAGE
				tasks[i].NameProject = valuesB24projects.NAME
			}
		}

		//Блокеры
		for _, row := range TaskFromDB.Blokers {
			blokerRow := Bloker{
				row.Id,
				row.Idtask.Idtasks,
				row.Description,
				row.Startdate.UTC(),
				row.Enddate.UTC(),
				row.Diside,
				row.Finished,
				row.TypeEvent,
			}
			tasks[i].Blokers = append(tasks[i].Blokers, blokerRow)
		}

	}

	return tasks, nil
}

func (Cb *KanbanService) GetStages(id int) (stagesAPI Stages, err error) {

	stagesFromDB, err := model.GetStageFromDB(id)
	if err != nil {
		return stagesAPI, err
	}

	stagesAPI = Stages{stagesFromDB.Id, stagesFromDB.Name, 0, stagesFromDB.Description}

	return stagesAPI, nil
}

func (Cb *KanbanService) SetTask(tasks Tasks) (err error) {
	var task = model.Tasks{}

	task.Idtasks = tasks.ID
	task.Stageid = tasks.Stage
	task.Swimline = tasks.Swimline
	task.Typetask = &tasks.TypeTask
	task.Class = &tasks.Class

	err = model.UpdateTaskInDB(task)
	if err != nil {
		return err
	}

	rowHistory, err := model.GetCurrentTaskStage(tasks.ID)
	timeNow := time.Now().UTC()
	if rowHistory.Idstage != task.Stageid {

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
	}
	//Если перенесли Рабочий элемент на дргой этап значит все блокировки закончились закрываем их
	//Получить все события изменить их и записать
	if rowHistory.Idstage != task.Stageid {
		events, count, err := model.GetActiveBlokersFromDB(tasks.ID)
		if err != nil {
			fmt.Println(err)
			return err
		}

		if count > 0 {
			for _, event := range events {
				event.Enddate = timeNow
				event.Finished = true
				err = model.UpdateBlokerInDB(&event)

				if err != nil {
					return err
				}

			}
		}
	}
	return nil
}

func (Cb *KanbanService) NewTask(workItem WorkItem, user model.User) (id int, err error) {

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}
	iddesk, _ := strconv.Atoi(workItem.IDDesk)
	desk, err := model.GetDeskFromDBById(iddesk)
	commitmentPointId := desk.Startstage
	ProjectList := strings.Split(desk.Projectsb24, ";")

	taskMap := make(map[string]string)
	taskMap["TITLE"] = workItem.Name
	taskMap["GROUP_ID"] = ProjectList[0]
	taskMap["RESPONSIBLE_ID"] = strconv.Itoa(user.Bitrix24id)

	newtaskK := make(map[string]string)

	newtaskK["Stage"] = strconv.Itoa(workItem.Stage)
	newtaskK["Swimline"] = strconv.Itoa(workItem.Swimline)
	newtaskK["Typetask"] = "0"
	newtaskK["idBitrix"] = strconv.Itoa(user.Defaulttaskb24)
	newtaskK["CheckUnicColluumn"] = "idbitrix24"
	// TO DO
	if workItem.Stage != desk.Endstage {

		taskB24, err := connectionBitrix24API.AddTask(taskMap)
		//Записать задачу в нашу базу
		if err != nil {
			return 0, err
		}
		newtaskK["idBitrix"] = taskB24.ID
	} else {
		newtaskK["Title"] = workItem.Name + ""
		newtaskK["CheckUnicColluumn"] = ""
		newtaskK["Typetask"] = "2"
	}

	id, err = model.SetTaskFromBitrix24(newtaskK)

	if err != nil {
		return 0, err
	}

	if workItem.Stage != commitmentPointId {
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
		Idstage: workItem.Stage,
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
	fmt.Println("Complete")
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

func (Cb *KanbanService) GetTask(id int) (workItem WorkItem, err error) {
	//var task = model.Task{}

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	// Получаем данные из Битрикс24 по задачам

	taskBD, _ := model.GetTaskFromDB(id)
	workItem.ID = taskBD.Idtasks
	workItem.IDBitrix24 = taskBD.Idbitrix24
	workItem.Stage = taskBD.Stageid
	workItem.Swimline = taskBD.Swimline

	taskB24, errB24 := connectionBitrix24API.GetTask(strconv.Itoa(taskBD.Idbitrix24))
	if errB24 != nil {
		fmt.Println(errB24)
		return workItem, errB24
	}

	if taskBD.Title == "" {
		workItem.Name = taskB24.Result.TITLE
	} else {
		workItem.Name = taskBD.Title
	}
	//task.DateStart = taskB24.Result.DATESTART
	//task.DateStartStage		= ;
	workItem.DescriptionHTML = taskB24.Result.DESCRIPTIONHTML
	stages, _ := model.GetStages()
	workItem.TypeTask = *taskBD.Typetask
	workItem.Class = *taskBD.Class
	StagesHistory, _ := model.GetTaskHistoryStages(id)

	if err != nil {
		return workItem, err
	}
	workItem.StagesHistory = make([]StageHistory, 0)
	for _, row := range StagesHistory {
		newRow := StageHistory{
			row.Id,
			row.Idtask,
			row.Idstage,
			row.Start,
			row.End,
			DifferenceInDays(row.Start, row.End),
			"",
		}
		for _, rowStage := range stages {
			if rowStage.Id == row.Idstage {
				newRow.Name = rowStage.Name
			}
		}
		workItem.StagesHistory = append(workItem.StagesHistory, newRow)
	}

	//TODO
	workItem.IDProject, _ = strconv.Atoi(taskB24.Result.GROUPID)
	projects, errB24Pr := connectionBitrix24API.GetProjectListById(`[` + taskB24.Result.GROUPID + `]`)
	if errB24Pr != nil {
		return workItem, errB24Pr
	}

	for _, valuesB24projects := range projects.Result {
		if valuesB24projects.ID == workItem.IDProject {
			workItem.ImageProject = valuesB24projects.IMAGE
			workItem.NameProject = valuesB24projects.NAME
		}
	}

	BlokersDB, _ := model.GetAllBlokersFromDB(id)
	for _, row := range BlokersDB {
		blokerRow := Bloker{
			row.Id,
			row.Idtask.Idtasks,
			row.Description,
			row.Startdate.UTC(),
			row.Enddate.UTC(),
			row.Diside,
			row.Finished,
			row.TypeEvent,
		}
		workItem.Blokers = append(workItem.Blokers, blokerRow)
	}

	Users := make([]User, 0)
	UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(taskB24.Result.RESPONSIBLEID)
	user := User{
		ID:   UserAccomplices.Result.ID,
		Name: UserAccomplices.Result.LastName + " " + UserAccomplices.Result.Name,
		Link: "",
		Icon: UserAccomplices.Result.Avatar}
	Users = append(Users, user)

	for _, addUser := range taskB24.Result.ACCOMPLICES {
		UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(addUser)

		user := User{
			ID:   UserAccomplices.Result.ID,
			Name: UserAccomplices.Result.LastName + " " + UserAccomplices.Result.Name,
			Link: "",
			Icon: UserAccomplices.Result.Avatar}
		Users = append(Users, user)
	}

	workItem.Users = make([]User, len(Users))
	copy(workItem.Users, Users)
	CommentsB24, err := connectionBitrix24API.GetCommentsById(taskB24.Result.ID)

	if err != nil {
		fmt.Println(err)
		return workItem, err
	}
	workItem.Comments = make([]Comments, 0)
	for _, row := range CommentsB24.Result {
		workItem.Comments = append(workItem.Comments, row)
	}

	return workItem, nil
}
func (Cb *KanbanService) GetIdtaskByBitrix24(IdB24 string) (Id int, err error) {
	IdB24int, _ := strconv.Atoi(IdB24)
	task, err := model.GetTaskFromDBbyB24(IdB24int)
	if err != nil {
		return Id, err
	}
	return task.Idtasks, nil
}

func (Cb *KanbanService) SetTaskByIdFromBitrix24(Id string) {

	var ConnectionBitrix24 = ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}
	taskBitrix24, _ := ConnectionBitrix24.GetTask(Id)
	if taskBitrix24.Result.GROUPID != "0" {
		desk, _ := model.GetDeskByIdFromBitrix24Projects(taskBitrix24.Result.GROUPID)
		task := make(map[string]string)
		task["Id"] = taskBitrix24.Result.ID
		task["Stage"] = strconv.Itoa(desk.Startstage)
		task["idBitrix"] = taskBitrix24.Result.ID
		task["Typetask"] = "0"
		task["CheckUnicColluumn"] = "Idbitrix24"
		_, err := model.SetTaskFromBitrix24(task)
		if err == nil {
			beego.Info("Create work itemB24:" + taskBitrix24.Result.ID)
		} else {
			beego.Error(err)
		}
	}

}

func (Cb *KanbanService) GetBloker(id int) (bloker model.Bloker, err error) {

	bloker, err = model.GetBlokerFromDBbyId(id)
	if err != nil {
		return bloker, err
	}

	return bloker, nil
}

func (Cb *KanbanService) UpdateBloker(bloker *Bloker) (err error) {
	task := model.Tasks{}
	task.Idtasks = bloker.Idtask
	blokerDb := model.Bloker{}
	blokerDb.Id = bloker.Id

	blokerDb.Idtask = &task
	blokerDb.Startdate = bloker.Startdate
	blokerDb.Enddate = bloker.Enddate
	blokerDb.Description = bloker.Description
	blokerDb.Diside = bloker.Diside
	blokerDb.TypeEvent = bloker.TypeEvent
	if blokerDb.Enddate != (time.Time{}) {
		blokerDb.Finished = true
	} else {
		blokerDb.Finished = false
	}

	err = model.UpdateBlokerInDB(&blokerDb)
	if err != nil {
		return err
	}
	bloker.Id = blokerDb.Id
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
