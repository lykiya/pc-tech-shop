package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"

	"pc-tech-shop/config"
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

	// Применяем SQL миграции
	migrations := []string{
		"init.sql",
		"test_data.sql",
		"000012_add_gorm_fields_to_orders.up.sql",
		"000013_fix_orders_table.up.sql",
		"000013_fix_order_items_table.up.sql",
		"000014_add_quantity_to_cart_items.up.sql",
		"000015_fix_order_items_simple.up.sql",
		"check_and_fix_order_items.sql",
	}

	for _, migration := range migrations {
		log.Printf("Applying migration %s...", migration)
		migrationSQL, err := os.ReadFile(filepath.Join("migrations", migration))
		if err != nil {
			log.Printf("Error reading migration file %s: %v", migration, err)
			continue
		}

		if err := db.Exec(string(migrationSQL)).Error; err != nil {
			log.Printf("Error applying migration %s: %v", migration, err)
		} else {
			log.Printf("Successfully applied migration %s", migration)
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
			"http://localhost:8080",
			"http://127.0.0.1:5500",
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
	routes.OrderRoutes(router, db)
	log.Println("Routes configured successfully")

	// Start server
	log.Println("Starting server on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
