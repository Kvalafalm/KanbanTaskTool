package Services

import (
	model "KanbanTaskTool/Models"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"strconv"
	"strings"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/httplib"
)

type Project struct {
	Result []struct {
		ID              int       `json:"ID,string"`
		SITEID          string    `json:"SITE_ID"`
		NAME            string    `json:"NAME"`
		DESCRIPTION     string    `json:"DESCRIPTION"`
		DATECREATE      time.Time `json:"DATE_CREATE"`
		DATEUPDATE      time.Time `json:"DATE_UPDATE"`
		ACTIVE          string    `json:"ACTIVE"`
		VISIBLE         string    `json:"VISIBLE"`
		OPENED          string    `json:"OPENED"`
		CLOSED          string    `json:"CLOSED"`
		SUBJECTID       string    `json:"SUBJECT_ID"`
		OWNERID         string    `json:"OWNER_ID"`
		KEYWORDS        string    `json:"KEYWORDS"`
		NUMBEROFMEMBERS string    `json:"NUMBER_OF_MEMBERS"`
		DATEACTIVITY    time.Time `json:"DATE_ACTIVITY"`
		SUBJECTNAME     string    `json:"SUBJECT_NAME"`
		PROJECT         string    `json:"PROJECT"`
		IMAGE           string    `json:"IMAGE"`
		ISEXTRANET      string    `json:"IS_EXTRANET"`
	} `json:"result"`
}

type ConnectionBitrix24 struct {
	Portal  string
	UserID  string
	Webhook string
}

type Comments struct {
	Result []struct {
		POSTMESSAGEHTML string    `json:"POST_MESSAGE_HTML"`
		ID              string    `json:"ID"`
		AUTHORID        string    `json:"AUTHOR_ID"`
		AUTHORNAME      string    `json:"AUTHOR_NAME"`
		AUTHOREMAIL     string    `json:"AUTHOR_EMAIL"`
		POSTDATE        time.Time `json:"POST_DATE"`
		POSTMESSAGE     string    `json:"POST_MESSAGE"`
		ATTACHEDOBJECTS struct {
			Num601 struct {
				ATTACHMENTID string `json:"ATTACHMENT_ID"`
				NAME         string `json:"NAME"`
				SIZE         string `json:"SIZE"`
				FILEID       string `json:"FILE_ID"`
				DOWNLOADURL  string `json:"DOWNLOAD_URL"`
				VIEWURL      string `json:"VIEW_URL"`
			} `json:"601"`
		} `json:"ATTACHED_OBJECTS,omitempty"`
	} `json:"result"`
}

type RespondeAddtask struct {
	Result struct {
		Task TaskB `json:"task"`
	} `json:"result"`
}

