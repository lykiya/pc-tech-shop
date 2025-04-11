package controllers

import (
	"net/http"
	"strconv"

	"pc-tech-shop/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetComponents возвращает список всех компонентов
func GetComponents(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not found"})
		return
	}

	category := c.Query("category")
	if category == "" || category == "all" {
		// Return all components
		var allComponents []interface{}

		// Get CPUs
		var cpus []models.CPU
		if err := db.Find(&cpus).Error; err == nil {
			for _, cpu := range cpus {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "cpu",
					"data": cpu,
				})
			}
		}

		// Get GPUs
		var gpus []models.GPU
		if err := db.Find(&gpus).Error; err == nil {
			for _, gpu := range gpus {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "gpu",
					"data": gpu,
				})
			}
		}

		// Get Motherboards
		var motherboards []models.Motherboard
		if err := db.Find(&motherboards).Error; err == nil {
			for _, mb := range motherboards {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "motherboard",
					"data": mb,
				})
			}
		}

		// Get RAM
		var rams []models.RAM
		if err := db.Find(&rams).Error; err == nil {
			for _, ram := range rams {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "ram",
					"data": ram,
				})
			}
		}

		// Get Power Units
		var powerUnits []models.PowerUnit
		if err := db.Find(&powerUnits).Error; err == nil {
			for _, pu := range powerUnits {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "power_unit",
					"data": pu,
				})
			}
		}

		// Get HDDs
		var hdds []models.HDD
		if err := db.Find(&hdds).Error; err == nil {
			for _, hdd := range hdds {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "hdd",
					"data": hdd,
				})
			}
		}

		// Get SSDs
		var ssds []models.SSD
		if err := db.Find(&ssds).Error; err == nil {
			for _, ssd := range ssds {
				allComponents = append(allComponents, map[string]interface{}{
					"type": "ssd",
					"data": ssd,
				})
			}
		}

		c.JSON(http.StatusOK, allComponents)
		return
	}

	var components []interface{}

	switch category {
	case "cpu":
		var cpus []models.CPU
		if err := db.Find(&cpus).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, cpu := range cpus {
			components = append(components, map[string]interface{}{
				"type": "cpu",
				"data": cpu,
			})
		}
	case "gpu":
		var gpus []models.GPU
		if err := db.Find(&gpus).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, gpu := range gpus {
			components = append(components, map[string]interface{}{
				"type": "gpu",
				"data": gpu,
			})
		}
	case "motherboard":
		var motherboards []models.Motherboard
		if err := db.Find(&motherboards).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, mb := range motherboards {
			components = append(components, map[string]interface{}{
				"type": "motherboard",
				"data": mb,
			})
		}
	case "ram":
		var rams []models.RAM
		if err := db.Find(&rams).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, ram := range rams {
			components = append(components, map[string]interface{}{
				"type": "ram",
				"data": ram,
			})
		}
	case "power_unit":
		var powerUnits []models.PowerUnit
		if err := db.Find(&powerUnits).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, pu := range powerUnits {
			components = append(components, map[string]interface{}{
				"type": "power_unit",
				"data": pu,
			})
		}
	case "hdd":
		var hdds []models.HDD
		if err := db.Find(&hdds).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, hdd := range hdds {
			components = append(components, map[string]interface{}{
				"type": "hdd",
				"data": hdd,
			})
		}
	case "ssd":
		var ssds []models.SSD
		if err := db.Find(&ssds).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for _, ssd := range ssds {
			components = append(components, map[string]interface{}{
				"type": "ssd",
				"data": ssd,
			})
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		return
	}

	c.JSON(http.StatusOK, components)
}

