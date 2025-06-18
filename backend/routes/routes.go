package routes

import (
	"fmt"
	"net/http"
	"pc-tech-shop/controllers"
	"pc-tech-shop/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize controllers
	requestController := controllers.NewRequestController(db)

	// Public routes
	router.POST("/register", controllers.RegisterUser(db))
	router.POST("/login", controllers.LoginUser(db))
	router.POST("/requests", requestController.CreateRequest)

	// Public routes for builds
	router.GET("/builds", controllers.GetBuilds(db))
	router.GET("/builds/:id", controllers.GetBuild(db))

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/users/me", func(c *gin.Context) {
			userID, exists := c.Get("userID")
			if !exists {
				c.JSON(500, gin.H{"error": "ID пользователя не найден"})
				return
			}

			user, err := controllers.GetUserByID(db, userID.(int64))
			if err != nil {
				c.JSON(500, gin.H{"error": "Ошибка при получении данных пользователя"})
				return
			}
			c.JSON(200, user)
		})

		protected.PUT("/users/me", func(c *gin.Context) {
			userID, exists := c.Get("userID")
			if !exists {
				c.JSON(500, gin.H{"error": "ID пользователя не найден"})
				return
			}

			fmt.Printf("Received update request for user ID: %v\n", userID)

			var userData struct {
				Name    string `json:"name"`
				Surname string `json:"surname"`
				Phone   string `json:"phone"`
				Email   string `json:"email"`
				Role    string `json:"role"`
			}
			if err := c.ShouldBindJSON(&userData); err != nil {
				fmt.Printf("Error binding JSON: %v\n", err)
				c.JSON(400, gin.H{"error": "Неверный формат данных"})
				return
			}

			fmt.Printf("Received user data: %+v\n", userData)

			if err := controllers.UpdateUser(db, userID.(int64), userData); err != nil {
				fmt.Printf("Error updating user: %v\n", err)
				c.JSON(500, gin.H{"error": "Ошибка при обновлении данных пользователя"})
				return
			}
			c.JSON(200, gin.H{"message": "Данные пользователя успешно обновлены"})
		})

		protected.GET("/users", func(c *gin.Context) {
			users, err := controllers.GetUsers(db)
			if err != nil {
				c.JSON(500, gin.H{"error": "Ошибка при получении пользователей"})
				return
			}
			c.JSON(200, users)
		})

		// Добавляем маршруты для получения и обновления пользователя по id
		protected.GET("/users/:id", controllers.GetUserByIDHandler)
		protected.PUT("/users/:id", controllers.UpdateUserByIDHandler)
		protected.DELETE("/users/:id", controllers.DeleteUserByIDHandler)

		// Protected product routes
		protected.POST("/products", controllers.CreateProduct(db))
		protected.PUT("/products/:id", controllers.UpdateProduct(db))
		protected.DELETE("/products/:id", controllers.DeleteProduct(db))

		// Protected cart routes
		protected.POST("/cart", controllers.AddToCart(db))
		protected.GET("/cart", controllers.GetCart(db))
		protected.DELETE("/cart/:id", controllers.RemoveFromCart(db))
		protected.DELETE("/cart", controllers.ClearCart(db))

		// Protected request routes (admin only)
		protected.GET("/requests", requestController.GetRequests)
		protected.PUT("/requests/:id", requestController.UpdateRequestStatus)

		// Component routes
		protected.GET("/components", controllers.GetComponents)
		protected.GET("/components/:id", controllers.GetComponent)
		protected.POST("/components", controllers.CreateComponent)
		protected.PUT("/components/:id", controllers.UpdateComponent)
		protected.DELETE("/components/:id", controllers.DeleteComponent)

		// Protected build routes (only write operations)
		builds := protected.Group("/builds")
		{
			builds.POST("", controllers.CreateBuild(db))
			builds.PUT("/:id", controllers.UpdateBuild(db))
			builds.DELETE("/:id", controllers.DeleteBuild(db))
			builds.POST("/upload", controllers.UploadBuildImage)
		}
	}

	// Product routes
	router.GET("/products", controllers.GetProducts(db))
	router.GET("/products/:id", controllers.GetProduct(db))

	// Добавляем новый эндпоинт для проверки таблиц
	router.GET("/api/check-tables", func(c *gin.Context) {
		var tables []string
		result := db.Raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").Scan(&tables)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"tables": tables})
	})

	// Добавляем эндпоинт для проверки структуры таблицы
	router.GET("/api/table-structure/:table", func(c *gin.Context) {
		tableName := c.Param("table")
		var columns []struct {
			ColumnName string `gorm:"column:column_name"`
			DataType   string `gorm:"column:data_type"`
		}

		result := db.Raw(`
			SELECT column_name, data_type 
			FROM information_schema.columns 
			WHERE table_schema = 'public' AND table_name = ?
		`, tableName).Scan(&columns)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"columns": columns})
	})

	// Добавляем эндпоинт для проверки данных в таблице
	router.GET("/api/table-data/:table", func(c *gin.Context) {
		tableName := c.Param("table")
		var data []map[string]interface{}

		result := db.Raw(fmt.Sprintf("SELECT * FROM %s LIMIT 10", tableName)).Scan(&data)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": data})
	})

	// Настраиваем статические файлы
	router.Static("/static", "./static")
	router.Static("/images", "./static/images")
}

func OrderRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize controller
	orderController := controllers.NewOrderController(db)

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// Order routes
		protected.POST("/orders", orderController.CreateOrder)
		protected.GET("/orders", orderController.GetOrders)
		protected.GET("/orders/:id", orderController.GetOrder)
		protected.PUT("/orders/:id", orderController.UpdateOrder)
		protected.DELETE("/orders/:id", orderController.DeleteOrder)
	}
}
