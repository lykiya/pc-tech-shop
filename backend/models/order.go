package models

import (
	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusCompleted OrderStatus = "completed"
	OrderStatusCancelled OrderStatus = "cancelled"
)

type Order struct {
	gorm.Model
	UserID      uint        `json:"user_id" gorm:"not null"`
	TotalAmount float64     `json:"total_amount" gorm:"not null"`
	Status      OrderStatus `json:"status" gorm:"type:varchar(20);default:'pending'"`
	Items       []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	gorm.Model
	OrderID  uint    `json:"order_id" gorm:"not null"`
	BuildID  uint    `json:"build_id" gorm:"not null"`
	Quantity int     `json:"quantity" gorm:"not null"`
	Price    float64 `json:"price" gorm:"not null"`
	PC       PC      `json:"pc" gorm:"foreignKey:BuildID"`
}

// CreateOrder создает новый заказ
func CreateOrder(db *gorm.DB, order *Order) error {
	return db.Create(order).Error
}

// GetOrdersByUserID возвращает все заказы пользователя
func GetOrdersByUserID(db *gorm.DB, userID uint) ([]Order, error) {
	var orders []Order
	err := db.Preload("Items.PC").Where("user_id = ?", userID).Order("created_at DESC").Find(&orders).Error
	return orders, err
}

// GetOrderByID возвращает заказ по ID
func GetOrderByID(db *gorm.DB, id uint) (*Order, error) {
	var order Order
	err := db.Preload("Items.PC").First(&order, id).Error
	return &order, err
}

// UpdateOrderStatus обновляет статус заказа
func UpdateOrderStatus(db *gorm.DB, id uint, status OrderStatus) error {
	return db.Model(&Order{}).Where("id = ?", id).Update("status", status).Error
}

// DeleteOrder удаляет заказ
func DeleteOrder(db *gorm.DB, id uint) error {
	return db.Delete(&Order{}, id).Error
}
