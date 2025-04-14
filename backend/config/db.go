package config

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Функция для подключения к базе данных
func Connection(config *DBConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
		config.Host, config.User, config.Password, config.DBName, config.Port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("не удалось подключиться к базе данных: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("не удалось получить объект базы данных: %v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("не удалось подключиться к базе данных: %v", err)
	}

	return db, nil
}
