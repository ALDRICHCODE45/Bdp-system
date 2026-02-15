-- CreateIndex
CREATE INDEX "Asistencia_fecha_idx" ON "Asistencia"("fecha");

-- CreateIndex
CREATE INDEX "Asistencia_tipo_idx" ON "Asistencia"("tipo");

-- CreateIndex
CREATE INDEX "Egreso_estado_createdAt_idx" ON "Egreso"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "Egreso_periodo_createdAt_idx" ON "Egreso"("periodo", "createdAt");

-- CreateIndex
CREATE INDEX "EntradasSalidas_fecha_idx" ON "EntradasSalidas"("fecha");

-- CreateIndex
CREATE INDEX "EntradasSalidas_createdAt_idx" ON "EntradasSalidas"("createdAt");

-- CreateIndex
CREATE INDEX "Factura_estado_createdAt_idx" ON "Factura"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "Factura_periodo_fechaEmision_idx" ON "Factura"("periodo", "fechaEmision");

-- CreateIndex
CREATE INDEX "Ingreso_estado_createdAt_idx" ON "Ingreso"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "Ingreso_periodo_createdAt_idx" ON "Ingreso"("periodo", "createdAt");
