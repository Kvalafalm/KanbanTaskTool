package Models

import (
	"github.com/astaxie/beego/orm"
)

type User struct {
	Id   int
	Name string
}

func init() {
	// Need to register model in init
	orm.RegisterModel(new(User))
}

type CurrentUser struct {
	Id         string
	FirstName  string
	SecondName string
	Password   string
}

func (this *CurrentUser) TableName() string {
	return "auth_user"
}

func ValidUser(Username string, Password string) (User CurrentUser, err string) {

	err = ""
	if (Username == "1") && (Password == "1") {
		User = CurrentUser{"1", "Nikolay", "Kutnyashenko", "1"}
	} else if (Username == "2") && (Password == "2") {
		User = CurrentUser{"2", "Колямба", "Хохотамба", "2"}
	} else {
		err = "Error Auth "
	}

	return User, err
}
