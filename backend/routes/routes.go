package routes

import (
	"pc-tech-shop/controllers"
	"pc-tech-shop/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRoutes(router *gin.Engine, db *gorm.DB) {
	// Add CORS middleware to all routes
	router.Use(middleware.CORSMiddleware())

	// Initialize controllers
	requestController := controllers.NewRequestController(db)
	orderController := controllers.NewOrderController(db)

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
			userID := c.GetInt64("user_id")
			var userData struct {
				Name    string `json:"name"`
				Surname string `json:"surname"`
				Phone   string `json:"phone"`
				Email   string `json:"email"`
			}
			if err := c.ShouldBindJSON(&userData); err != nil {
				c.JSON(400, gin.H{"error": "Неверный формат данных"})
				return
			}

			if err := controllers.UpdateUser(db, userID, userData); err != nil {
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

		// Order routes
		protected.POST("/orders", orderController.CreateOrder)
		protected.GET("/orders", orderController.GetOrders)

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
			builds.DELETE("/:id", controllers.DeleteBuild(db))
			builds.POST("/upload", controllers.UploadBuildImage)
		}
	}

	// Product routes
	router.GET("/products", controllers.GetProducts(db))
	router.GET("/products/:id", controllers.GetProduct(db))

	// Настраиваем статические файлы
	router.Static("/static", "./static")
	router.Static("/images", "./static/images")
}
