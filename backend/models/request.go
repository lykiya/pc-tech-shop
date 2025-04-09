package models

import (
	"time"
)

type Request struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Message   string    `json:"message"`
	Status    string    `json:"status" gorm:"default:'new'"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
