-- Add indexes for factura filter columns used in getPaginated queries
CREATE INDEX "Factura_metodoPago_idx" ON "Factura"("metodoPago");
CREATE INDEX "Factura_statusPago_idx" ON "Factura"("statusPago");
CREATE INDEX "Factura_total_idx" ON "Factura"("total");
CREATE INDEX "Factura_fechaPago_idx" ON "Factura"("fechaPago");
