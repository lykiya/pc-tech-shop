package controllers

import (
	"pc-tech-shop/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderController struct {
	db *gorm.DB
}

func NewOrderController(db *gorm.DB) *OrderController {
	return &OrderController{db: db}
}

func (oc *OrderController) CreateOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists || userID == 0 {
		c.JSON(401, gin.H{"error": "Не авторизован"})
		return
	}

	var orderData struct {
		OrderDate       string  `json:"order_date"`
		TotalPrice      float64 `json:"total_price"`
		Status          string  `json:"status"`
		ShippingAddress string  `json:"shipping_address"`
		PaymentMethod   string  `json:"payment_method"`
		Comment         string  `json:"comment"`
	}

	if err := c.ShouldBindJSON(&orderData); err != nil {
		c.JSON(400, gin.H{"error": "Неверный формат данных"})
		return
	}

	// Создаем новый заказ
	order := models.Order{
		UserID:          int(userID.(int64)),
		OrderDate:       time.Now(),
		TotalPrice:      orderData.TotalPrice,
		Status:          orderData.Status,
		ShippingAddress: orderData.ShippingAddress,
		PaymentMethod:   orderData.PaymentMethod,
	}

	if err := oc.db.Create(&order).Error; err != nil {
		c.JSON(500, gin.H{"error": "Ошибка при создании заказа"})
		return
	}

	c.JSON(201, gin.H{
		"message":  "Заказ успешно создан",
		"order_id": order.ID,
	})
}

func (oc *OrderController) GetOrders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists || userID == 0 {
		c.JSON(401, gin.H{"error": "Не авторизован"})
		return
	}

	// Получаем роль пользователя из контекста
	role, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "Роль пользователя не определена"})
		return
	}

	var orders []struct {
		models.Order
		UserName string `json:"user_name"`
	}

	var err error

	// Если пользователь - админ, возвращаем все заказы
	if role == "admin" {
		err = oc.db.Table("orders").
			Select("orders.*, users.name as user_name").
			Joins("LEFT JOIN users ON orders.user_id = users.id").
			Find(&orders).Error
	} else {
		// Иначе возвращаем только заказы пользователя
		err = oc.db.Table("orders").
			Select("orders.*, users.name as user_name").
			Joins("LEFT JOIN users ON orders.user_id = users.id").
			Where("orders.user_id = ?", userID).
			Find(&orders).Error
	}

	if err != nil {
		c.JSON(500, gin.H{"error": "Ошибка при получении заказов"})
		return
	}

	c.JSON(200, orders)
}
