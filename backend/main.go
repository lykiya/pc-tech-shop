package main

import (
	"log"

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

	// Add database middleware
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Configure CORS
	log.Println("Configuring CORS...")
	router.Use(func(c *gin.Context) {
		allowedOrigins := []string{
			"https://pc-tech-shop-1.onrender.com",
			"https://pc-tech-shop-1-backend.onrender.com",
		}

		origin := c.Request.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept")
				c.Header("Access-Control-Allow-Credentials", "true")
				c.Header("Access-Control-Max-Age", "86400") // 24 hours

				if c.Request.Method == "OPTIONS" {
					c.AbortWithStatus(204)
					return
				}
				break
			}
		}

		c.Next()
	})

	// Setup routes
	log.Println("Setting up routes...")
	routes.UserRoutes(router, db)
	log.Println("Routes configured successfully")

	// Start server
	log.Println("Starting server on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
