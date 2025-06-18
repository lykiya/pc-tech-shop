package models

import (
	"gorm.io/gorm"
)

type CartItem struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	UserID   int64   `json:"user_id"`
	BuildID  uint    `json:"build_id" gorm:"column:pcbuild_id"`
	Quantity int     `json:"quantity" gorm:"default:1"`
	Build    Pcbuild `json:"build" gorm:"foreignKey:BuildID;references:ID"`
}

// GetCartItems получает все товары в корзине пользователя
func GetCartItems(db *gorm.DB, userID int64) ([]CartItem, error) {
	var items []CartItem
	// Загружаем все сборки и их компоненты одним запросом
	err := db.Where("user_id = ?", userID).
		Preload("Build.CPU").
		Preload("Build.GPU").
		Preload("Build.Motherboard").
		Preload("Build.RAM").
		Preload("Build.PowerUnit").
		Preload("Build.Body").
		Preload("Build.HDD").
		Preload("Build.SSD").
		Preload("Build").
		Find(&items).Error

	if err != nil {
		return nil, err
	}

	return items, nil
}

// AddToCart добавляет товар в корзину
func AddToCart(db *gorm.DB, userID int64, buildID uint) error {
	var existingItem CartItem
	result := db.Where("user_id = ? AND pcbuild_id = ?", userID, buildID).First(&existingItem)

	if result.Error == nil {
		// Товар уже есть в корзине, ничего не делаем
		return nil
	} else if result.Error == gorm.ErrRecordNotFound {
		// Если товара нет, создаем новую запись
		cartItem := CartItem{
			UserID:  userID,
			BuildID: buildID,
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