type TaskB struct {
	TITLE                 string        `json:"TITLE"`
	STAGEID               string        `json:"STAGE_ID"`
	DESCRIPTION           string        `json:"DESCRIPTION"`
	DESCRIPTIONHTML       template.HTML `json:"DESCRIPTION_HTML"`
	DEADLINE              string        `json:"DEADLINE"`
	STARTDATEPLAN         string        `json:"START_DATE_PLAN"`
	ENDDATEPLAN           string        `json:"END_DATE_PLAN"`
	PRIORITY              string        `json:"PRIORITY"`
	AUDITORS              []string      `json:"AUDITORS"`
	ALLOWCHANGEDEADLINE   string        `json:"ALLOW_CHANGE_DEADLINE"`
	TASKCONTROL           string        `json:"TASK_CONTROL"`
	GROUPID               string        `json:"GROUP_ID"`
	RESPONSIBLEID         string        `json:"RESPONSIBLE_ID"`
	TIMEESTIMATE          string        `json:"TIME_ESTIMATE"`
	ID                    string        `json:"ID"`
	CREATEDBY             string        `json:"CREATED_BY"`
	DESCRIPTIONINBBCODE   string        `json:"DESCRIPTION_IN_BBCODE"`
	REALSTATUS            string        `json:"REAL_STATUS"`
	STATUS                string        `json:"STATUS"`
	RESPONSIBLENAME       string        `json:"RESPONSIBLE_NAME"`
	RESPONSIBLELASTNAME   string        `json:"RESPONSIBLE_LAST_NAME"`
	RESPONSIBLESECONDNAME string        `json:"RESPONSIBLE_SECOND_NAME"`
	DATESTART             string        `json:"DATE_START"`
	DURATIONTYPE          string        `json:"DURATION_TYPE"`
	CREATEDBYNAME         string        `json:"CREATED_BY_NAME"`
	CREATEDBYLASTNAME     string        `json:"CREATED_BY_LAST_NAME"`
	CREATEDBYSECONDNAME   string        `json:"CREATED_BY_SECOND_NAME"`
	CREATEDDATE           string        `json:"CREATED_DATE"`
	CHANGEDBY             string        `json:"CHANGED_BY"`
	CHANGEDDATE           string        `json:"CHANGED_DATE"`
	STATUSCHANGEDBY       string        `json:"STATUS_CHANGED_BY"`
	STATUSCHANGEDDATE     string        `json:"STATUS_CHANGED_DATE"`
	CLOSEDDATE            string        `json:"CLOSED_DATE"`
	GUID                  string        `json:"GUID"`
	VIEWEDDATE            string        `json:"VIEWED_DATE"`
	FAVORITE              string        `json:"FAVORITE"`
	ALLOWTIMETRACKING     string        `json:"ALLOW_TIME_TRACKING"`
	MATCHWORKTIME         string        `json:"MATCH_WORK_TIME"`
	ADDINREPORT           string        `json:"ADD_IN_REPORT"`
	COMMENTSCOUNT         string        `json:"COMMENTS_COUNT"`
	SITEID                string        `json:"SITE_ID"`
	SUBORDINATE           string        `json:"SUBORDINATE"`
	MULTITASK             string        `json:"MULTITASK"`
}

type TaskB24 struct {
	Result struct {
		TITLE               string        `json:"TITLE"`
		STAGEID             string        `json:"STAGE_ID"`
		DESCRIPTION         string        `json:"DESCRIPTION"`
		DESCRIPTIONHTML     template.HTML `json:"DESCRIPTION_HTML"`
		DEADLINE            string        `json:"DEADLINE"`
		STARTDATEPLAN       string        `json:"START_DATE_PLAN"`
		ENDDATEPLAN         string        `json:"END_DATE_PLAN"`
		PRIORITY            string        `json:"PRIORITY"`
		AUDITORS            []string      `json:"AUDITORS"`
		ALLOWCHANGEDEADLINE string        `json:"ALLOW_CHANGE_DEADLINE"`
		TASKCONTROL         string        `json:"TASK_CONTROL"`
		GROUPID             string        `json:"GROUP_ID"`
		RESPONSIBLEID       string        `json:"RESPONSIBLE_ID"`
		TIMEESTIMATE        string        `json:"TIME_ESTIMATE"`
		ID                  string        `json:"ID"`
		CREATEDBY           string        `json:"CREATED_BY"`
		DESCRIPTIONINBBCODE string        `json:"DESCRIPTION_IN_BBCODE"`

		REALSTATUS            string `json:"REAL_STATUS"`
		STATUS                string `json:"STATUS"`
		RESPONSIBLENAME       string `json:"RESPONSIBLE_NAME"`
		RESPONSIBLELASTNAME   string `json:"RESPONSIBLE_LAST_NAME"`
		RESPONSIBLESECONDNAME string `json:"RESPONSIBLE_SECOND_NAME"`
		DATESTART             string `json:"DATE_START"`

		DURATIONTYPE        string `json:"DURATION_TYPE"`
		CREATEDBYNAME       string `json:"CREATED_BY_NAME"`
		CREATEDBYLASTNAME   string `json:"CREATED_BY_LAST_NAME"`
		CREATEDBYSECONDNAME string `json:"CREATED_BY_SECOND_NAME"`
		CREATEDDATE         string `json:"CREATED_DATE"`
		CHANGEDBY           string `json:"CHANGED_BY"`
		CHANGEDDATE         string `json:"CHANGED_DATE"`
		STATUSCHANGEDBY     string `json:"STATUS_CHANGED_BY"`
		STATUSCHANGEDDATE   string `json:"STATUS_CHANGED_DATE"`

		CLOSEDDATE string `json:"CLOSED_DATE"`
		GUID       string `json:"GUID"`

		VIEWEDDATE string `json:"VIEWED_DATE"`

		FAVORITE          string `json:"FAVORITE"`
		ALLOWTIMETRACKING string `json:"ALLOW_TIME_TRACKING"`
		MATCHWORKTIME     string `json:"MATCH_WORK_TIME"`
		ADDINREPORT       string `json:"ADD_IN_REPORT"`

		COMMENTSCOUNT string `json:"COMMENTS_COUNT"`
		SITEID        string `json:"SITE_ID"`
		SUBORDINATE   string `json:"SUBORDINATE"`

		MULTITASK string `json:"MULTITASK"`
	} `json:"result"`
}

type ResponsibleUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Link string `json:"link"`
	Icon string `json:"icon"`
}
type TasksB24 struct {
	Result struct {
		Tasks []struct {
			ID                  int         `json:"id,string"`
			ParentID            interface{} `json:"parentId"`
			Title               string      `json:"title"`
			Description         string      `json:"description"`
			Mark                interface{} `json:"mark"`
			Priority            string      `json:"priority"`
			Status              string      `json:"status"`
			Multitask           string      `json:"multitask"`
			NotViewed           string      `json:"notViewed"`
			Replicate           string      `json:"replicate"`
			GroupID             int         `json:"groupId,string"`
			StageID             string      `json:"stageId"`
			CreatedBy           string      `json:"createdBy"`
			CreatedDate         time.Time   `json:"createdDate"`
			ResponsibleID       string      `json:"responsibleId"`
			ChangedBy           string      `json:"changedBy"`
			ChangedDate         time.Time   `json:"changedDate"`
			StatusChangedBy     string      `json:"statusChangedBy"`
			StatusChangedDate   time.Time   `json:"statusChangedDate"`
			ClosedBy            interface{} `json:"closedBy"`
			ClosedDate          interface{} `json:"closedDate"`
			DateStart           time.Time   `json:"dateStart"`
			Deadline            interface{} `json:"deadline"`
			StartDatePlan       interface{} `json:"startDatePlan"`
			EndDatePlan         interface{} `json:"endDatePlan"`
			GUID                string      `json:"guid"`
			XMLID               interface{} `json:"xmlId"`
			CommentsCount       string      `json:"commentsCount"`
			TaskControl         string      `json:"taskControl"`
			AddInReport         string      `json:"addInReport"`
			ForkedByTemplateID  interface{} `json:"forkedByTemplateId"`
			TimeEstimate        string      `json:"timeEstimate"`
			TimeSpentInLogs     interface{} `json:"timeSpentInLogs"`
			MatchWorkTime       string      `json:"matchWorkTime"`
			ForumTopicID        string      `json:"forumTopicId"`
			ForumID             string      `json:"forumId"`
			SiteID              string      `json:"siteId"`
			Subordinate         string      `json:"subordinate"`
			ExchangeModified    interface{} `json:"exchangeModified"`
			ExchangeID          interface{} `json:"exchangeId"`
			OutlookVersion      string      `json:"outlookVersion"`
			ViewedDate          time.Time   `json:"viewedDate"`
			Sorting             string      `json:"sorting"`
			DurationPlan        string      `json:"durationPlan"`
			DurationFact        interface{} `json:"durationFact"`
			DurationType        string      `json:"durationType"`
			DescriptionInBbcode string      `json:"descriptionInBbcode"`
			//UfTaskWebdavFiles   []interface{} `json:"ufTaskWebdavFiles"`
			UfMailMessage      interface{} `json:"ufMailMessage"`
			UfAuto557352811672 interface{} `json:"ufAuto557352811672"`
			Auditors           []string    `json:"auditors"`
			Accomplices        []string    `json:"accomplices,string"`
			//Accomplices      string `json:"accomplices`
			NewCommentsCount int    `json:"newCommentsCount"`
			SubStatus        string `json:"subStatus"`
			Creator          struct {
				ID   string `json:"id"`
				Name string `json:"name"`
				Link string `json:"link"`
				Icon string `json:"icon"`
			} `json:"creator"`
			Responsible ResponsibleUser `json:"responsible"`
		} `json:"tasks"`
	} `json:"result"`
}

