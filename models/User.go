package models

import (
	"errors"

	"github.com/astaxie/beego/orm"
)

// User model of user
type User struct {
	Id             int
	Firstname      string
	Secondname     string
	Password       string
	Theme          string
	Bitrix24id     int
	Defaulttaskb24 int
}

func init() {
	orm.RegisterModel(new(User))
}

//ValidCurentUserOrAdd method
func (user *User) ValidCurentUserOrAdd() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	UserFromDB := User{}
	err = database.QueryTable("User").Filter("Bitrix24id", user.Bitrix24id).One(&UserFromDB)

	if err != orm.ErrNoRows {
		user.Id = UserFromDB.Id
		user.Firstname = UserFromDB.Firstname
		user.Secondname = UserFromDB.Secondname
		user.Theme = UserFromDB.Theme
	} else {
		UserFromDB.Firstname = user.Firstname
		UserFromDB.Secondname = user.Secondname
		UserFromDB.Bitrix24id = user.Bitrix24id
		UserFromDB.Theme = "light"
		database.Insert(&UserFromDB)
	}

	return nil
}

//ValidUser method
func ValidUser(Username string, Password string) (user User, err error) {

	database := orm.NewOrm()
	database.Using("default")
	count, err := database.QueryTable("user").Filter("firstname", Username).Filter("password", Password).All(&user)

	if count == 1 {
		user.Password = ""
		return user, nil
	} else if count > 1 {
		err = errors.New("Too much users")
		return user, err
	}
	err = errors.New("user not found")
	return user, err
}
