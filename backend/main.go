package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"pc-tech-shop/config"
	"pc-tech-shop/models"
	"pc-tech-shop/routes"
)

func main() {
	log.Println("Starting application...")

	// Load configuration
	log.Println("Loading configuration...")
	newConfig, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	log.Println("Configuration loaded successfully")

	// Connect to database
	log.Println("Connecting to database...")
	db, err := config.Connection(newConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connection established successfully")

	// Perform migrations
	log.Println("Starting database migrations...")
	models := []interface{}{
		&models.User{},
		&models.CPU{},
		&models.GPU{},
		&models.Motherboard{},
		&models.Body{},
		&models.RAM{},
		&models.PowerUnit{},
		&models.HDD{},
		&models.SSD{},
		&models.Pcbuild{},
		&models.CartItem{},
		&models.Request{},
		&models.Order{},
		&models.OrderItem{},
	}

	for _, model := range models {
		log.Printf("Migrating %T...", model)
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Error migrating %T: %v", model, err)
			// Continue with other migrations even if one fails
		} else {
			log.Printf("Successfully migrated %T", model)
		}
	}
	log.Println("Database migrations completed")

	// Initialize router
	log.Println("Initializing router...")
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Add database middleware
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Setup routes
	log.Println("Setting up routes...")
	routes.UserRoutes(router, db)
	routes.OrderRoutes(router, db)
	log.Println("Routes configured successfully")

	// Start server
	log.Println("Starting server on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