type TasksByID struct {
	Result []struct {
		Title string `json:"TITLE"`
		Id    string `json:"ID"`
	} `json:"result"`
}
type QuerySort struct {
	Order struct {
		Name string `json:"NAME"`
		Id   string `json:"ID"`
	} `json:"ORDER"`
	Filter struct {
		Id []string `json:"ID"`
	} `json:"filter"`
	Start int `json:"start"`
}

type UserB24 struct {
	Result []struct {
		ID                 string `json:"ID"`
		ACTIVE             bool   `json:"ACTIVE"`
		EMAIL              string `json:"EMAIL"`
		NAME               string `json:"NAME"`
		LASTNAME           string `json:"LAST_NAME"`
		SECONDNAME         string `json:"SECOND_NAME"`
		PERSONALGENDER     string `json:"PERSONAL_GENDER"`
		PERSONALPROFESSION string `json:"PERSONAL_PROFESSION"`
		PERSONALWWW        string `json:"PERSONAL_WWW"`
		PERSONALBIRTHDAY   string `json:"PERSONAL_BIRTHDAY"`
		PERSONALPHOTO      string `json:"PERSONAL_PHOTO"`
		PERSONALPHOTOURL   template.HTML
		PERSONALICQ        string      `json:"PERSONAL_ICQ"`
		PERSONALPHONE      string      `json:"PERSONAL_PHONE"`
		PERSONALFAX        string      `json:"PERSONAL_FAX"`
		PERSONALMOBILE     string      `json:"PERSONAL_MOBILE"`
		PERSONALPAGER      interface{} `json:"PERSONAL_PAGER"`
		PERSONALSTREET     interface{} `json:"PERSONAL_STREET"`
		PERSONALCITY       string      `json:"PERSONAL_CITY"`
		PERSONALSTATE      interface{} `json:"PERSONAL_STATE"`
		PERSONALZIP        interface{} `json:"PERSONAL_ZIP"`
		PERSONALCOUNTRY    interface{} `json:"PERSONAL_COUNTRY"`
		WORKCOMPANY        interface{} `json:"WORK_COMPANY"`
		WORKPOSITION       string      `json:"WORK_POSITION"`
		WORKPHONE          string      `json:"WORK_PHONE"`
		UFDEPARTMENT       []int       `json:"UF_DEPARTMENT"`
		UFINTERESTS        interface{} `json:"UF_INTERESTS"`
		UFSKILLS           interface{} `json:"UF_SKILLS"`
		UFWEBSITES         interface{} `json:"UF_WEB_SITES"`
		UFXING             interface{} `json:"UF_XING"`
		UFLINKEDIN         interface{} `json:"UF_LINKEDIN"`
		UFFACEBOOK         interface{} `json:"UF_FACEBOOK"`
		UFTWITTER          interface{} `json:"UF_TWITTER"`
		UFSKYPE            string      `json:"UF_SKYPE"`
		UFDISTRICT         interface{} `json:"UF_DISTRICT"`
		UFPHONEINNER       string      `json:"UF_PHONE_INNER"`
	} `json:"result"`
}

