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
	CPU         CPU         `json:"cpu" gorm:"foreignKey:PCID"`
	GPU         GPU         `json:"gpu" gorm:"foreignKey:PCID"`
	Motherboard Motherboard `json:"motherboard" gorm:"foreignKey:PCID"`
	RAM         RAM         `json:"ram" gorm:"foreignKey:PCID"`
	PowerUnit   PowerUnit   `json:"power_unit" gorm:"foreignKey:PCID"`
	Body        Body        `json:"body" gorm:"foreignKey:PCID"`
	HDD         HDD         `json:"hdd" gorm:"foreignKey:PCID"`
	SSD         SSD         `json:"ssd" gorm:"foreignKey:PCID"`
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
