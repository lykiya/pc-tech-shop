package controllers

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"pc-tech-shop/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AddToCartRequest struct {
	PcbuildID int `json:"pcbuild_id" binding:"required"`
}

// Добавление товара в корзину
func AddToCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Читаем тело запроса для отладки
		body, err := ioutil.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка чтения тела запроса"})
			return
		}
		// Восстанавливаем тело запроса для дальнейшей обработки
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

		var input AddToCartRequest
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Неверный формат данных",
				"details": map[string]interface{}{
					"received_body": string(body),
					"error":         err.Error(),
				},
			})
			return
		}

		// Получаем ID пользователя из токена
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Необходима авторизация"})
			return
		}

		// Проверяем существование сборки
		var build models.Pcbuild
		if err := db.First(&build, input.PcbuildID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Сборка не найдена"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке сборки"})
			return
		}

		// Добавляем сборку в корзину
		if err := models.AddToCart(db, userID.(int64), uint(input.PcbuildID)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при добавлении в корзину"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Сборка успешно добавлена в корзину"})
	}
}

// Получение содержимого корзины
func GetCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Необходима авторизация"})
			return
		}

		cartItems, err := models.GetCartItems(db, userID.(int64))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении корзины"})
			return
		}

		// Загружаем связанные компоненты для каждой сборки
		for i := range cartItems {
			if cartItems[i].BuildID != 0 {
				// Загружаем сборку с компонентами
				err := db.Preload("CPU").Preload("GPU").Preload("Motherboard").
					Preload("RAM").Preload("PowerUnit").Preload("Body").
					Preload("HDD").Preload("SSD").
					First(&cartItems[i].Build, cartItems[i].BuildID).Error

				if err != nil {
					// Если не удалось загрузить сборку, логируем ошибку, но продолжаем
					fmt.Printf("Error loading build %d: %v\n", cartItems[i].BuildID, err)
				}
			}
		}

		c.JSON(http.StatusOK, cartItems)
	}
}

// Удаление товара из корзины
func RemoveFromCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Необходима авторизация"})
			return
		}

		itemID, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID элемента"})
			return
		}

		if err := models.RemoveFromCart(db, userID.(int64), uint(itemID)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении из корзины"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Товар удален из корзины"})
	}
}

// Очистка корзины
func ClearCart(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Необходима авторизация"})
			return
		}

		if err := models.ClearCart(db, userID.(int64)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при очистке корзины"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Корзина очищена"})
	}
}