type CurrentUserB24 struct {
	Result struct {
		ID                 int    `json:"ID,string"`
		ACTIVE             bool   `json:"ACTIVE"`
		EMAIL              string `json:"EMAIL"`
		NAME               string `json:"NAME"`
		LASTNAME           string `json:"LAST_NAME"`
		SECONDNAME         string `json:"SECOND_NAME"`
		PERSONALGENDER     string `json:"PERSONAL_GENDER"`
		PERSONALPROFESSION string `json:"PERSONAL_PROFESSION"`
		PERSONALWWW        string `json:"PERSONAL_WWW"`
		PERSONALBIRTHDAY   string `json:"PERSONAL_BIRTHDAY"`
		PERSONALPHOTO      string `json:"PERSONAL_PHOTO"`
		PERSONALPHOTOURL   template.HTML
		PERSONALICQ        string      `json:"PERSONAL_ICQ"`
		PERSONALPHONE      string      `json:"PERSONAL_PHONE"`
		PERSONALFAX        string      `json:"PERSONAL_FAX"`
		PERSONALMOBILE     string      `json:"PERSONAL_MOBILE"`
		PERSONALPAGER      interface{} `json:"PERSONAL_PAGER"`
		PERSONALSTREET     interface{} `json:"PERSONAL_STREET"`
		PERSONALCITY       string      `json:"PERSONAL_CITY"`
		PERSONALSTATE      interface{} `json:"PERSONAL_STATE"`
		PERSONALZIP        interface{} `json:"PERSONAL_ZIP"`
		PERSONALCOUNTRY    interface{} `json:"PERSONAL_COUNTRY"`
		WORKCOMPANY        interface{} `json:"WORK_COMPANY"`
		WORKPOSITION       string      `json:"WORK_POSITION"`
		WORKPHONE          string      `json:"WORK_PHONE"`
		UFDEPARTMENT       []int       `json:"UF_DEPARTMENT"`
		UFINTERESTS        interface{} `json:"UF_INTERESTS"`
		UFSKILLS           interface{} `json:"UF_SKILLS"`
		UFWEBSITES         interface{} `json:"UF_WEB_SITES"`
		UFXING             interface{} `json:"UF_XING"`
		UFLINKEDIN         interface{} `json:"UF_LINKEDIN"`
		UFFACEBOOK         interface{} `json:"UF_FACEBOOK"`
		UFTWITTER          interface{} `json:"UF_TWITTER"`
		UFSKYPE            string      `json:"UF_SKYPE"`
		UFDISTRICT         interface{} `json:"UF_DISTRICT"`
		UFPHONEINNER       string      `json:"UF_PHONE_INNER"`
	} `json:"result"`
}

type Oauth2Succes struct {
	AccessToken    string `json:"access_token"`
	ClientEndpoint string `json:"client_endpoint"`
	Domain         string `json:"domain"`
	ExpiresIn      int    `json:"expires_in"`
	MemberID       string `json:"member_id"`
	RefreshToken   string `json:"refresh_token"`
	Scope          string `json:"scope"`
	ServerEndpoint string `json:"server_endpoint"`
	Status         string `json:"status"`
}

type ListTask struct {
	Result []struct {
		GROUPID       string `json:"GROUP_ID"`
		RESPONSIBLEID string `json:"RESPONSIBLE_ID"`
		ID            string `json:"ID"`
		CREATEDBY     string `json:"CREATED_BY"`
		REALSTATUS    string `json:"REAL_STATUS"`
		STATUS        string `json:"STATUS"`
	} `json:"result"`
	Total int `json:"total"`
}
type UserFromChat struct {
	Result struct {
		ID               string    `json:"id"`
		Name             string    `json:"name"`
		FirstName        string    `json:"first_name"`
		LastName         string    `json:"last_name"`
		WorkPosition     string    `json:"work_position"`
		Color            string    `json:"color"`
		Avatar           string    `json:"avatar"`
		Gender           string    `json:"gender"`
		Birthday         string    `json:"birthday"`
		Extranet         bool      `json:"extranet"`
		Network          bool      `json:"network"`
		Bot              bool      `json:"bot"`
		Connector        bool      `json:"connector"`
		ExternalAuthID   string    `json:"external_auth_id"`
		Status           string    `json:"status"`
		Idle             bool      `json:"idle"`
		LastActivityDate time.Time `json:"last_activity_date"`
		MobileLastDate   time.Time `json:"mobile_last_date"`
		Departments      []int     `json:"departments"`
		Absent           bool      `json:"absent"`
		Phones           struct {
			PersonalMobile string `json:"personal_mobile"`
			InnerPhone     string `json:"inner_phone"`
		} `json:"phones"`
		DesktopLastDate time.Time `json:"desktop_last_date"`
	} `json:"result"`
	Time struct {
		Start      float64   `json:"start"`
		Finish     float64   `json:"finish"`
		Duration   float64   `json:"duration"`
		Processing float64   `json:"processing"`
		DateStart  time.Time `json:"date_start"`
		DateFinish time.Time `json:"date_finish"`
	} `json:"time"`
}