// GetComponent возвращает компонент по ID
func GetComponent(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	category := c.Query("category")

	componentID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	switch category {
	case "cpu":
		var cpu models.CPU
		if err := db.First(&cpu, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "CPU not found"})
			return
		}
		c.JSON(http.StatusOK, cpu)
	case "gpu":
		var gpu models.GPU
		if err := db.First(&gpu, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "GPU not found"})
			return
		}
		c.JSON(http.StatusOK, gpu)
	case "motherboard":
		var mb models.Motherboard
		if err := db.First(&mb, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Motherboard not found"})
			return
		}
		c.JSON(http.StatusOK, mb)
	case "ram":
		var ram models.RAM
		if err := db.First(&ram, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "RAM not found"})
			return
		}
		c.JSON(http.StatusOK, ram)
	case "power_unit":
		var pu models.PowerUnit
		if err := db.First(&pu, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Power unit not found"})
			return
		}
		c.JSON(http.StatusOK, pu)
	case "hdd":
		var hdd models.HDD
		if err := db.First(&hdd, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "HDD not found"})
			return
		}
		c.JSON(http.StatusOK, hdd)
	case "ssd":
		var ssd models.SSD
		if err := db.First(&ssd, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "SSD not found"})
			return
		}
		c.JSON(http.StatusOK, ssd)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
	}
}

// CreateComponent создает новый компонент
func CreateComponent(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	category := c.Query("category")

	switch category {
	case "cpu":
		var cpu models.CPU
		if err := c.ShouldBindJSON(&cpu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&cpu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, cpu)
	case "gpu":
		var gpu models.GPU
		if err := c.ShouldBindJSON(&gpu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&gpu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gpu)
	case "motherboard":
		var mb models.Motherboard
		if err := c.ShouldBindJSON(&mb); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&mb).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, mb)
	case "ram":
		var ram models.RAM
		if err := c.ShouldBindJSON(&ram); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&ram).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, ram)
	case "power_unit":
		var pu models.PowerUnit
		if err := c.ShouldBindJSON(&pu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&pu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, pu)
	case "hdd":
		var hdd models.HDD
		if err := c.ShouldBindJSON(&hdd); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&hdd).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, hdd)
	case "ssd":
		var ssd models.SSD
		if err := c.ShouldBindJSON(&ssd); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Create(&ssd).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, ssd)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
	}
}

// UpdateComponent обновляет существующий компонент
func UpdateComponent(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	category := c.Query("category")

	componentID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	switch category {
	case "cpu":
		var cpu models.CPU
		if err := db.First(&cpu, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "CPU not found"})
			return
		}
		if err := c.ShouldBindJSON(&cpu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&cpu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, cpu)
	case "gpu":
		var gpu models.GPU
		if err := db.First(&gpu, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "GPU not found"})
			return
		}
		if err := c.ShouldBindJSON(&gpu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&gpu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gpu)
	case "motherboard":
		var mb models.Motherboard
		if err := db.First(&mb, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Motherboard not found"})
			return
		}
		if err := c.ShouldBindJSON(&mb); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&mb).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, mb)
	case "ram":
		var ram models.RAM
		if err := db.First(&ram, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "RAM not found"})
			return
		}
		if err := c.ShouldBindJSON(&ram); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&ram).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, ram)
	case "power_unit":
		var pu models.PowerUnit
		if err := db.First(&pu, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Power unit not found"})
			return
		}
		if err := c.ShouldBindJSON(&pu); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&pu).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, pu)
	case "hdd":
		var hdd models.HDD
		if err := db.First(&hdd, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "HDD not found"})
			return
		}
		if err := c.ShouldBindJSON(&hdd); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&hdd).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, hdd)
	case "ssd":
		var ssd models.SSD
		if err := db.First(&ssd, componentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "SSD not found"})
			return
		}
		if err := c.ShouldBindJSON(&ssd); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := db.Save(&ssd).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, ssd)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
	}
}

// DeleteComponent удаляет компонент
func DeleteComponent(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")
	category := c.Query("category")

	componentID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	switch category {
	case "cpu":
		if err := db.Delete(&models.CPU{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "gpu":
		if err := db.Delete(&models.GPU{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "motherboard":
		if err := db.Delete(&models.Motherboard{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "ram":
		if err := db.Delete(&models.RAM{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "power_unit":
		if err := db.Delete(&models.PowerUnit{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "hdd":
		if err := db.Delete(&models.HDD{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "ssd":
		if err := db.Delete(&models.SSD{}, componentID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Component deleted successfully"})
}
