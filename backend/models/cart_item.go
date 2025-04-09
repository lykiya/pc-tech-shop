package models

import (
	"gorm.io/gorm"
)

type CartItem struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	UserID   int64   `json:"user_id"`
	BuildID  uint    `json:"build_id" gorm:"column:pcbuild_id"`
	Quantity int     `json:"quantity"`
	Build    Pcbuild `json:"build" gorm:"foreignKey:BuildID;references:ID"`
}

// GetCartItems получает все товары в корзине пользователя
func GetCartItems(db *gorm.DB, userID int64) ([]CartItem, error) {
	var items []CartItem
	err := db.Preload("Build.CPU").Preload("Build.GPU").Preload("Build.Motherboard").
		Preload("Build.RAM").Preload("Build.PowerUnit").Preload("Build.Body").
		Preload("Build.HDD").Preload("Build.SSD").
		Where("user_id = ?", userID).Find(&items).Error
	return items, err
}

// AddToCart добавляет товар в корзину
func AddToCart(db *gorm.DB, userID int64, buildID uint, quantity int) error {
	var existingItem CartItem
	result := db.Where("user_id = ? AND pcbuild_id = ?", userID, buildID).First(&existingItem)

	if result.Error == nil {
		// Если товар уже есть, обновляем количество
		existingItem.Quantity += quantity
		if err := db.Save(&existingItem).Error; err != nil {
			return err
		}
		return nil
	} else if result.Error == gorm.ErrRecordNotFound {
		// Если товара нет, создаем новую запись
		cartItem := CartItem{
			UserID:   userID,
			BuildID:  buildID,
			Quantity: quantity,
		}
		if err := db.Create(&cartItem).Error; err != nil {
			return err
		}
		return nil
	}
	// Логируем только реальные ошибки, игнорируем "record not found"
	if result.Error != gorm.ErrRecordNotFound {
		return result.Error
	}
	return nil
}

// RemoveFromCart удаляет товар из корзины
func RemoveFromCart(db *gorm.DB, userID int64, itemID uint) error {
	return db.Where("id = ? AND user_id = ?", itemID, userID).Delete(&CartItem{}).Error
}

// ClearCart очищает корзину пользователя
func ClearCart(db *gorm.DB, userID int64) error {
	return db.Where("user_id = ?", userID).Delete(&CartItem{}).Error
}
