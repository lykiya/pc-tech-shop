package controllers

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"pc-tech-shop/models"
	"strconv"
	"strings"

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

		// Преобразуем только локальные URL изображений
		for i := range builds {
			if builds[i].ImageURL != "" && !strings.HasPrefix(builds[i].ImageURL, "http") {
				builds[i].ImageURL = "/static/images/builds/" + filepath.Base(builds[i].ImageURL)
			}
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
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Не удалось получить файл"})
		return
	}

	// Создаем уникальное имя файла
	filename := uuid.New().String() + filepath.Ext(file.Filename)

	// Сохраняем файл
	if err := c.SaveUploadedFile(file, filepath.Join("static", "images", "builds", filename)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
		return
	}

	// Возвращаем URL изображения
	c.JSON(http.StatusOK, gin.H{
		"image_url": "/static/images/builds/" + filename,
	})
}

// CreateBuild создает новую сборку
func CreateBuild(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var build models.Pcbuild
		if err := c.ShouldBindJSON(&build); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверяем существование всех компонентов
		if err := checkComponentsExist(db, build); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Создаем сборку
		if err := db.Create(&build).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании сборки"})
			return
		}

		c.JSON(http.StatusCreated, build)
	}
}

// checkComponentsExist проверяет существование всех компонентов сборки
func checkComponentsExist(db *gorm.DB, build models.Pcbuild) error {
	// Проверяем CPU
	if build.CPUID != 0 {
		var cpu models.CPU
		if err := db.First(&cpu, build.CPUID).Error; err != nil {
			return fmt.Errorf("процессор не найден")
		}
	}

	// Проверяем GPU
	if build.GPUID != 0 {
		var gpu models.GPU
		if err := db.First(&gpu, build.GPUID).Error; err != nil {
			return fmt.Errorf("видеокарта не найдена")
		}
	}

	// Проверяем материнскую плату
	if build.MotherboardID != 0 {
		var mb models.Motherboard
		if err := db.First(&mb, build.MotherboardID).Error; err != nil {
			return fmt.Errorf("материнская плата не найдена")
		}
	}

	// Проверяем корпус
	if build.BodyID != 0 {
		var body models.Body
		if err := db.First(&body, build.BodyID).Error; err != nil {
			return fmt.Errorf("корпус не найден")
		}
	}

	// Проверяем оперативную память
	if build.RAMID != 0 {
		var ram models.RAM
		if err := db.First(&ram, build.RAMID).Error; err != nil {
			return fmt.Errorf("оперативная память не найдена")
		}
	}

	// Проверяем блок питания
	if build.PowerUnitID != 0 {
		var pu models.PowerUnit
		if err := db.First(&pu, build.PowerUnitID).Error; err != nil {
			return fmt.Errorf("блок питания не найден")
		}
	}

	// Проверяем HDD (если указан)
	if build.HDDID != 0 {
		var hdd models.HDD
		if err := db.First(&hdd, build.HDDID).Error; err != nil {
			return fmt.Errorf("HDD не найден")
		}
	}

	// Проверяем SSD (если указан)
	if build.SSDID != 0 {
		var ssd models.SSD
		if err := db.First(&ssd, build.SSDID).Error; err != nil {
			return fmt.Errorf("SSD не найден")
		}
	}

	return nil
}
