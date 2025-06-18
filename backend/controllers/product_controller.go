package controllers

import (
	"fmt"
	"net/http"
	"pc-tech-shop/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetProducts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var products []map[string]interface{}

		// Получаем все компоненты
		var cpus []models.CPU
		var gpus []models.GPU
		var motherboards []models.Motherboard
		var rams []models.RAM
		var powerUnits []models.PowerUnit
		var bodies []models.Body
		var hdds []models.HDD
		var ssds []models.SSD

		if err := db.Find(&cpus).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении процессоров"})
			return
		}

		if err := db.Find(&gpus).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении видеокарт"})
			return
		}

		if err := db.Find(&motherboards).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении материнских плат"})
			return
		}

		if err := db.Find(&rams).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении оперативной памяти"})
			return
		}

		if err := db.Find(&powerUnits).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении блоков питания"})
			return
		}

		if err := db.Find(&bodies).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении корпусов"})
			return
		}

		if err := db.Find(&hdds).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении HDD"})
			return
		}

		if err := db.Find(&ssds).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении SSD"})
			return
		}

		// Преобразуем все компоненты в единый формат
		for _, cpu := range cpus {
			products = append(products, map[string]interface{}{
				"id":           cpu.ID,
				"name":         cpu.Name,
				"category":     "cpu",
				"manufacturer": cpu.Manufacturer,
				"price":        cpu.Price,
				"specs": map[string]string{
					"Ядра":   strconv.Itoa(cpu.Cores),
					"Потоки": strconv.Itoa(cpu.Threads),
					"Сокет":  cpu.Socket,
				},
			})
		}

		for _, gpu := range gpus {
			products = append(products, map[string]interface{}{
				"id":           gpu.ID,
				"name":         gpu.Name,
				"category":     "gpu",
				"manufacturer": gpu.Manufacturer,
				"price":        gpu.Price,
				"specs": map[string]string{
					"Видеопамять": fmt.Sprintf("%d ГБ", gpu.VRAM),
					"Тип памяти":  gpu.MemoryType,
					"Частота":     fmt.Sprintf("%.0f МГц", gpu.GPUClock),
				},
			})
		}

		for _, mb := range motherboards {
			products = append(products, map[string]interface{}{
				"id":           mb.ID,
				"name":         mb.Name,
				"category":     "motherboard",
				"manufacturer": mb.Manufacturer,
				"price":        mb.Price,
				"specs": map[string]string{
					"Сокет": mb.Socket,
				},
			})
		}

		for _, ram := range rams {
			products = append(products, map[string]interface{}{
				"id":           ram.ID,
				"name":         ram.Name,
				"category":     "ram",
				"manufacturer": "RAM",
				"price":        ram.Price,
				"specs": map[string]string{
					"Объем": ram.Capacity,
					"Тип":   ram.DDR,
				},
			})
		}

		for _, psu := range powerUnits {
			products = append(products, map[string]interface{}{
				"id":           psu.ID,
				"name":         psu.Name,
				"category":     "power_unit",
				"manufacturer": "PSU",
				"price":        psu.Price,
				"specs": map[string]string{
					"Мощность": psu.Wattage,
				},
			})
		}

		for _, body := range bodies {
			products = append(products, map[string]interface{}{
				"id":           body.ID,
				"name":         body.Name,
				"category":     "body",
				"manufacturer": body.Manufacturer,
				"price":        body.Price,
			})
		}

		for _, hdd := range hdds {
			products = append(products, map[string]interface{}{
				"id":           hdd.ID,
				"name":         hdd.Name,
				"category":     "hdd",
				"manufacturer": hdd.Manufacturer,
				"price":        hdd.Price,
				"specs": map[string]string{
					"Объем": hdd.Capacity,
				},
			})
		}

		for _, ssd := range ssds {
			products = append(products, map[string]interface{}{
				"id":           ssd.ID,
				"name":         ssd.Name,
				"category":     "ssd",
				"manufacturer": ssd.Manufacturer,
				"price":        ssd.Price,
				"specs": map[string]string{
					"Объем": ssd.Capacity,
				},
			})
		}

		c.JSON(http.StatusOK, products)
	}
}

func GetProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		category := c.Query("category")
		if category == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Category is required"})
			return
		}

		var product interface{}
		var err2 error

		switch category {
		case "cpu":
			var cpu models.CPU
			err2 = db.First(&cpu, id).Error
			product = cpu
		case "gpu":
			var gpu models.GPU
			err2 = db.First(&gpu, id).Error
			product = gpu
		case "motherboard":
			var mb models.Motherboard
			err2 = db.First(&mb, id).Error
			product = mb
		case "ram":
			var ram models.RAM
			err2 = db.First(&ram, id).Error
			product = ram
		case "power_unit":
			var psu models.PowerUnit
			err2 = db.First(&psu, id).Error
			product = psu
		case "body":
			var body models.Body
			err2 = db.First(&body, id).Error
			product = body
		case "hdd":
			var hdd models.HDD
			err2 = db.First(&hdd, id).Error
			product = hdd
		case "ssd":
			var ssd models.SSD
			err2 = db.First(&ssd, id).Error
			product = ssd
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
			return
		}

		if err2 != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		c.JSON(http.StatusOK, product)
	}
}

func CreateProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product models.Product
		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Create(&product).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating product"})
			return
		}

		c.JSON(http.StatusCreated, product)
	}
}

func UpdateProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		var product models.Product
		if err := db.First(&product, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Save(&product).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating product"})
			return
		}

		c.JSON(http.StatusOK, product)
	}
}

func DeleteProduct(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		if err := db.Delete(&models.Product{}, id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting product"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
	}
}
