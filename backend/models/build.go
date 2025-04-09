package models

import (
	"time"
)

type CPU struct {
	ID           int64   `gorm:"primaryKey;column:id" json:"id"`
	Name         string  `gorm:"column:name" json:"name"`
	Manufacturer string  `gorm:"column:manufacturer" json:"manufacturer"`
	Cores        string  `gorm:"column:cores" json:"cores"`
	Threads      string  `gorm:"column:threads" json:"threads"`
	Socket       string  `gorm:"column:socket" json:"socket"`
	Price        float64 `gorm:"column:price" json:"price"`
}

func (CPU) TableName() string {
	return "cpu"
}

type GPU struct {
	ID           int64      `gorm:"primaryKey;column:id" json:"id"`
	Name         string     `gorm:"column:name" json:"name"`
	Manufacturer string     `gorm:"column:manufacturer" json:"manufacturer"`
	VRAM         int        `gorm:"column:vram" json:"vram"`
	MemoryType   string     `gorm:"column:memory_type" json:"memory_type"`
	GPUClock     float64    `gorm:"column:gpu_clock" json:"gpu_clock"`
	Price        float64    `gorm:"column:price" json:"price"`
	ReleaseDate  *time.Time `gorm:"column:release_date" json:"release_date,omitempty"`
}

func (GPU) TableName() string {
	return "gpu"
}

type Motherboard struct {
	ID           int64   `gorm:"primaryKey;column:id" json:"id"`
	Name         string  `gorm:"column:name" json:"name"`
	Manufacturer string  `gorm:"column:manufacturer" json:"manufacturer"`
	Socket       string  `gorm:"column:socket" json:"socket"`
	Price        float64 `gorm:"column:price" json:"price"`
}

func (Motherboard) TableName() string {
	return "motherboard"
}

type Body struct {
	ID           int64   `gorm:"primaryKey;column:id" json:"id"`
	Name         string  `gorm:"column:name" json:"name"`
	Manufacturer string  `gorm:"column:manufacturer" json:"manufacturer"`
	Price        float64 `gorm:"column:price" json:"price"`
}

func (Body) TableName() string {
	return "body"
}

type RAM struct {
	ID       int64   `gorm:"primaryKey;column:id" json:"id"`
	Name     string  `gorm:"column:name" json:"name"`
	Capacity string  `gorm:"column:capacity" json:"capacity"`
	DDR      string  `gorm:"column:ddr" json:"ddr"`
	Price    float64 `gorm:"column:price" json:"price"`
}

func (RAM) TableName() string {
	return "ram"
}

type PowerUnit struct {
	ID      int64   `gorm:"primaryKey;column:id" json:"id"`
	Name    string  `gorm:"column:name" json:"name"`
	Wattage string  `gorm:"column:wattage" json:"wattage"`
	Price   float64 `gorm:"column:price" json:"price"`
}

func (PowerUnit) TableName() string {
	return "power_unit"
}

type HDD struct {
	ID           int64   `gorm:"primaryKey;column:id" json:"id"`
	Name         string  `gorm:"column:name" json:"name"`
	Manufacturer string  `gorm:"column:manufacturer" json:"manufacturer"`
	Capacity     string  `gorm:"column:capacity" json:"capacity"`
	Price        float64 `gorm:"column:price" json:"price"`
}

func (HDD) TableName() string {
	return "hdd"
}

type SSD struct {
	ID           int64   `gorm:"primaryKey;column:id" json:"id"`
	Name         string  `gorm:"column:name" json:"name"`
	Manufacturer string  `gorm:"column:manufacturer" json:"manufacturer"`
	Capacity     string  `gorm:"column:capacity" json:"capacity"`
	Price        float64 `gorm:"column:price" json:"price"`
}

func (SSD) TableName() string {
	return "ssd"
}

type Pcbuild struct {
	ID            int64       `gorm:"primaryKey;column:id" json:"id"`
	Name          string      `gorm:"column:name" json:"name"`
	Description   string      `gorm:"column:description" json:"description"`
	CPUID         int64       `gorm:"column:cpu_id" json:"cpu_id"`
	GPUID         int64       `gorm:"column:gpu_id" json:"gpu_id"`
	MotherboardID int64       `gorm:"column:motherboard_id" json:"motherboard_id"`
	BodyID        int64       `gorm:"column:body_id" json:"body_id"`
	RAMID         int64       `gorm:"column:ram_id" json:"ram_id"`
	PowerUnitID   int64       `gorm:"column:power_unit_id" json:"power_unit_id"`
	HDDID         int64       `gorm:"column:hdd_id" json:"hdd_id"`
	SSDID         int64       `gorm:"column:ssd_id" json:"ssd_id"`
	TotalPrice    float64     `gorm:"column:total_price" json:"total_price"`
	ImageURL      string      `gorm:"column:image_url" json:"image_url"`
	CPU           CPU         `gorm:"foreignKey:CPUID;references:ID" json:"cpu"`
	GPU           GPU         `gorm:"foreignKey:GPUID;references:ID" json:"gpu"`
	Motherboard   Motherboard `gorm:"foreignKey:MotherboardID;references:ID" json:"motherboard"`
	Body          Body        `gorm:"foreignKey:BodyID;references:ID" json:"body"`
	RAM           RAM         `gorm:"foreignKey:RAMID;references:ID" json:"ram"`
	PowerUnit     PowerUnit   `gorm:"foreignKey:PowerUnitID;references:ID" json:"power_unit"`
	HDD           HDD         `gorm:"foreignKey:HDDID;references:ID" json:"hdd"`
	SSD           SSD         `gorm:"foreignKey:SSDID;references:ID" json:"ssd"`
}

func (Pcbuild) TableName() string {
	return "pcbuild"
}
