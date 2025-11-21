"use client";
import { useForm } from "@tanstack/react-form";
import { updateEmpresaSchemaUI } from "../schemas/updateEmpresaSchemaUI";
import { createEmpresaSchemaUI } from "../schemas/createEmpresaSchemaUI";
import { useUpdateEmpresa } from "./useUpdateEmpresa.hook";
import { useCreateEmpresa } from "./useCreateEmpresa.hook";
import { EmpresaDto } from "../server/dtos/EmpresaDto.dto";

export const useEmpresaForm = (
  empresa: EmpresaDto | null,
  onSuccess?: () => void
) => {
  const updateEmpresaMutation = useUpdateEmpresa();
  const createEmpresaMutation = useCreateEmpresa();
  const isCreating = !empresa || !empresa.id;

  const form = useForm({
    defaultValues: {
      id: empresa?.id || "",
      razonSocial: empresa?.razonSocial ?? "",
      nombreComercial: empresa?.nombreComercial ?? "",
      rfc: empresa?.rfc ?? "",
      curp: empresa?.curp ?? "",
      direccionFiscal: empresa?.direccionFiscal ?? "",
      colonia: empresa?.colonia ?? "",
      ciudad: empresa?.ciudad ?? "",
      estado: empresa?.estado ?? "",
      codigoPostal: empresa?.codigoPostal ?? "",
      pais: empresa?.pais ?? "México",
      bancoPrincipal: empresa?.bancoPrincipal ?? "",
      nombreEnTarjetaPrincipal: empresa?.nombreEnTarjetaPrincipal ?? "",
      numeroCuentaPrincipal: empresa?.numeroCuentaPrincipal ?? "",
      clabePrincipal: empresa?.clabePrincipal ?? "",
      fechaExpiracionPrincipal: empresa?.fechaExpiracionPrincipal
        ? empresa.fechaExpiracionPrincipal.split("T")[0]
        : "",
      cvvPrincipal: empresa?.cvvPrincipal ?? null,
      bancoSecundario: empresa?.bancoSecundario ?? "",
      nombreEnTarjetaSecundario: empresa?.nombreEnTarjetaSecundario ?? "",
      numeroCuentaSecundario: empresa?.numeroCuentaSecundario ?? "",
      clabeSecundaria: empresa?.clabeSecundaria ?? "",
      fechaExpiracionSecundaria: empresa?.fechaExpiracionSecundaria
        ? empresa.fechaExpiracionSecundaria.split("T")[0]
        : "",
      cvvSecundario: empresa?.cvvSecundario ?? null,
    },
    validators: {
      // @ts-expect-error - Zod schema validation types are complex
      onSubmit: isCreating ? createEmpresaSchemaUI : updateEmpresaSchemaUI,
    },
    onSubmit: async ({ value }) => {
      // Validar id solo si no estamos creando
      if (!isCreating && !value.id) {
        throw new Error("ID es requerido para actualizar");
      }
      
      const formData = new FormData();
      
      if (!isCreating && value.id) {
        formData.append("id", value.id);
      }
      if (value.razonSocial) formData.append("razonSocial", value.razonSocial);
      if (value.nombreComercial)
        formData.append("nombreComercial", value.nombreComercial);
      if (value.rfc) formData.append("rfc", value.rfc);
      if (value.curp) formData.append("curp", value.curp);
      if (value.direccionFiscal)
        formData.append("direccionFiscal", value.direccionFiscal);
      if (value.colonia) formData.append("colonia", value.colonia);
      if (value.ciudad) formData.append("ciudad", value.ciudad);
      if (value.estado) formData.append("estado", value.estado);
      if (value.codigoPostal)
        formData.append("codigoPostal", value.codigoPostal);
      if (value.pais) formData.append("pais", value.pais);
      if (value.bancoPrincipal)
        formData.append("bancoPrincipal", value.bancoPrincipal);
      if (value.nombreEnTarjetaPrincipal)
        formData.append("nombreEnTarjetaPrincipal", value.nombreEnTarjetaPrincipal);
      if (value.numeroCuentaPrincipal)
        formData.append("numeroCuentaPrincipal", value.numeroCuentaPrincipal);
      if (value.clabePrincipal)
        formData.append("clabePrincipal", value.clabePrincipal);
      if (value.fechaExpiracionPrincipal)
        formData.append("fechaExpiracionPrincipal", value.fechaExpiracionPrincipal);
      if (value.cvvPrincipal !== null && value.cvvPrincipal !== undefined)
        formData.append("cvvPrincipal", value.cvvPrincipal.toString());
      if (value.bancoSecundario)
        formData.append("bancoSecundario", value.bancoSecundario);
      if (value.nombreEnTarjetaSecundario)
        formData.append("nombreEnTarjetaSecundario", value.nombreEnTarjetaSecundario);
      if (value.numeroCuentaSecundario)
        formData.append("numeroCuentaSecundario", value.numeroCuentaSecundario);
      if (value.clabeSecundaria)
        formData.append("clabeSecundaria", value.clabeSecundaria);
      if (value.fechaExpiracionSecundaria)
        formData.append("fechaExpiracionSecundaria", value.fechaExpiracionSecundaria);
      if (value.cvvSecundario !== null && value.cvvSecundario !== undefined)
        formData.append("cvvSecundario", value.cvvSecundario.toString());

      if (isCreating) {
        await createEmpresaMutation.mutateAsync(formData);
      } else {
        await updateEmpresaMutation.mutateAsync(formData);
      }
      onSuccess?.();
    },
  });

  return form;
};

