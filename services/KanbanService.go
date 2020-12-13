package services

import (
	model "KanbanTaskTool/models"
	"errors"
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
	Id            int              `json:"Id"`
	Idtask        int              `json:"Idtask"`
	IdStage       int              `json:"IdStage,string"`
	Description   string           `json:"Description"`
	Startdate     time.Time        `json:"StartDate"`
	Enddate       time.Time        `json:"EndDate"`
	Diside        string           `json:"Diside"`
	Finished      bool             `json:"Finished"`
	TypeEvent     model.TypesEvent `json:"TypeEvent"`
	Durationinmin int              `json:"Durationinmin"`
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
	ID                int                  `json:"Id,string"`
	IDBitrix24        int                  `json:"IdBitrix24"`
	Name              string               `json:"Name"`
	Stage             int                  `json:"Stage,string"`
	DateStart         time.Time            `json:"DateStart"`
	DueDate           time.Time            `json:"DueDate"`
	DateStartStage    time.Time            `json:"DateStartStage"`
	Users             []User               `json:"Users"`
	LeadTime          int                  `json:"LeadTime"`
	CyrcleTime        int                  `json:"CyrcleTime"`
	Blokers           []Bloker             `json:"Blokers"`
	TypeTask          model.TypeWorkItem   `json:"TypeTask"`
	ClassOfService    model.ClassOfService `json:"ClassOfService"`
	IDProject         int                  `json:"IdProject"`
	ImageProject      string               `json:"ImageProject"`
	NameProject       string               `json:"NameProject"`
	Swimline          int                  `json:"Swimline,string"`
	СommentsCount     string               `json:"СommentsCount"`
	IDDesk            string               `json:"IDDesk"`
	DescriptionHTML   template.HTML        `json:"DescriptionHTML"`
	StagesHistory     []StageHistory       `json:"StagesHistory"`
	Comments          []Comments           `json:"Comments"`
	LeadTimeInMinutes int                  `json:"LeadTimeInMinutes"`
	WorkTimeInMinutes int                  `json:"WorkTimeInMinutes"`
	FlowEffectives    int                  `json:"FlowEffectives"`
}

//Tasks need for show on desk OLD
type Tasks struct {
	ID                int                  `json:"Id,string"`
	IDBitrix24        int                  `json:"IdBitrix24"`
	Name              string               `json:"Name"`
	Stage             int                  `json:"Stage,string"`
	DateStart         time.Time            `json:"DateStart"`
	DueDate           time.Time            `json:"DueDate"`
	DateStartStage    time.Time            `json:"DateStartStage"`
	Users             []User               `json:"Users"`
	Blokers           []Bloker             `json:"Blokers"`
	Swimline          int                  `json:"Swimline,string"`
	TypeTask          model.TypeWorkItem   `json:"TypeTask"`
	ClassOfService    model.ClassOfService `json:"ClassOfService"`
	StagesHistory     []StageHistory       `json:"StagesHistory"`
	IdProject         int                  `json:"IdProject"`
	ImageProject      string               `json:"ImageProject"`
	NameProject       string               `json:"NameProject"`
	СommentsCount     string               `json:"СommentsCount"`
	LeadTime          int                  `json:"LeadTime"`
	CyrcleTime        int                  `json:"CyrcleTime"`
	LeadTimeInMinutes int                  `json:"LeadTimeInMinutes"`
	WorkTimeInMinutes int                  `json:"WorkTimeInMinutes"`
	FlowEffectives    int                  `json:"FlowEffectives"`
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
	ID          int                     `json:"Id,string"`
	Name        string                  `json:"Name"`
	WIP         int                     `json:"WIP"`
	Description string                  `json:"Description,string"`
	Group       model.GroupWorkItemType `json:"Group,int"`
	WorkTime    bool                    `json:"WorkTime"`
	Order       int                     `json:"Order,string"`
}

