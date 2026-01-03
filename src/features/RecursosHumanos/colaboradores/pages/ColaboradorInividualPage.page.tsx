"use client";

import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { ColaboradorProfileHeader } from "../components/ColaboradorProfileHeader";
import { ColaboradorProfileSection } from "../components/ColaboradorProfileSection";
import { ColaboradorInfoField } from "../components/ColaboradorInfoField";
import { Badge } from "@/core/shared/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/ui/tabs";
import {
  formatDate,
  formatCurrency,
  formatBoolean,
  formatValue,
  formatStatus,
} from "../helpers/formatColaboradorProfile";
import { Separator } from "@/core/shared/ui/separator";
import { useModalState } from "@/core/shared/hooks/useModalState";
import dynamic from "next/dynamic";
import { LoadingModalState } from "@/core/shared/components/LoadingModalState";

const EditColaboradorSheet = dynamic(
  () =>
    import("../components/EditColaboradorSheet").then((mod) => ({
      default: mod.EditColaboradorSheet,
    })),
  {
    ssr: false,
    loading: () => <LoadingModalState />,
  }
);

interface Props {
  colaborador: ColaboradorDto;
}

export const ColaboradorIndividualPage = ({ colaborador }: Props) => {
  const { isOpen, openModal, closeModal } = useModalState();
  const statusInfo = formatStatus(colaborador.status);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <ColaboradorProfileHeader colaborador={colaborador} onEdit={openModal} />

      {/* Tabs con Información Organizada */}
      <Tabs defaultValue="personal" className="w-full">
        {/* Contenedor con scroll horizontal para mobile */}
        <div className="overflow-x-auto scrollbar-thin -mx-2 px-2 md:mx-0 md:px-0">
          <TabsList className="w-max min-w-full md:w-auto md:min-w-2/3">
            <TabsTrigger value="personal" className="whitespace-nowrap">
              Datos Personales
            </TabsTrigger>
            <TabsTrigger value="laboral" className="whitespace-nowrap">
              Información Laboral
            </TabsTrigger>
            <TabsTrigger value="fiscal-bancaria" className="whitespace-nowrap">
              Fiscal y Bancaria
            </TabsTrigger>
            {(colaborador.nombreReferenciaPersonal ||
              colaborador.telefonoReferenciaPersonal ||
              colaborador.parentescoReferenciaPersonal ||
              colaborador.nombreReferenciaLaboral ||
              colaborador.telefonoReferenciaLaboral) && (
              <TabsTrigger value="referencias" className="whitespace-nowrap">
                Referencias
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Tab: Información Personal */}
        <TabsContent value="personal" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColaboradorProfileSection title="Datos Personales">
              <ColaboradorInfoField
                label="Género"
                value={formatValue(colaborador.genero)}
              />
              <ColaboradorInfoField
                label="Fecha de nacimiento"
                value={formatDate(colaborador.fechaNacimiento)}
              />
              <ColaboradorInfoField
                label="Nacionalidad"
                value={formatValue(colaborador.nacionalidad)}
              />
              <ColaboradorInfoField
                label="Estado civil"
                value={formatValue(colaborador.estadoCivil)}
              />
              <ColaboradorInfoField
                label="Tipo de sangre"
                value={formatValue(colaborador.tipoSangre)}
              />
            </ColaboradorProfileSection>

            <ColaboradorProfileSection title="Contacto y Dirección">
              {colaborador.direccion && (
                <ColaboradorInfoField
                  label="Dirección"
                  value={formatValue(colaborador.direccion)}
                />
              )}
              {colaborador.telefono && (
                <ColaboradorInfoField
                  label="Teléfono"
                  value={formatValue(colaborador.telefono)}
                />
              )}
              <ColaboradorInfoField
                label="Correo electrónico"
                value={formatValue(colaborador.correo)}
              />
              <Separator className="my-2" />
              <ColaboradorInfoField
                label="Fecha de ingreso"
                value={formatDate(colaborador.fechaIngreso)}
              />
            </ColaboradorProfileSection>
          </div>
        </TabsContent>

        {/* Tab: Información Laboral */}
        <TabsContent value="laboral" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColaboradorProfileSection title="Información Laboral">
              <ColaboradorInfoField label="Puesto" value={colaborador.puesto} />
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Estado
                </div>
                <Badge variant={statusInfo.variant} className="w-fit">
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  IMSS
                </div>
                <Badge
                  variant={
                    colaborador.imss ? "success-outline" : "warning-outline"
                  }
                  className="w-fit"
                >
                  {formatBoolean(colaborador.imss)}
                </Badge>
              </div>
              {colaborador.socio && (
                <>
                  <Separator className="my-2" />
                  <ColaboradorInfoField
                    label="Socio responsable"
                    value={colaborador.socio.nombre}
                  />
                </>
              )}
            </ColaboradorProfileSection>

            {(colaborador.ultimoGradoEstudios ||
              colaborador.escuela ||
              colaborador.ultimoTrabajo) && (
              <ColaboradorProfileSection title="Formación Académica y Laboral">
                <ColaboradorInfoField
                  label="Último grado de estudios"
                  value={formatValue(colaborador.ultimoGradoEstudios)}
                />
                <ColaboradorInfoField
                  label="Escuela"
                  value={formatValue(colaborador.escuela)}
                />
                <ColaboradorInfoField
                  label="Último trabajo"
                  value={formatValue(colaborador.ultimoTrabajo)}
                />
              </ColaboradorProfileSection>
            )}
          </div>
        </TabsContent>

        {/* Tab: Información Fiscal y Bancaria */}
        <TabsContent value="fiscal-bancaria" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(colaborador.rfc || colaborador.curp) && (
              <ColaboradorProfileSection title="Información Fiscal">
                <ColaboradorInfoField
                  label="RFC"
                  value={formatValue(colaborador.rfc)}
                />
                <ColaboradorInfoField
                  label="CURP"
                  value={formatValue(colaborador.curp)}
                />
              </ColaboradorProfileSection>
            )}

            <ColaboradorProfileSection title="Información Bancaria">
              <ColaboradorInfoField
                label="Banco"
                value={formatValue(colaborador.banco)}
              />
              <ColaboradorInfoField
                label="CLABE"
                value={
                  colaborador.clabe ? (
                    <span className="font-mono">{colaborador.clabe}</span>
                  ) : (
                    "No especificado"
                  )
                }
              />
              <ColaboradorInfoField
                label="Sueldo"
                value={formatCurrency(colaborador.sueldo)}
              />
            </ColaboradorProfileSection>
          </div>
        </TabsContent>

        {/* Tab: Referencias */}
        {(colaborador.nombreReferenciaPersonal ||
          colaborador.telefonoReferenciaPersonal ||
          colaborador.parentescoReferenciaPersonal ||
          colaborador.nombreReferenciaLaboral ||
          colaborador.telefonoReferenciaLaboral) && (
          <TabsContent value="referencias" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(colaborador.nombreReferenciaPersonal ||
                colaborador.telefonoReferenciaPersonal ||
                colaborador.parentescoReferenciaPersonal) && (
                <ColaboradorProfileSection title="Referencia Personal">
                  <ColaboradorInfoField
                    label="Nombre"
                    value={formatValue(colaborador.nombreReferenciaPersonal)}
                  />
                  <ColaboradorInfoField
                    label="Teléfono"
                    value={formatValue(colaborador.telefonoReferenciaPersonal)}
                  />
                  <ColaboradorInfoField
                    label="Parentesco"
                    value={formatValue(
                      colaborador.parentescoReferenciaPersonal
                    )}
                  />
                </ColaboradorProfileSection>
              )}

              {(colaborador.nombreReferenciaLaboral ||
                colaborador.telefonoReferenciaLaboral) && (
                <ColaboradorProfileSection title="Referencia Laboral">
                  <ColaboradorInfoField
                    label="Nombre"
                    value={formatValue(colaborador.nombreReferenciaLaboral)}
                  />
                  <ColaboradorInfoField
                    label="Teléfono"
                    value={formatValue(colaborador.telefonoReferenciaLaboral)}
                  />
                </ColaboradorProfileSection>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de Edición */}
      {isOpen && (
        <EditColaboradorSheet
          isOpen={isOpen}
          onClose={closeModal}
          colaborador={colaborador}
        />
      )}
    </div>
  );
};
