"use client";

import { Button } from "@/core/shared/ui/button";
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
  FieldContent,
  FieldDescription,
} from "@/core/shared/ui/field";
import { Input } from "@/core/shared/ui/input";
import { Textarea } from "@/core/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";
import { useUpdateFacturaForm } from "../../hooks/useUpdateFacturaForm.hook";
import { FacturaDto } from "../../server/dtos/FacturaDto.dto";
import { DatePicker } from "@/features/Recepcion/entradas-salidas/components/DatePicker";
import { useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/core/shared/ui/empty";
import { TriangleAlert } from "lucide-react";

interface EditFacturaFormProps {
  factura: FacturaDto;
  onSuccess?: () => void;
}

export const EditFacturaForm = ({
  factura,
  onSuccess,
}: EditFacturaFormProps) => {
  const form = useUpdateFacturaForm(factura, onSuccess);
  const [canEdit, setCanEdit] = useState<boolean>(
    factura.estado === "borrador"
  );

  if (!canEdit) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Advertencia.</EmptyTitle>
          <EmptyDescription>
            Factura No Editable. Solos las facturas con estado
            <span className="font-bold">BORRADOR</span>
            pueden ser editadas.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="">
            <Button onClick={() => setCanEdit(true)}>
              Editar de todos modos.
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="p-4">
      <form
        id="edit-factura-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* SECCIÓN: Origen (Solo Lectura) */}
          <div className="col-span-full">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Datos del Origen
            </h3>
          </div>

          {/* Tipo de Origen (Solo Lectura) */}
          <form.Field name="tipoOrigen">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="tipoOrigen">Tipo de Origen</FieldLabel>
                  <FieldDescription>No editable</FieldDescription>
                </FieldContent>
                <Input
                  id="tipoOrigen"
                  name={field.name}
                  value={field.state.value === "ingreso" ? "Ingreso" : "Egreso"}
                  readOnly
                  className="bg-muted"
                />
              </Field>
            )}
          </form.Field>

          {/* ID del Origen (Solo Lectura) */}
          <form.Field name="origenId">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="origenId">ID del Origen</FieldLabel>
                  <FieldDescription>No editable</FieldDescription>
                </FieldContent>
                <Input
                  id="origenId"
                  name={field.name}
                  value={field.state.value}
                  readOnly
                  className="bg-muted font-mono text-xs"
                />
              </Field>
            )}
          </form.Field>

          {/* clienteProveedorId (hidden) */}
          <form.Field name="clienteProveedorId">
            {(field) => (
              <input
                type="hidden"
                name={field.name}
                value={field.state.value}
              />
            )}
          </form.Field>

          {/* Cliente/Proveedor (Solo Lectura) */}
          <form.Field name="clienteProveedor">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="clienteProveedor">
                    Cliente/Proveedor
                  </FieldLabel>
                  <FieldDescription>No editable</FieldDescription>
                </FieldContent>
                <Input
                  id="clienteProveedor"
                  name={field.name}
                  value={field.state.value}
                  readOnly
                  className="bg-muted"
                />
              </Field>
            )}
          </form.Field>

          {/* SECCIÓN: Datos Principales */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Datos Principales
            </h3>
          </div>

          {/* Concepto */}
          <form.Field name="concepto">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="concepto">Concepto</FieldLabel>
                    <FieldDescription>
                      Descripción del servicio
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="concepto"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Monto */}
          <form.Field name="monto">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="monto">Monto</FieldLabel>
                    <FieldDescription>Cantidad a facturar</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="monto"
                    name={field.name}
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value) || 0)
                    }
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Periodo */}
          <form.Field name="periodo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="periodo">Periodo</FieldLabel>
                    <FieldDescription>Formato: YYYY-MM</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="periodo"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="2024-01"
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* SECCIÓN: Datos de Factura */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Datos de Factura
            </h3>
          </div>

          {/* Número de Factura */}
          <form.Field name="numeroFactura">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="numeroFactura">
                      Número de Factura
                    </FieldLabel>
                    <FieldDescription>Número único</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="numeroFactura"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Folio Fiscal */}
          <form.Field name="folioFiscal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="folioFiscal">Folio Fiscal</FieldLabel>
                    <FieldDescription>UUID fiscal</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="folioFiscal"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Estado */}
          <form.Field name="estado">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="estado">Estado</FieldLabel>
                    <FieldDescription>Estado actual</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as "borrador" | "enviada" | "pagada" | "cancelada"
                      )
                    }
                  >
                    <SelectTrigger id="estado" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="enviada">Enviada</SelectItem>
                      <SelectItem value="pagada">Pagada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          {/* Forma de Pago */}
          <form.Field name="formaPago">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="formaPago">Forma de Pago</FieldLabel>
                    <FieldDescription>Método de pago</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as "transferencia" | "efectivo" | "cheque"
                      )
                    }
                  >
                    <SelectTrigger id="formaPago" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar forma de pago" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="transferencia">
                        Transferencia
                      </SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          {/* SECCIÓN: Fechas */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Fechas
            </h3>
          </div>

          {/* Fecha Emisión */}
          <form.Field name="fechaEmision">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="fechaEmision">
                      Fecha de Emisión
                    </FieldLabel>
                    <FieldDescription>Selecciona la fecha</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <DatePicker
                    date={
                      field.state.value
                        ? new Date(field.state.value)
                        : undefined
                    }
                    onDateChange={(date) => {
                      field.handleChange(
                        date ? date.toISOString().split("T")[0] : ""
                      );
                    }}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Fecha Vencimiento */}
          <form.Field name="fechaVencimiento">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="fechaVencimiento">
                      Fecha de Vencimiento
                    </FieldLabel>
                    <FieldDescription>Selecciona la fecha</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <DatePicker
                    date={
                      field.state.value
                        ? new Date(field.state.value)
                        : undefined
                    }
                    onDateChange={(date) => {
                      field.handleChange(
                        date ? date.toISOString().split("T")[0] : ""
                      );
                    }}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Fecha de Pago (Opcional) */}
          <form.Field name="fechaPago">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="fechaPago">Fecha de Pago</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <DatePicker
                  date={
                    field.state.value ? new Date(field.state.value) : undefined
                  }
                  onDateChange={(date) => {
                    field.handleChange(
                      date ? date.toISOString().split("T")[0] : ""
                    );
                  }}
                />
              </Field>
            )}
          </form.Field>

          {/* Fecha de Registro */}
          <form.Field name="fechaRegistro">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="fechaRegistro">
                      Fecha de Registro
                    </FieldLabel>
                    <FieldDescription>Fecha de creación</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <DatePicker
                    date={
                      field.state.value
                        ? new Date(field.state.value)
                        : undefined
                    }
                    onDateChange={(date) => {
                      field.handleChange(
                        date ? date.toISOString().split("T")[0] : ""
                      );
                    }}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* SECCIÓN: Datos Fiscales */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Datos Fiscales
            </h3>
          </div>

          {/* RFC Emisor */}
          <form.Field name="rfcEmisor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="rfcEmisor">RFC Emisor</FieldLabel>
                    <FieldDescription>12-13 caracteres</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="rfcEmisor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    maxLength={13}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* RFC Receptor */}
          <form.Field name="rfcReceptor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="rfcReceptor">RFC Receptor</FieldLabel>
                    <FieldDescription>12-13 caracteres</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="rfcReceptor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    maxLength={13}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Dirección Emisor */}
          <form.Field name="direccionEmisor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="direccionEmisor">
                      Dirección Emisor
                    </FieldLabel>
                    <FieldDescription>Dirección completa</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Textarea
                    id="direccionEmisor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Dirección Receptor */}
          <form.Field name="direccionReceptor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="direccionReceptor">
                      Dirección Receptor
                    </FieldLabel>
                    <FieldDescription>Dirección completa</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Textarea
                    id="direccionReceptor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* SECCIÓN: Metadatos */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Metadatos
            </h3>
          </div>

          {/* Creado Por */}
          <form.Field name="creadoPor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="creadoPor">Creado Por</FieldLabel>
                    <FieldDescription>Nombre del creador</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="creadoPor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Autorizado Por */}
          <form.Field name="autorizadoPor">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="autorizadoPor">
                      Autorizado Por
                    </FieldLabel>
                    <FieldDescription>Nombre del autorizador</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="autorizadoPor"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* SECCIÓN: Notas */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Notas
            </h3>
          </div>

          {/* Notas */}
          <form.Field name="notas">
            {(field) => {
              return (
                <Field orientation="responsive">
                  <FieldContent>
                    <FieldLabel htmlFor="notas">Notas</FieldLabel>
                    <FieldDescription>Notas adicionales</FieldDescription>
                  </FieldContent>
                  <Textarea
                    id="notas"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Submit Button */}
          <div className="flex justify-end mt-4 col-span-full">
            <Button
              type="submit"
              className="w-full fles justify-center"
              form="edit-factura-form"
            >
              Actualizar Factura
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};
