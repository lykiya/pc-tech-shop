package main

import (
	"log"
	"pc-tech-shop/models"

	"gorm.io/gorm"
)

func migrate(db *gorm.DB) {
	// Автоматическая миграция всех моделей
	err := db.AutoMigrate(
		&models.User{},
		&models.PC{},
		&models.CPU{},
		&models.GPU{},
		&models.Motherboard{},
		&models.RAM{},
		&models.PowerUnit{},
		&models.Body{},
		&models.HDD{},
		&models.SSD{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatalf("Ошибка при миграции: %v", err)
	}
	log.Println("Миграция успешно завершена")
}