func (Cb *ConnectionBitrix24) GetTask(id int) (app TaskB24, err error) {
	app = TaskB24{}
	fmt.Println(strconv.Itoa(id))
	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/task.item.getdata.json?taskId=" + strconv.Itoa(id)

	req := httplib.Get(request)
	str, err := req.Bytes()

	if err != nil {
		return app, err
	}

	err = json.Unmarshal(str, &app)
	if err != nil {
		return app, err
	}
	app.Result.DESCRIPTION = strings.Replace(app.Result.DESCRIPTION, "[", "<", -1)
	app.Result.DESCRIPTION = strings.Replace(app.Result.DESCRIPTION, "]", ">", -1)

	app.Result.DESCRIPTIONHTML = template.HTML(strings.Replace(app.Result.DESCRIPTION, "\n", "\n<br>", -1))
	return app, nil
}

func (Cb *ConnectionBitrix24) AddTask(task map[string]string) (newtask TaskB, err error) {
	app := RespondeAddtask{}

	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/tasks.task.add"

	req := httplib.Post(request)

	for key, value := range task {
		req.Param(string("fields["+key+"]"), value)
	}

	str, err := req.Bytes()
	if err != nil {
		return newtask, err
	}

	err = json.Unmarshal(str, &app)
	if err != nil {
		return newtask, err
	}

	return app.Result.Task, nil
}

func (Cb *ConnectionBitrix24) CompleteTask(idTaskBitrix24 int) (err error) {

	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/tasks.task.complete"
	req := httplib.Post(request)
	req.Param("taskId", strconv.Itoa(idTaskBitrix24))

	_, err = req.Bytes()
	if err != nil {
		return err
	}

	return nil
}

func (Cb *ConnectionBitrix24) GetUser(id string) (app UserB24, err error) {
	app = UserB24{}

	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/user.get.json?ID=" + id
	req := httplib.Get(request)
	str, err := req.Bytes()

	if err != nil {
		return app, err
	}

	err = json.Unmarshal(str, &app)
	if err != nil {
		return app, err
	}
	return app, nil
}

func (Cb *ConnectionBitrix24) GetUserFromChat(id string) (app UserFromChat, err error) {
	app = UserFromChat{}

	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/im.user.get?ID=" + id
	req := httplib.Get(request)
	str, err := req.Bytes()

	if err != nil {
		return app, err
	}

	err = json.Unmarshal(str, &app)
	if err != nil {
		return app, err
	}
	return app, nil
}

func (Cb *ConnectionBitrix24) GetCommentsById(id string) (comments Comments, err error) {
	comments = Comments{}

	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/task.commentitem.getlist?TASKID=" + id
	req := httplib.Get(request)
	str, err := req.Bytes()

	if err != nil {
		return comments, err
	}

	err = json.Unmarshal(str, &comments)
	if err != nil {
		return comments, err
	}

	return comments, nil
}

