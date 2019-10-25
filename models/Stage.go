package Models

import "github.com/astaxie/beego/orm"

type Stage struct {
	Idstage     int `orm:"auto"`
	Name        string
	Description string
	Order       int
}

func init() {
	orm.RegisterModel(new(Stage))

}

func GetStageFromDB(id int) (Stages Stage, err error) {
	database := orm.NewOrm()
	database.Using("default")

	//_, err = database.QueryTable("Stage").OrderBy("Order").All(&Stages)
	_, err = database.QueryTable("Stage").Filter("Idstage", id).All(&Stages)
	return Stages, err
}
