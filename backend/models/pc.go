package models

import "time"

type PC struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	TotalPrice  float64   `json:"total_price"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Компоненты
	CPU         CPU         `json:"cpu" gorm:"foreignKey:ID;references:ID"`
	GPU         GPU         `json:"gpu" gorm:"foreignKey:ID;references:ID"`
	Motherboard Motherboard `json:"motherboard" gorm:"foreignKey:ID;references:ID"`
	RAM         RAM         `json:"ram" gorm:"foreignKey:ID;references:ID"`
	PowerUnit   PowerUnit   `json:"power_unit" gorm:"foreignKey:ID;references:ID"`
	Body        Body        `json:"body" gorm:"foreignKey:ID;references:ID"`
	HDD         HDD         `json:"hdd" gorm:"foreignKey:ID;references:ID"`
	SSD         SSD         `json:"ssd" gorm:"foreignKey:ID;references:ID"`
}

func (PC) TableName() string {
	return "pcs"
}

type PCFilter struct {
	Categories []string `json:"categories"`
	MinPrice   float64  `json:"min_price"`
	MaxPrice   float64  `json:"max_price"`
	SortBy     string   `json:"sort_by"`
}
