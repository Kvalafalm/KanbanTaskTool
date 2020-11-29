package models

import (
	"github.com/astaxie/beego/orm"
)

type Group struct {
	ID    int `orm:"pk;column(id)" `
	Name  string
	Image string
}

func init() {
	orm.RegisterModel(new(Group))
}

func (th *Group) Update() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	group := Group{
		ID:    th.ID,
		Name:  th.Name,
		Image: th.Image,
	}
	err = database.QueryTable(new(Group)).Filter("id", th.ID).One(&group)
	if err != orm.ErrNoRows {
		_, err = database.QueryTable(new(Group)).Filter("id", group.ID).Update(orm.Params{
			"Name":  th.Name,
			"Image": th.Image,
		})
		if err != nil {
			return err
		}
	} else {
		database.Insert(&group)
	}

	return nil
}
