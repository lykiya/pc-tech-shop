package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name        string  `json:"name" gorm:"not null"`
	Description string  `json:"description"`
	Price       float64 `json:"price" gorm:"not null"`
	ImageURL    string  `json:"image_url"`
	Category    string  `json:"category"`
	InStock     bool    `json:"in_stock" gorm:"default:true"`
}
