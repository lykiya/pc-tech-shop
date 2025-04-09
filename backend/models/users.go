package models

type User struct {
	ID           int64  `gorm:"primaryKey;autoIncrement" json:"id"` // Первичный ключ, автоинкремент
	Name         string `gorm:"not null" json:"name"`               // Обязательное поле
	Surname      string `gorm:"not null" json:"surname"`            // Обязательное поле
	Phone        string `gorm:"unique;not null" json:"phone"`       // Уникальное поле, обязательное
	Email        string `gorm:"unique;not null" json:"email"`       // Уникальное поле, обязательное
	Passwordhash string `gorm:"not null" json:"password"`           // Обязательное поле
	Type         string `gorm:"not null;default:'user'" json:"type"` // Тип пользователя (user или admin)
}
