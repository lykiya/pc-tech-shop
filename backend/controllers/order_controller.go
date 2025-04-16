package controllers

import (
	"pc-tech-shop/models"

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
		TotalAmount     float64 `json:"total_amount"`
		Status          string  `json:"status"`
		ShippingAddress string  `json:"shipping_address"`
		PaymentMethod   string  `json:"payment_method"`
		DeliveryMethod  string  `json:"delivery_method"`
		Comment         string  `json:"comment"`
		Items           []struct {
			BuildID  uint    `json:"build_id"`
			Quantity int     `json:"quantity"`
			Price    float64 `json:"price"`
		} `json:"items"`
	}

	if err := c.ShouldBindJSON(&orderData); err != nil {
		c.JSON(400, gin.H{"error": "Неверный формат данных"})
		return
	}

	// Создаем новый заказ
	order := models.Order{
		UserID:          uint(userID.(int64)),
		TotalAmount:     orderData.TotalAmount,
		Status:          models.OrderStatus(orderData.Status),
		ShippingAddress: orderData.ShippingAddress,
		PaymentMethod:   orderData.PaymentMethod,
		DeliveryMethod:  orderData.DeliveryMethod,
		Comment:         orderData.Comment,
	}

	// Начинаем транзакцию
	tx := oc.db.Begin()
	if tx.Error != nil {
		c.JSON(500, gin.H{"error": "Ошибка при создании заказа"})
		return
	}

	// Создаем заказ
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Ошибка при создании заказа"})
		return
	}

	// Создаем элементы заказа
	for _, item := range orderData.Items {
		orderItem := models.OrderItem{
			OrderID:  order.ID,
			BuildID:  item.BuildID,
			Quantity: item.Quantity,
			Price:    item.Price,
		}
		if err := tx.Create(&orderItem).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "Ошибка при создании элементов заказа"})
			return
		}
	}

	// Завершаем транзакцию
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Ошибка при завершении заказа"})
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