func (Cb *KanbanService) GetTaskList(id int) (tasks []Tasks, err error) {

	TasksFromDB, err := model.GetTaskListFromDB(id)
	if err != nil {
		return nil, err
	}

	tasks = make([]Tasks, len(TasksFromDB))

	comitmentPoints, err := model.GetDateCommitmentPointList(id)
	if err != nil {
		//beego.ERROR(err);
		return tasks, err
	}

	for i, TaskFromDB := range TasksFromDB {

		tasks[i].ID = TaskFromDB.Idtasks
		tasks[i].IDBitrix24 = TaskFromDB.Idbitrix24
		tasks[i].Stage = TaskFromDB.Stageid
		tasks[i].Swimline = TaskFromDB.Swimline
		tasks[i].TypeTask = *TaskFromDB.Typetask
		tasks[i].ClassOfService = *TaskFromDB.ClassOfService
		tasks[i].Name = TaskFromDB.Title
		Users := make([]User, 0)
		for _, UserDB := range TaskFromDB.Users {
			user := User{
				ID:   strconv.Itoa(UserDB.Bitrix24id),
				Name: UserDB.Firstname + " " + UserDB.Secondname,
				Link: "",
				Icon: UserDB.Icon}
			Users = append(Users, user)
		}
		tasks[i].Users = make([]User, len(Users))
		copy(tasks[i].Users, Users)

		tasks[i].IdProject = TaskFromDB.Group.ID
		tasks[i].СommentsCount = TaskFromDB.Сommentscount
		tasks[i].DueDate = TaskFromDB.Duedate

		for _, values := range comitmentPoints {
			if strconv.Itoa(tasks[i].ID) == values["idtask"] {
				tasks[i].DateStart, _ = time.Parse("2006-01-02 15:04:05", values["start"].(string))
				tasks[i].LeadTime = DifferenceInDays(values["start"].(string), time.Now().Format("2006-01-02 15:04:05"))
			}
		}

		tasks[i].ImageProject = TaskFromDB.Group.Image
		tasks[i].NameProject = TaskFromDB.Group.Name

		//Блокеры
		for _, row := range TaskFromDB.Blokers {
			if !row.Finished {
				row.Durationinmin = DifferenceInMinutes(row.Startdate, time.Now())
			}
			blokerRow := Bloker{
				row.Id,
				row.Idtask.Idtasks,
				row.IdStage,
				row.Description,
				row.Startdate.UTC(),
				row.Enddate.UTC(),
				row.Diside,
				row.Finished,
				row.TypeEvent,
				row.Durationinmin,
			}
			tasks[i].Blokers = append(tasks[i].Blokers, blokerRow)
		}
		stages, _ := model.GetStages()
		StagesHistory, _ := model.GetTaskHistoryStages(TaskFromDB.Idtasks)
		for _, row := range StagesHistory {
			if (row.End == time.Time{}) {
				row.Durationinmin = DifferenceInMinutes(row.Start, time.Now())
			}
			newRow := StageHistory{
				row.Id,
				row.Idtask,
				row.Idstage,
				DateToUTC(row.Start),
				DateToUTC(row.End),
				row.Durationinmin,
				"",
			}
			for _, rowStage := range stages {
				if rowStage.Id == row.Idstage {
					newRow.Name = rowStage.Name
				}
			}
			tasks[i].StagesHistory = append(tasks[i].StagesHistory, newRow)
		}
	}

	return tasks, nil
}

func (Cb *KanbanService) GetStages(id int) (Stage Stages, err error) {

	stagesFromDB, err := model.GetStageFromDB(id)
	if err != nil {
		return Stage, err
	}

	Stage = Stages{}
	Stage.ID = stagesFromDB.Id
	Stage.Name = stagesFromDB.Name
	Stage.Description = stagesFromDB.Description
	Stage.Group = stagesFromDB.Group
	Stage.Order = stagesFromDB.Order
	Stage.WorkTime = stagesFromDB.WorkTime

	return Stage, nil
}

