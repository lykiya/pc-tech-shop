package controllers

import (
	"fmt"
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

	// Логируем входящие данные
	fmt.Printf("Received order data: %+v\n", orderData)

	if err := c.ShouldBindJSON(&orderData); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		c.JSON(400, gin.H{"error": "Неверный формат данных: " + err.Error()})
		return
	}

	// Логируем данные после привязки
	fmt.Printf("Parsed order data: %+v\n", orderData)
	fmt.Printf("Total amount: %f\n", orderData.TotalAmount)
	fmt.Printf("Items count: %d\n", len(orderData.Items))

	// Проверяем обязательные поля
	if orderData.TotalAmount <= 0 {
		fmt.Printf("Invalid total amount: %f\n", orderData.TotalAmount)
		c.JSON(400, gin.H{"error": "Некорректная сумма заказа"})
		return
	}

	if len(orderData.Items) == 0 {
		fmt.Printf("No items in order\n")
		c.JSON(400, gin.H{"error": "Заказ должен содержать товары"})
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
		c.JSON(500, gin.H{"error": "Ошибка при создании заказа: " + err.Error()})
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
			c.JSON(500, gin.H{"error": "Ошибка при создании элементов заказа: " + err.Error()})
			return
		}
	}

	// Завершаем транзакцию
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Ошибка при завершении заказа: " + err.Error()})
		return
	}

	c.JSON(201, gin.H{
		"message":      "Заказ успешно создан",
		"order_id":     order.ID,
		"total_amount": order.TotalAmount,
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
			Preload("Items").
			Preload("Items.Build").
			Find(&orders).Error
	} else {
		// Иначе возвращаем только заказы пользователя
		err = oc.db.Table("orders").
			Select("orders.*, users.name as user_name").
			Joins("LEFT JOIN users ON orders.user_id = users.id").
			Where("orders.user_id = ?", userID).
			Preload("Items").
			Preload("Items.Build").
			Find(&orders).Error
	}

	if err != nil {
		c.JSON(500, gin.H{"error": "Ошибка при получении заказов"})
		return
	}

	c.JSON(200, orders)
}

func (oc *OrderController) GetOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists || userID == 0 {
		c.JSON(401, gin.H{"error": "Не авторизован"})
		return
	}

	// Получаем ID заказа из URL
	orderID := c.Param("id")
	if orderID == "" {
		c.JSON(400, gin.H{"error": "ID заказа не указан"})
		return
	}

	fmt.Printf("Getting order with ID: %s\n", orderID)

	var order models.Order
	err := oc.db.Preload("Items.Build").First(&order, orderID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Заказ не найден"})
			return
		}
		c.JSON(500, gin.H{"error": "Ошибка при получении заказа"})
		return
	}

	fmt.Printf("Order found: %+v\n", order)
	fmt.Printf("Order items count: %d\n", len(order.Items))

	// Дополнительная отладочная информация для элементов заказа
	for i, item := range order.Items {
		fmt.Printf("Item %d: ID=%d, BuildID=%d, Quantity=%d, Price=%f\n", i, item.ID, item.BuildID, item.Quantity, item.Price)
		if item.Build.ID != 0 {
			fmt.Printf("  Build: ID=%d, Name=%s, Price=%f\n", item.Build.ID, item.Build.Name, item.Build.TotalPrice)
		} else {
			fmt.Printf("  Build: not loaded\n")
		}
	}

	// Проверяем права доступа (только владелец заказа или админ)
	role, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "Роль пользователя не определена"})
		return
	}

	if role != "admin" && order.UserID != uint(userID.(int64)) {
		c.JSON(403, gin.H{"error": "Нет прав для просмотра этого заказа"})
		return
	}

	c.JSON(200, order)
}

func (oc *OrderController) UpdateOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists || userID == 0 {
		c.JSON(401, gin.H{"error": "Не авторизован"})
		return
	}

	// Получаем ID заказа из URL
	orderID := c.Param("id")
	if orderID == "" {
		c.JSON(400, gin.H{"error": "ID заказа не указан"})
		return
	}

	// Проверяем права доступа (только админ может редактировать заказы)
	role, exists := c.Get("role")
	if !exists || role != "admin" {
		c.JSON(403, gin.H{"error": "Недостаточно прав для редактирования заказов"})
		return
	}

	var updateData struct {
		Status          string `json:"status"`
		ShippingAddress string `json:"shipping_address"`
		PaymentMethod   string `json:"payment_method"`
		DeliveryMethod  string `json:"delivery_method"`
		Comment         string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(400, gin.H{"error": "Неверный формат данных"})
		return
	}

	// Находим заказ
	var order models.Order
	err := oc.db.First(&order, orderID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Заказ не найден"})
			return
		}
		c.JSON(500, gin.H{"error": "Ошибка при поиске заказа"})
		return
	}

	// Обновляем поля заказа
	if updateData.Status != "" {
		order.Status = models.OrderStatus(updateData.Status)
	}
	if updateData.ShippingAddress != "" {
		order.ShippingAddress = updateData.ShippingAddress
	}
	if updateData.PaymentMethod != "" {
		order.PaymentMethod = updateData.PaymentMethod
	}
	if updateData.DeliveryMethod != "" {
		order.DeliveryMethod = updateData.DeliveryMethod
	}
	order.Comment = updateData.Comment // Комментарий может быть пустым

	// Сохраняем изменения
	if err := oc.db.Save(&order).Error; err != nil {
		c.JSON(500, gin.H{"error": "Ошибка при обновлении заказа"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Заказ успешно обновлен",
		"order":   order,
	})
}

func (oc *OrderController) DeleteOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists || userID == 0 {
		c.JSON(401, gin.H{"error": "Не авторизован"})
		return
	}

	// Получаем ID заказа из URL
	orderID := c.Param("id")
	if orderID == "" {
		c.JSON(400, gin.H{"error": "ID заказа не указан"})
		return
	}

	// Проверяем права доступа (только админ может удалять заказы)
	role, exists := c.Get("role")
	if !exists || role != "admin" {
		c.JSON(403, gin.H{"error": "Недостаточно прав для удаления заказов"})
		return
	}

	// Начинаем транзакцию
	tx := oc.db.Begin()
	if tx.Error != nil {
		c.JSON(500, gin.H{"error": "Ошибка при удалении заказа"})
		return
	}

	// Удаляем элементы заказа
	if err := tx.Where("order_id = ?", orderID).Delete(&models.OrderItem{}).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Ошибка при удалении элементов заказа"})
		return
	}

	// Удаляем сам заказ
	if err := tx.Delete(&models.Order{}, orderID).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Ошибка при удалении заказа"})
		return
	}

	// Завершаем транзакцию
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Ошибка при завершении удаления заказа"})
		return
	}

	c.JSON(200, gin.H{"message": "Заказ успешно удален"})
}
