package controllers

import (
	"fmt"
	"net/http"
	"pc-tech-shop/models"
	"pc-tech-shop/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func RegisterUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Passwordhash), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
			return
		}
		user.Passwordhash = string(hashedPassword)

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
	}
}

func LoginUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var loginReq LoginRequest
		if err := c.ShouldBindJSON(&loginReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		if err := db.Where("email = ?", loginReq.Email).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Compare password
		if err := bcrypt.CompareHashAndPassword([]byte(user.Passwordhash), []byte(loginReq.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Generate JWT token
		token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user": gin.H{
				"id":    user.ID,
				"email": user.Email,
				"name":  user.Name,
				"role":  user.Role,
			},
		})
	}
}

func GetUsers(db *gorm.DB) ([]models.User, error) {
	var users []models.User
	err := db.Select("id, name, surname, email, phone, role").Find(&users).Error
	return users, err
}

func GetUserByID(db *gorm.DB, userID int64) (models.User, error) {
	var user models.User
	err := db.Select("id, name, surname, email, phone, role").Where("id = ?", userID).First(&user).Error
	return user, err
}

func UpdateUser(db *gorm.DB, userID int64, userData struct {
	Name    string `json:"name"`
	Surname string `json:"surname"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Role    string `json:"role"`
}) error {
	fmt.Printf("Updating user %d with data: %+v\n", userID, userData)

	result := db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"name":    userData.Name,
		"surname": userData.Surname,
		"phone":   userData.Phone,
		"email":   userData.Email,
		"role":    userData.Role,
	})

	fmt.Printf("Update result: RowsAffected=%d, Error=%v\n", result.RowsAffected, result.Error)

	return result.Error
}

// Получить пользователя по id
func GetUserByIDHandler(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var user models.User
	if err := db.Select("id, name, surname, email, phone, role").Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(404, gin.H{"error": "Пользователь не найден"})
		return
	}
	c.JSON(200, user)
}

// Обновить пользователя по id
func UpdateUserByIDHandler(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(404, gin.H{"error": "Пользователь не найден"})
		return
	}
	var userData struct {
		Name    string `json:"name"`
		Surname string `json:"surname"`
		Phone   string `json:"phone"`
		Email   string `json:"email"`
		Role    string `json:"role"`
	}
	if err := c.ShouldBindJSON(&userData); err != nil {
		c.JSON(400, gin.H{"error": "Неверные данные"})
		return
	}
	if err := db.Model(&user).Updates(map[string]interface{}{
		"name":    userData.Name,
		"surname": userData.Surname,
		"phone":   userData.Phone,
		"email":   userData.Email,
		"role":    userData.Role,
	}).Error; err != nil {
		c.JSON(500, gin.H{"error": "Ошибка при обновлении пользователя"})
		return
	}
	c.JSON(200, user)
}

// Удалить пользователя по id
func DeleteUserByIDHandler(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(404, gin.H{"error": "Пользователь не найден"})
		return
	}
	if err := db.Delete(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "Ошибка при удалении пользователя"})
		return
	}
	c.JSON(200, gin.H{"message": "Пользователь успешно удалён"})
}
