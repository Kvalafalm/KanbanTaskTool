package Services

import (
	"encoding/json"
	"fmt"
	"html/template"
	"strconv"
	"strings"
	"time"

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
			UfMailMessage      interface{}   `json:"ufMailMessage"`
			UfAuto557352811672 interface{}   `json:"ufAuto557352811672"`
			Auditors           []string      `json:"auditors"`
			Accomplices        []interface{} `json:"accomplices"`
			//Accomplices      string `json:"accomplices`
			NewCommentsCount int    `json:"newCommentsCount"`
			SubStatus        string `json:"subStatus"`
			Creator          struct {
				ID   string `json:"id"`
				Name string `json:"name"`
				Link string `json:"link"`
				Icon string `json:"icon"`
			} `json:"creator"`
			Responsible struct {
				ID   string `json:"id"`
				Name string `json:"name"`
				Link string `json:"link"`
				Icon string `json:"icon"`
			} `json:"responsible"`
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
	Total int `json:"total"`
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
	request := "https://" + Cb.Portal + "/rest/" + Cb.UserID + "/" + Cb.Webhook + "/task.item.list.json?Order[]=&FILTER[GROUP_ID]=" + id + "&FILTER[!REAL_STATUS]=5&PARAMS[]=&SELECTED[]=[ID,TITLE]"
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
