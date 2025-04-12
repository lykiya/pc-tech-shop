package controllers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"pc-tech-shop/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetBuilds(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var builds []models.Pcbuild

		// Добавляем логирование SQL запроса
		db = db.Debug()

		if err := db.Preload("CPU").
			Preload("GPU").
			Preload("Motherboard").
			Preload("Body").
			Preload("RAM").
			Preload("PowerUnit").
			Preload("HDD").
			Preload("SSD").
			Find(&builds).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении сборок"})
			return
		}

		// Логируем количество найденных сборок
		log.Printf("Найдено сборок: %d", len(builds))

		// Логируем детали каждой сборки
		for _, build := range builds {
			log.Printf("Сборка ID: %d, Название: %s, PowerUnitID: %d, SSDID: %d",
				build.ID, build.Name, build.PowerUnitID, build.SSDID)
		}

		c.JSON(http.StatusOK, builds)
	}
}

func GetBuild(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сборки"})
			return
		}

		var build models.Pcbuild

		if err := db.Preload("CPU").
			Preload("GPU").
			Preload("Motherboard").
			Preload("Body").
			Preload("RAM").
			Preload("PowerUnit").
			Preload("HDD").
			Preload("SSD").
			First(&build, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сборка не найдена"})
			return
		}

		log.Printf("Сборка ID: %d, Название: %s, PowerUnitID: %d, SSDID: %d",
			build.ID, build.Name, build.PowerUnitID, build.SSDID)

		c.JSON(http.StatusOK, build)
	}
}

func DeleteBuild(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сборки"})
			return
		}

		var build models.Pcbuild
		if err := db.First(&build, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сборка не найдена"})
			return
		}

		if err := db.Delete(&build).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении сборки"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Сборка успешно удалена"})
	}
}

// UploadBuildImage обрабатывает загрузку изображения для сборки
func UploadBuildImage(c *gin.Context) {
	// Получаем файл из запроса
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Не удалось получить файл"})
		return
	}

	// Проверяем размер файла (максимум 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл слишком большой. Максимальный размер: 5MB"})
		return
	}

	// Создаем уникальное имя файла
	ext := filepath.Ext(file.Filename)
	newFileName := uuid.New().String() + ext

	// Создаем директорию для изображений, если она не существует
	uploadDir := "./static/images/builds"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать директорию для изображений"})
		return
	}

	// Сохраняем файл
	filePath := filepath.Join(uploadDir, newFileName)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
		return
	}

	// Возвращаем URL изображения
	imageURL := "/static/images/builds/" + newFileName
	c.JSON(http.StatusOK, gin.H{"image_url": imageURL})
}
