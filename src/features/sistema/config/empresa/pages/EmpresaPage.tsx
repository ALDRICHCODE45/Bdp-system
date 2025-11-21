"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { EmpresaForm } from "../components/forms/EmpresaForm";
import { useGetEmpresa } from "../hooks/useGetEmpresa.hook";
import { Skeleton } from "@/core/shared/ui/skeleton";

export const EmpresaPage = () => {
  const { data: empresa, isLoading, error } = useGetEmpresa();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Empresa</CardTitle>
            <CardDescription>
              Gestiona la configuración relacionada con los datos de la empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              Error al cargar los datos de la empresa: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Empresa</CardTitle>
          <CardDescription>
            Gestiona la configuración relacionada con los datos de la empresa.
            Esta información se utilizará principalmente para aspectos fiscales y
            financieros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmpresaForm empresa={empresa || null} />
        </CardContent>
      </Card>
    </div>
  );
};

