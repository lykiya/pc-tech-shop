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

	// Public routes
	router.POST("/register", controllers.RegisterUser(db))
	router.POST("/login", controllers.LoginUser(db))
	router.POST("/requests", requestController.CreateRequest)

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
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
	}

	// Product routes
	router.GET("/products", controllers.GetProducts(db))
	router.GET("/products/:id", controllers.GetProduct(db))

	// Public routes for builds
	router.GET("/builds", controllers.GetBuilds(db))
	router.GET("/builds/:id", controllers.GetBuild(db))
}