func (Cb *KanbanService) SetTask(tasks Tasks) (err error) {
	var task = model.Tasks{}
	task.Title = tasks.Name
	task.Idtasks = tasks.ID
	task.Stageid = tasks.Stage
	task.Swimline = tasks.Swimline
	task.Typetask = &tasks.TypeTask
	task.ClassOfService = &tasks.ClassOfService
	task.Group = &model.Group{ID: tasks.IdProject}
	task.Users = make([]*model.User, 0)
	for _, row := range tasks.Users {
		id, _ := strconv.Atoi(row.ID)
		user := &model.User{
			Bitrix24id: id,
		}
		user.GetUserByBitrix24ID()
		addUser := true
		for _, row := range task.Users {
			if row.Id == user.Id {
				addUser = false
			}

		}
		if addUser {
			task.Users = append(task.Users, user)
		}
	}

	err = model.UpdateTaskInDB(task)
	if err != nil {
		return err
	}

	rowHistory, err := model.GetCurrentTaskStage(tasks.ID)
	timeNow := time.Now().UTC()
	if rowHistory.Idstage != task.Stageid {

		if rowHistory.Id > 0 {
			rowHistory.Finished = true
			rowHistory.End = timeNow
			rowHistory.Durationinmin = DifferenceInMinutes(rowHistory.Start, rowHistory.End)
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
	//connectionBitrix24API.SendMessage("chat6373", "Новая "+workItem.Name) 6843
	//connectionBitrix24API.SendMessage("8", "Новая "+workItem.Name)
	taskMap := make(map[string]string)
	taskMap["TITLE"] = workItem.Name
	taskMap["GROUP_ID"] = ProjectList[0]
	taskMap["RESPONSIBLE_ID"] = strconv.Itoa(user.Bitrix24id)
	taskMap["CREATED_BY"] = strconv.Itoa(user.Bitrix24id)

	newtaskK := make(map[string]string)

	newtaskK["Stage"] = strconv.Itoa(workItem.Stage)
	newtaskK["Swimline"] = strconv.Itoa(workItem.Swimline)
	newtaskK["Typetask"] = "0"
	newtaskK["idBitrix"] = strconv.Itoa(user.Defaulttaskb24)
	newtaskK["Title"] = workItem.Name
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
		taskB24, _ := connectionBitrix24API.GetTask(strconv.Itoa(user.Defaulttaskb24))
		newtaskK["CheckUnicColluumn"] = ""
		newtaskK["Typetask"] = strconv.Itoa(user.DefaultWorkItemType)
		newtaskK["Class"] = "1"
		newtaskK["Small"] = "1"
		newtaskK["GROUP_ID"] = taskB24.Result.GROUPID
	}

	id, err = model.SetTaskFromBitrix24(newtaskK)

	if err != nil {
		return 0, err
	}

	if workItem.Stage != commitmentPointId {
		newRowHistory := model.Stagehistory{
			Idtask:        id,
			Idstage:       commitmentPointId,
			Start:         time.Now(),
			End:           time.Now(),
			Durationinmin: 0,
			Finished:      true,
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
		rowHistory.Finished = true
		rowHistory.End = timeNow
		rowHistory.Durationinmin = DifferenceInMinutes(rowHistory.Start, rowHistory.End)
		err = model.SetCurrentTaskStage(rowHistory)
		if err != nil {
			fmt.Println(err)
			return err
		}
	}

	model.FinishTask(taskDb)

	return nil
}

func (Cb *KanbanService) CheckUpdateWorkItem(taskId int) (err error) {
	taskBD, err := model.GetTaskFromDB(taskId)
	if taskBD.SmallWorkItem {
		return err
	}
	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	taskB24, errB24 := connectionBitrix24API.GetTask(strconv.Itoa(taskBD.Idbitrix24))
	if errB24 != nil {
		return errB24
	}
	//2020-11-25T13:00:00+03:00
	taskBD.Duedate, err = time.Parse(time.RFC3339, taskB24.Result.DEADLINE)
	if err != nil {
		taskBD.Duedate = time.Time{}
	}
	taskBD.Сommentscount = taskB24.Result.COMMENTSCOUNT
	taskBD.Title = taskB24.Result.TITLE
	taskBD.Users = make([]*model.User, 0)

	UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(taskB24.Result.RESPONSIBLEID)
	id, _ := strconv.Atoi(taskB24.Result.RESPONSIBLEID)
	user := &model.User{
		Bitrix24id: id,
		Firstname:  UserAccomplices.Result.FirstName,
		Secondname: UserAccomplices.Result.LastName,
		Icon:       UserAccomplices.Result.Avatar}
	user.ValidCurentUserOrAdd()
	user.UpdateIcon()
	taskBD.Users = append(taskBD.Users, user)

	for _, addUser := range taskB24.Result.ACCOMPLICES {
		id, _ := strconv.Atoi(addUser)
		UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(addUser)
		user := &model.User{
			Bitrix24id: id,
			Firstname:  UserAccomplices.Result.FirstName,
			Secondname: UserAccomplices.Result.LastName,
			Icon:       UserAccomplices.Result.Avatar}
		user.ValidCurentUserOrAdd()
		user.UpdateIcon()
		taskBD.Users = append(taskBD.Users, user)
	}

	id, _ = strconv.Atoi(taskB24.Result.GROUPID)
	taskBD.Group = &model.Group{
		ID: id,
	}

	err = model.UpdateTaskInDB(taskBD)
	if err != nil {
		return err
	}

	projects, errB24Pr := connectionBitrix24API.GetProjectListById("[" + taskB24.Result.GROUPID + "]")
	if errB24Pr != nil {
		return errB24Pr
	}
	for _, project := range projects.Result {
		projectDB := model.Group{
			ID:    project.ID,
			Name:  project.NAME,
			Image: project.IMAGE,
		}
		projectDB.Update()
	}

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
	workItem.Name = taskBD.Title
	workItem.DueDate = taskBD.Duedate

	workItem.DescriptionHTML = taskB24.Result.DESCRIPTIONHTML

	workItem.TypeTask = *taskBD.Typetask

	workItem.ClassOfService = *taskBD.ClassOfService

	workItem.Users = make([]User, 0)
	for _, UserDB := range taskBD.Users {
		user := User{
			ID:   strconv.Itoa(UserDB.Bitrix24id),
			Name: UserDB.Firstname + " " + UserDB.Secondname,
			Link: "",
			Icon: UserDB.Icon}
		workItem.Users = append(workItem.Users, user)
	}

	workItem.IDProject = taskBD.Group.ID
	workItem.СommentsCount = taskBD.Сommentscount
	workItem.DueDate = taskBD.Duedate
	workItem.ImageProject = taskBD.Group.Image
	workItem.NameProject = taskBD.Group.Name

	if err != nil {
		return workItem, err
	}
	workItem.StagesHistory = make([]StageHistory, 0)

	stages, _ := model.GetStages()
	StagesHistory, _ := model.GetTaskHistoryStages(id)
	for _, row := range StagesHistory {
		if (row.End == time.Time{}) {
			row.Durationinmin = DifferenceInMinutes(row.Start, time.Now())
		}
		newRow := StageHistory{
			row.Id,
			row.Idtask,
			row.Idstage,
			DateToUTC(row.Start),
			DateToUTC(row.End),
			row.Durationinmin,
			"",
		}
		for _, rowStage := range stages {
			if rowStage.Id == row.Idstage {
				newRow.Name = rowStage.Name
			}
		}
		workItem.StagesHistory = append(workItem.StagesHistory, newRow)
	}

	BlokersDB, _ := model.GetAllBlokersFromDB(id)
	for _, row := range BlokersDB {
		if (row.Enddate == time.Time{}) {
			row.Durationinmin = DifferenceInMinutes(row.Startdate, time.Now())
		}
		blokerRow := Bloker{
			row.Id,
			row.Idtask.Idtasks,
			row.IdStage,
			row.Description,
			DateToUTC(row.Startdate),
			DateToUTC(row.Enddate),
			row.Diside,
			row.Finished,
			row.TypeEvent,
			row.Durationinmin,
		}

		workItem.Blokers = append(workItem.Blokers, blokerRow)
	}

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

func (Cb *KanbanService) SetTaskByIdFromBitrix24(Id string) (id int, err error) {

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
		idTask, err := model.SetTaskFromBitrix24(task)
		if err != nil {
			beego.Error(err)
		}
		err = Cb.CheckUpdateWorkItem(idTask)
		if err == nil {
			beego.Info("Create work itemB24:" + taskBitrix24.Result.ID)
			return idTask, nil
		} else {
			beego.Error(err)
			return 0, err
		}
	}

	return 0, errors.New("Can`t create WorkItem")

}

func (Cb *KanbanService) GetBloker(id int) (bloker model.Bloker, err error) {

	bloker, err = model.GetBlokerFromDBbyId(id)
	if err != nil {
		return bloker, err
	}

	return bloker, nil
}

func (Cb *KanbanService) BlokerUpdate(bloker *Bloker) (err error) {
	task := model.Tasks{}
	task.Idtasks = bloker.Idtask
	blokerDb := model.Bloker{}
	blokerDb.Id = bloker.Id

	blokerDb.Idtask = &task
	blokerDb.Startdate = bloker.Startdate
	blokerDb.IdStage = bloker.IdStage
	blokerDb.Enddate = bloker.Enddate
	blokerDb.Description = bloker.Description
	blokerDb.Diside = bloker.Diside
	blokerDb.TypeEvent = bloker.TypeEvent
	blokerDb.Finished = bloker.Finished
	blokerDb.Durationinmin = 0
	if blokerDb.Finished {
		blokerDb.Durationinmin = DifferenceInMinutes(blokerDb.Startdate, blokerDb.Enddate)
	}
	err = model.UpdateBlokerInDB(&blokerDb)
	if err != nil {
		return err
	}
	bloker.Id = blokerDb.Id
	return nil
}

func (Cb *KanbanService) StageSave(stage *Stages) (err error) {

	StageDb := model.Stage{}
	StageDb.Id = stage.ID

	StageDb.Name = stage.Name
	StageDb.Description = stage.Description
	StageDb.Group = stage.Group
	StageDb.Order = stage.Order
	StageDb.WorkTime = stage.WorkTime

	err = model.SetStages(StageDb)
	if err != nil {
		return err
	}

	return nil
}

func (Cb *KanbanService) BlokerDelete(blokerId int) (err error) {

	err = model.BlokerDeleteInDB(blokerId)
	if err != nil {
		return err
	}
	return nil
}

func (Cb *KanbanService) GetEventId(id int) (desk []model.Desk, err error) {
	return
}
func (Cb *KanbanService) GetDeskList(id int) (desk []model.Desk, err error) {
	desk, err = model.GetDeskListFromDB()
	return desk, err
}

func (Cb *KanbanService) GetDeskById(id int) (desk model.Desk, err error) {
	desk, err = model.GetDeskFromDBById(id)
	return desk, err
}

func (Cb *KanbanService) ServiceUpdateDuration() (err error) {

	stages, err := model.GetAllFinishedStages()

	if err == nil {
		for _, stage := range stages {
			if (stage.End != time.Time{}) {
				stage.End = DateToUTC(stage.End)
				stage.Start = DateToUTC(stage.Start)
				stage.Durationinmin = DifferenceInMinutes(DateToUTC(stage.Start), DateToUTC(stage.End))
				err = model.SetCurrentTaskStage(stage)
				if err != nil {
					return err
				}
			}
		}
	} else {
		return err
	}

	events, err := model.GetAllFinishedEvents()

	if err == nil {
		for _, event := range events {
			if (event.Enddate != time.Time{}) {
				event.Enddate = DateToUTC(event.Enddate)
				event.Startdate = DateToUTC(event.Startdate)
				event.Durationinmin = DifferenceInMinutes(event.Startdate, event.Enddate)

				err := model.UpdateBlokerInDB(&event)
				if err != nil {
					return err
				}
			}
		}
	} else {
		return err
	}

	return nil
}

func (Cb *KanbanService) ServiceUpdateDateFromBitrix24(id int) (err error) {

	connectionBitrix24API := ConnectionBitrix24{
		beego.AppConfig.String("BitrixDomen"),
		beego.AppConfig.String("BitrixUser"),
		beego.AppConfig.String("BitrixWebHook")}

	// Получаем данные из Битрикс24 по задачам
	TasksFromDB, err := model.GetAllTaskListFromDB(id)
	if err != nil {
		return err
	}

	StringTask := make([]int, len(TasksFromDB))

	for i, TaskFromDB := range TasksFromDB {
		StringTask[i] = TaskFromDB.Idbitrix24
	}

	values, errB24 := connectionBitrix24API.GetTaskListById(StringTask)

	if errB24 != nil {
		return errB24
	}

	ProjectsString := `[`
	for _, TaskFromDB := range TasksFromDB {
		for _, valuesB24 := range values.Result.Tasks {

			if valuesB24.ID == TaskFromDB.Idbitrix24 {
				UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(valuesB24.ResponsibleID)
				id, _ = strconv.Atoi(valuesB24.ResponsibleID)
				user := &model.User{
					Bitrix24id: id,
					Firstname:  UserAccomplices.Result.FirstName,
					Secondname: UserAccomplices.Result.LastName,
					Icon:       UserAccomplices.Result.Avatar}
				user.ValidCurentUserOrAdd()
				user.UpdateIcon()
				TaskFromDB.Users = append(TaskFromDB.Users, user)

				for _, addUser := range valuesB24.Accomplices {
					id, _ = strconv.Atoi(addUser)
					UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(addUser)
					user := &model.User{
						Bitrix24id: id,
						Firstname:  UserAccomplices.Result.FirstName,
						Secondname: UserAccomplices.Result.LastName,
						Icon:       UserAccomplices.Result.Avatar}
					user.ValidCurentUserOrAdd()
					user.UpdateIcon()
					TaskFromDB.Users = append(TaskFromDB.Users, user)
				}
				oldTitle := TaskFromDB.Title
				TaskFromDB.Title = valuesB24.Title

				if TaskFromDB.Idbitrix24 == 9675 || TaskFromDB.Idbitrix24 == 10839 || TaskFromDB.Idbitrix24 == 10841 || TaskFromDB.Idbitrix24 == 10843 || TaskFromDB.Idbitrix24 == 12093 {
					TaskFromDB.Title = oldTitle
					TaskFromDB.SmallWorkItem = true
				}
				TaskFromDB.Group = &model.Group{
					ID: valuesB24.GroupID,
				}
				ProjectsString += `"` + strconv.Itoa(valuesB24.GroupID) + `",`
				TaskFromDB.Сommentscount = valuesB24.CommentsCount
				TaskFromDB.Duedate, err = time.Parse(time.RFC3339, valuesB24.Deadline)
				if err != nil {
					TaskFromDB.Duedate = time.Time{}
				}

			}

		}
		model.UpdateTaskInDB(TaskFromDB)
		time.Sleep(time.Second / 2)
	}
	/*ProjectsString = `"0"]`
	projects, errB24Pr := connectionBitrix24API.GetProjectListById(ProjectsString)
	if errB24Pr != nil {
		return errB24Pr
	}
	for _, project := range projects.Result {
		projectDB := model.Group{
			ID:    project.ID,
			Name:  project.NAME,
			Image: project.IMAGE,
		}
		projectDB.Update()
	}
	users, _ := model.GetAllUsers()
	for _, user := range users {
		UserAccomplices, _ := connectionBitrix24API.GetUserFromChat(strconv.Itoa(user.Bitrix24id))
		user.Icon = UserAccomplices.Result.Avatar
		user.UpdateIcon()
		time.Sleep(time.Second / 2)
	}*/

	return nil
}

func DateToUTC(date time.Time) (newDate time.Time) {
	newDate = time.Date(
		date.Year(),
		date.Month(),
		date.Day(),
		date.Hour(),
		date.Minute(),
		date.Second(),
		0,
		time.UTC)

	return newDate
}

func DifferenceInMinutes(start interface{}, end interface{}) (Minutes int) {
	Minutes = 0
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
	//TODO Настройка рабочего времения
	EndWorkHourUTC := 10
	EndWorkMinutesUTC := 0
	StartWorkHourUTC := 1
	StartWorkMinutesUTC := 0
	workHoursInDay := EndWorkHourUTC - StartWorkHourUTC // Включая обед
	endPartOfTime := 0
	StartPartOfTime := 0

	if t1.Year() == f1.Year() && f1.Month() == t1.Month() && f1.Day() == t1.Day() {
		startHour := t1.Hour()
		startMinutes := t1.Minute()
		endHour := f1.Hour()
		endMinutes := f1.Minute()

		if (startHour < StartWorkHourUTC) || (startHour == StartWorkHourUTC && startMinutes < StartWorkMinutesUTC) {
			startHour = StartWorkHourUTC
			startMinutes = StartWorkMinutesUTC
		}

		if (startHour > EndWorkHourUTC) || (startHour == EndWorkHourUTC && startMinutes > EndWorkMinutesUTC) {
			startHour = EndWorkHourUTC
			startMinutes = EndWorkMinutesUTC
		}

		if (endHour < StartWorkHourUTC) || (endHour == StartWorkHourUTC && endMinutes < StartWorkMinutesUTC) {
			endHour = StartWorkHourUTC
			endMinutes = StartWorkMinutesUTC
		}

		if (endHour > EndWorkHourUTC) || (endHour == EndWorkHourUTC && endMinutes > EndWorkMinutesUTC) {
			endHour = EndWorkHourUTC
			endMinutes = EndWorkMinutesUTC
		}

		return (endHour-startHour)*60 + (endMinutes - startMinutes)
	}

	if (f1.Hour() < EndWorkHourUTC) || (f1.Hour() == EndWorkHourUTC && f1.Minute() <= EndWorkMinutesUTC) {
		endPartOfTime = ((f1.Hour() - StartWorkHourUTC) * 60) + (f1.Minute() - StartWorkMinutesUTC)
		if endPartOfTime < 0 {
			endPartOfTime = 0
		}
	} else {
		endPartOfTime = workHoursInDay * 60
	}

	if ((t1.Hour() < EndWorkHourUTC) || (t1.Hour() == EndWorkHourUTC && t1.Minute() <= EndWorkMinutesUTC)) && ((t1.Hour() > StartWorkHourUTC) || (t1.Hour() == StartWorkHourUTC && t1.Minute() >= StartWorkMinutesUTC)) {
		StartPartOfTime = ((EndWorkHourUTC - t1.Hour()) * 60) - t1.Minute()
	}

	startTime := time.Date(t1.Year(), t1.Month(), t1.Day(), 0, 0, 0, 0, time.UTC)
	if endTime.Before(startTime) {
		return 0
	}

	for {
		if startTime.Equal(endTime) {

			return Minutes + endPartOfTime + StartPartOfTime
		}
		if !isHoliday(startTime) {
			Minutes += workHoursInDay * 60
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
	Holidays = append(Holidays, time.Date(2020, 6, 24, 0, 0, 0, 0, time.UTC))
	Holidays = append(Holidays, time.Date(2020, 7, 1, 0, 0, 0, 0, time.UTC))
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
