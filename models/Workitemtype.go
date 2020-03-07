package Models

import (
	"github.com/astaxie/beego/orm"
)

type Workitemtype struct {
	WorkitemtypeId int `orm:"pk"`
	Name           string
	SLA            int
	Color          string
	Description    int
}

func init() {
	orm.RegisterModel(new(Workitemtype))
}

func GetWorkItemTypeById(workItemtype Workitemtype, id string) (err error) {

	database := orm.NewOrm()
	database.Using("default")

	count, err := database.QueryTable("Workitemtype").Filter("Idworkitemtype", id).All(&workItemtype)
	if count == 0 {
		count, _ = database.QueryTable("Workitemtype").Filter("Idworkitemtype", 0).All(&workItemtype)
	}

	return err
}
