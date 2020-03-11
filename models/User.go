package Models

import (
	"errors"
	"fmt"

	"github.com/astaxie/beego/orm"
)

type User struct {
	Id         int
	Firstname  string
	Secondname string
	Password   string
	Theme      string
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
		this.Theme = UserFromDB.Theme
	} else {
		UserFromDB.Firstname = this.Firstname
		UserFromDB.Secondname = this.Secondname
		UserFromDB.Bitrix24id = this.Bitrix24id
		database.Insert(&UserFromDB)
	}

	return nil
}

func ValidUser(Username string, Password string) (user User, err error) {

	database := orm.NewOrm()
	database.Using("default")
	//.Filter("password", Password)
	count, err := database.QueryTable("user").Filter("firstname", Username).Filter("password", Password).All(&user)
	fmt.Println(count)
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
