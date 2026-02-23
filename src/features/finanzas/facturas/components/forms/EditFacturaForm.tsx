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
    factura.status === "borrador"
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
            Es recomendable<span className="font-bold"> NO </span>Editar esta
            factura. Solo se recomienda editar las facturas con status{" "}
            <span className="font-bold"> BORRADOR </span>
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
          {/* SECCIÓN: Datos CFDI */}
          <div className="col-span-full">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Datos CFDI
            </h3>
          </div>

          {/* UUID */}
          <form.Field name="uuid">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="uuid">UUID</FieldLabel>
                    <FieldDescription>UUID fiscal del CFDI</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="uuid"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Serie */}
          <form.Field name="serie">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="serie">Serie</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="serie"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          {/* Folio */}
          <form.Field name="folio">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="folio">Folio</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="folio"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

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

          {/* SECCIÓN: Montos */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Montos
            </h3>
          </div>

          {/* Subtotal */}
          <form.Field name="subtotal">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="subtotal">Subtotal</FieldLabel>
                    <FieldDescription>Monto antes de impuestos</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="subtotal"
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

          {/* Impuestos Trasladados */}
          <form.Field name="totalImpuestosTransladados">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="totalImpuestosTransladados">
                    Impuestos Trasladados
                  </FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="totalImpuestosTransladados"
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value) || 0)
                  }
                />
              </Field>
            )}
          </form.Field>

          {/* Impuestos Retenidos */}
          <form.Field name="totalImpuestosRetenidos">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="totalImpuestosRetenidos">
                    Impuestos Retenidos
                  </FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="totalImpuestosRetenidos"
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value) || 0)
                  }
                />
              </Field>
            )}
          </form.Field>

          {/* Total */}
          <form.Field name="total">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="total">Total</FieldLabel>
                    <FieldDescription>Monto total</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Input
                    id="total"
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

          {/* SECCIÓN: Status y Pago */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Status y Pago
            </h3>
          </div>

          {/* Status */}
          <form.Field name="status">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
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
                    <SelectTrigger id="status" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar status" />
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

          {/* Método de Pago */}
          <form.Field name="metodoPago">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="metodoPago">Método de Pago</FieldLabel>
                  <FieldDescription>PUE/PPD</FieldDescription>
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id="metodoPago">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="PUE">PUE</SelectItem>
                    <SelectItem value="PPD">PPD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          {/* Moneda */}
          <form.Field name="moneda">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="moneda">Moneda</FieldLabel>
                    <FieldDescription>Moneda de la factura</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id="moneda" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }}
          </form.Field>

          {/* Uso CFDI */}
          <form.Field name="usoCfdi">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="usoCfdi">Uso CFDI</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="usoCfdi"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="G03, P01, etc."
                />
              </Field>
            )}
          </form.Field>

          {/* Status Pago */}
          <form.Field name="statusPago">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="statusPago">Status de Pago</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id="statusPago">
                    <SelectValue placeholder="Seleccionar status" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem value="Vigente">Vigente</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          {/* Fecha de Pago */}
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

          {/* Nombre Emisor */}
          <form.Field name="nombreEmisor">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="nombreEmisor">Nombre Emisor</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="nombreEmisor"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          {/* Nombre Receptor */}
          <form.Field name="nombreReceptor">
            {(field) => (
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="nombreReceptor">Nombre Receptor</FieldLabel>
                  <FieldDescription>Opcional</FieldDescription>
                </FieldContent>
                <Input
                  id="nombreReceptor"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
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

          {/* Submit Button */}
          <div className="flex justify-end mt-4 col-span-full">
            <Button
              type="submit"
              className="w-full flex justify-center"
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
