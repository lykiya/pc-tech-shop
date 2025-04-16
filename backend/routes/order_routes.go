package routes

import (
	"pc-tech-shop/controllers"
	"pc-tech-shop/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func OrderRoutes(router *gin.Engine, db *gorm.DB) {
	orderController := controllers.NewOrderController(db)

	// Группа маршрутов для заказов
	orderGroup := router.Group("/orders")
	orderGroup.Use(middleware.AuthMiddleware())
	{
		orderGroup.POST("/", orderController.CreateOrder)
		orderGroup.GET("/", orderController.GetOrders)
	}
}
