package controllers

import (
	"log"
	"net/http"
	"pc-tech-shop/models"
	"strconv"

	"github.com/gin-gonic/gin"
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
