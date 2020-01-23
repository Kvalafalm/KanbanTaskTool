package Models

import (
	"github.com/astaxie/beego/orm"
)

type User struct {
	Id         int
	Firstname  string
	Secondname string
	password   string
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
	if (Username == "1") && (Password == "") {
		user = User{1, "Николай", "Кутняшенко", "1", 8}
	} else if (Username == "2") && (Password == "") {
		user = User{2, "Дима", "Шапкин", "2", 208}
	} else if (Username == "3") && (Password == "") {
		user = User{2, "Ксения", "Попова", "2", 208}
	} else if (Username == "Tarabarov") && (Password == "") {
		user = User{2, "Антон", "Тарабаров", "2", 361}
	} else if (Username == "Kiselev") && (Password == "") {
		user = User{2, "Антон", "Кисилев", "2", 407}
	} else if (Username == "Maklyak") && (Password == "") {
		user = User{2, "Сергей", "Макляк", "2", 409}
	} else {
		err = "Error Auth "
	}

	return user, err
}
