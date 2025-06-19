package controllers

import (
	"net/http"
	"time"

	"pc-tech-shop/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RequestController struct {
	DB *gorm.DB
}

func NewRequestController(db *gorm.DB) *RequestController {
	return &RequestController{DB: db}
}

// CreateRequest создает новое обращение
func (c *RequestController) CreateRequest(ctx *gin.Context) {
	var request models.Request
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	request.CreatedAt = time.Now()
	request.UpdatedAt = time.Now()
	request.Status = "new"

	if err := c.DB.Create(&request).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать обращение"})
		return
	}

	ctx.JSON(http.StatusCreated, request)
}

// GetRequests получает все обращения (для админ-панели)
func (c *RequestController) GetRequests(ctx *gin.Context) {
	var requests []models.Request
	if err := c.DB.Order("created_at DESC").Find(&requests).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить обращения"})
		return
	}

	ctx.JSON(http.StatusOK, requests)
}

// UpdateRequestStatus обновляет статус обращения
func (c *RequestController) UpdateRequestStatus(ctx *gin.Context) {
	var request models.Request
	id := ctx.Param("id")

	if err := c.DB.First(&request, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Обращение не найдено"})
		return
	}

	var updateData struct {
		Status string `json:"status"`
	}

	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	request.Status = updateData.Status
	request.UpdatedAt = time.Now()

	if err := c.DB.Save(&request).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить статус"})
		return
	}

	ctx.JSON(http.StatusOK, request)
}

// Удалить обращение по id
func (c *RequestController) DeleteRequest(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.DB.Delete(&models.Request{}, id).Error; err != nil {
		ctx.JSON(500, gin.H{"error": "Не удалось удалить обращение"})
		return
	}
	ctx.JSON(200, gin.H{"message": "Обращение удалено"})
}

// Массовое удаление завершённых обращений
func (c *RequestController) DeleteCompletedRequests(ctx *gin.Context) {
	if err := c.DB.Where("status = ?", "completed").Delete(&models.Request{}).Error; err != nil {
		ctx.JSON(500, gin.H{"error": "Не удалось удалить завершённые обращения"})
		return
	}
	ctx.JSON(200, gin.H{"message": "Завершённые обращения удалены"})
}
