-- Добавляем внешние ключи для компонентов PC
ALTER TABLE pcs
    ADD CONSTRAINT fk_pc_cpu FOREIGN KEY (cpu_id) REFERENCES cpu(id),
    ADD CONSTRAINT fk_pc_gpu FOREIGN KEY (gpu_id) REFERENCES gpu(id),
    ADD CONSTRAINT fk_pc_motherboard FOREIGN KEY (motherboard_id) REFERENCES motherboard(id),
    ADD CONSTRAINT fk_pc_ram FOREIGN KEY (ram_id) REFERENCES ram(id),
    ADD CONSTRAINT fk_pc_power_unit FOREIGN KEY (power_unit_id) REFERENCES power_unit(id),
    ADD CONSTRAINT fk_pc_body FOREIGN KEY (body_id) REFERENCES body(id),
    ADD CONSTRAINT fk_pc_hdd FOREIGN KEY (hdd_id) REFERENCES hdd(id),
    ADD CONSTRAINT fk_pc_ssd FOREIGN KEY (ssd_id) REFERENCES ssd(id);

-- Добавляем внешние ключи для OrderItem
ALTER TABLE order_items
    ADD CONSTRAINT fk_order_item_build FOREIGN KEY (build_id) REFERENCES pcbuild(id);

-- Добавляем внешние ключи для CartItem
ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_item_build FOREIGN KEY (pcbuild_id) REFERENCES pcbuild(id); 