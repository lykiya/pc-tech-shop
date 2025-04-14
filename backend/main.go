package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"pc-tech-shop/config"
	"pc-tech-shop/models"
	"pc-tech-shop/routes"
)

func main() {
	newConfig, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := config.Connection(newConfig)
	if err != nil {
		log.Fatal(err)
	}

	// Автоматическая миграция таблиц
	err = db.AutoMigrate(
		&models.CPU{},
		&models.GPU{},
		&models.Motherboard{},
		&models.Body{},
		&models.RAM{},
		&models.PowerUnit{},
		&models.HDD{},
		&models.SSD{},
		&models.Pcbuild{},
		&models.CartItem{},
		&models.Request{},
	)
	if err != nil {
		log.Printf("Ошибка при миграции таблиц: %v", err)
	}

	router := gin.Default()

	// Add database middleware
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "https://pc-tech-shop-1.onrender.com")  // Разрешаем доступ с вашего домена
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")     // Разрешаем методы
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization") // Разрешаем заголовки
		c.Header("Access-Control-Allow-Credentials", "true")                            // Разрешаем передачу учетных данных

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// Настройка маршрутов
	routes.UserRoutes(router, db)

	// Запуск сервера
	router.Run(":8080")
}