func (Cb *ConnectionBitrix24) GetTaskList(id string) (app ListTask, err error) {
	app = ListTask{}
	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/tasks.item.list.json?Order[]=&FILTER[GROUP_ID]=" + id + "&FILTER[!REAL_STATUS]=5&PARAMS[]=&SELECTED[]=[ID,TITLE]"
	req := httplib.Get(request)
	str, err := req.Bytes()

	if err != nil {
		return app, err
	}

	err = json.Unmarshal(str, &app)
	if err != nil {
		return app, err
	}

	return app, nil
}

func (Cb *ConnectionBitrix24) GetTaskListById(filter []int) (app TasksB24, err error) {
	jsonFilter := QuerySort{}
	app = TasksB24{}
	tempValue := TasksB24{}
	page := 0
	currentTasks := make([]string, 50)
	for i, task := range filter {
		var lenNewArray int

		if (len(filter) - 50*page) < 50 {
			lenNewArray = 50
		} else {
			lenNewArray = len(filter) - 50*(page+1)
		}

		currentTasks[i-50*page] = strconv.Itoa(task)

		if ((i+1)%50) == 0 || len(filter)-1 == i {

			jsonFilter.Start = page
			jsonFilter.Filter.Id = currentTasks

			request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/tasks.task.list.json"
			req := httplib.Post(request)
			req.JSONBody(jsonFilter)
			str, err := req.Bytes()
			if err != nil {
				return tempValue, err
			}
			err = json.Unmarshal(str, &tempValue)
			if err != nil {
				return tempValue, err
			}

			if len(filter) > 50 || page > 0 || len(filter)-1 == i {
				app.Result.Tasks = append(app.Result.Tasks, tempValue.Result.Tasks...)
				currentTasks = make([]string, lenNewArray)
				page++

			} else {
				app = tempValue

			}

		}

	}

	return app, nil
}

func (Cb *ConnectionBitrix24) GetProjectListById(filter string) (projects Project, err error) {
	jsonFilter := QuerySort{}

	s := `{
		"Order": {
			"Id": "DESC"
			},
		"Filter": {
			"Id": ` + filter + `
		  },

		}`
	_ = json.Unmarshal([]byte(s), &jsonFilter)

	projects = Project{}
	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/sonet_group.get.json"

	req := httplib.Post(request)
	req.JSONBody(jsonFilter)
	str, err := req.Bytes()

	if err != nil {
		return projects, err
	}

	err = json.Unmarshal(str, &projects)
	if err != nil {
		return projects, err
	}

	return projects, err
}

func GetUserOauth2Bitrix24(code string) (User model.User, err error) {

	query := `https://oauth.bitrix.info/oauth/token/?grant_type=authorization_code&client_id=` +
		beego.AppConfig.String("Bitrix24ClientId") +
		`&client_secret=` + beego.AppConfig.String("Bitrix24ClientSecret") +
		`&code=` + code
	request := httplib.Post(query)

	str, err := request.Bytes()

	if err != nil {
		return User, errors.New("Ошибка авторизации на сервере Битрикса24")
	}
	Oauth2Succes := Oauth2Succes{}
	err = json.Unmarshal(str, &Oauth2Succes)
	if err != nil {
		return User, errors.New("Ошибка авторизации на сервере Битрикса24")
	}
	// Шаг 2 получаем текущего пользователя
	query = `https://` + beego.AppConfig.String("BitrixDomen") + `/rest/user.current.json?auth=` + Oauth2Succes.AccessToken
	request = httplib.Post(query)
	str, err = request.Bytes()

	if err != nil {
		return User, errors.New("Ошибка получения данных пользователя, неверный AccessToken")
	}
	CurrentUserB24 := CurrentUserB24{}
	err = json.Unmarshal(str, &CurrentUserB24)
	if err != nil {
		return User, errors.New("Ошибка получения данных пользователя, формат ответа JSON")
	}

	User.Firstname = CurrentUserB24.Result.NAME
	User.Secondname = CurrentUserB24.Result.LASTNAME
	User.Bitrix24id = CurrentUserB24.Result.ID
	err = User.ValidCurentUserOrAdd()
	if err != nil {
		return User, errors.New("Ошибка Авторизации")
	}

	return User, nil
}
