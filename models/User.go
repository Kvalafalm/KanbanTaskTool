package Models

import (
	"github.com/astaxie/beego/orm"
)

type User struct {
	Id         int
	Firstname  string
	Secondname string
	Password   string
	Bitrix24id int
}

func init() {
	orm.RegisterModel(new(User))
}

func (this *User) ValidCurentUserOrAdd() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	UserFromDB := User{}
	err = database.QueryTable("User").Filter("Bitrix24id", this.Bitrix24id).One(&UserFromDB)

	if err != orm.ErrNoRows {
		this.Id = UserFromDB.Id
		this.Firstname = UserFromDB.Firstname
		this.Secondname = UserFromDB.Secondname
	} else {
		UserFromDB.Firstname = this.Firstname
		UserFromDB.Secondname = this.Secondname
		UserFromDB.Bitrix24id = this.Bitrix24id
		database.Insert(&UserFromDB)
	}

	return nil
}

func ValidUser(Username string, Password string) (user User, err string) {

	err = ""
	if (Username == "1") && (Password == "1") {
		user = User{1, "Nikolay", "Kutnyashenko", "1", 0}
	} else if (Username == "2") && (Password == "2") {
		user = User{2, "Колямба", "Хохотамба", "2", 0}
	} else {
		err = "Error Auth "
	}

	return user, err
}
