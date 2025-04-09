ALTER TABLE CPU RENAME TO CPUs;
ALTER TABLE GPU RENAME TO GPUs;
ALTER TABLE Motherboard RENAME TO Motherboards;
ALTER TABLE Body RENAME TO Bodies;
ALTER TABLE RAM RENAME TO RAMs;
ALTER TABLE PowerUnit RENAME TO PowerUnits;
ALTER TABLE HDD RENAME TO HDDs;
ALTER TABLE SSD RENAME TO SSDs;
ALTER TABLE PCBuilds RENAME TO PCBuilds; -- таблица сборок, если уже правильно


ALTER TABLE PCBuilds RENAME COLUMN Cpu_ID TO CPUID;
ALTER TABLE PCBuilds RENAME COLUMN Gpu_ID TO GPUID;
ALTER TABLE PCBuilds RENAME COLUMN Motherboard_ID TO MOTHERBOARDID;
ALTER TABLE PCBuilds RENAME COLUMN Body_ID TO BODYID;
ALTER TABLE PCBuilds RENAME COLUMN Ram_ID TO RAMID;
ALTER TABLE PCBuilds RENAME COLUMN Power_Unit_ID TO POWERUNITID;
ALTER TABLE PCBuilds RENAME COLUMN Hdd_ID TO HDDID;
ALTER TABLE PCBuilds RENAME COLUMN Ssd_ID TO SSDID;
