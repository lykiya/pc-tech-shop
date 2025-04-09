package migrations

import (
	"time"

	"gorm.io/gorm"
)

func CreateRequestsTable(db *gorm.DB) error {
	type Request struct {
		ID        uint   `gorm:"primaryKey"`
		Name      string `gorm:"size:255;not null"`
		Phone     string `gorm:"size:20;not null"`
		Message   string `gorm:"type:text"`
		Status    string `gorm:"size:20;default:'new'"`
		CreatedAt time.Time
		UpdatedAt time.Time
	}

	return db.AutoMigrate(&Request{})
}
