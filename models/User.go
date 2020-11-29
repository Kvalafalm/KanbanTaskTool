package models

import (
	"errors"
	"math/rand"
	"time"

	"github.com/astaxie/beego/orm"
)

// User model of user
type User struct {
	Id                  int `orm:"pk;column(id)"`
	Firstname           string
	Secondname          string
	Password            string `json:"-"`
	Theme               string
	Bitrix24id          int
	Defaulttaskb24      int
	Defaultdesk         int
	DefaultWorkItemType int `orm:"column(Defaultworkitemtype)" `
	Icon                string
	LastVisit           time.Time `orm:"null"`
	WorkItems           []*Tasks  `orm:"reverse(many)"`
}

func init() {
	orm.RegisterModel(new(User))
}

func (user *User) Join() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable(new(User)).Filter("id", user.Id).Update(orm.Params{
		"LastVisit": time.Now(),
	})
	return nil
}

func (user *User) GetUserByBitrix24ID() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	err = database.QueryTable(new(User)).Filter("Bitrix24id", user.Bitrix24id).One(user)
	if err != nil {
		return err
	}
	return nil
}

//UpdateIcon method for update icon in DB
func (user *User) UpdateIcon() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable(new(User)).Filter("id", user.Id).Update(orm.Params{
		"Icon": user.Icon,
	})
	return nil
}

//ValidCurentUserOrAdd method
func (user *User) ValidCurentUserOrAdd() (err error) {
	database := orm.NewOrm()
	database.Using("default")
	UserFromDB := User{}
	err = database.QueryTable(new(User)).Filter("Bitrix24id", user.Bitrix24id).One(&UserFromDB)

	if err != orm.ErrNoRows {
		user.Id = UserFromDB.Id
		user.Firstname = UserFromDB.Firstname
		user.Secondname = UserFromDB.Secondname
		user.Theme = UserFromDB.Theme
		user.Defaulttaskb24 = UserFromDB.Defaulttaskb24
		user.Defaultdesk = UserFromDB.Defaultdesk
		user.Icon = UserFromDB.Icon
	} else {
		UserFromDB.Firstname = user.Firstname
		UserFromDB.Password = generatePassword()
		UserFromDB.Secondname = user.Secondname
		UserFromDB.Bitrix24id = user.Bitrix24id
		UserFromDB.Theme = "light"
		UserFromDB.Defaulttaskb24 = 9675
		UserFromDB.Icon = user.Icon
		user.Theme = "light"
		UserFromDB.Defaulttaskb24 = 9675
		id, _ := database.Insert(&UserFromDB)
		user.Id = int(id)
	}

	return nil
}

//ValidUser method
func ValidUser(Username string, Password string) (user User, err error) {

	database := orm.NewOrm()
	database.Using("default")
	count, err := database.QueryTable(new(User)).Filter("firstname", Username).Filter("password", Password).All(&user)

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
func GetAllUsers() (user []User, err error) {
	database := orm.NewOrm()
	database.Using("default")
	_, err = database.QueryTable(new(User)).All(&user)

	return user, nil
}
func generatePassword() (str string) {
	rand.Seed(time.Now().UnixNano())
	digits := "0123456789"
	specials := "~=+%^*/()[]{}/!@#$?|"
	all := "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		digits + specials
	length := 8
	buf := make([]byte, length)
	buf[0] = digits[rand.Intn(len(digits))]
	buf[1] = specials[rand.Intn(len(specials))]
	for i := 2; i < length; i++ {
		buf[i] = all[rand.Intn(len(all))]
	}
	rand.Shuffle(len(buf), func(i, j int) {
		buf[i], buf[j] = buf[j], buf[i]
	})
	return string(buf)
}
