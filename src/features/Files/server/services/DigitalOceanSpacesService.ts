import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/core/shared/config/env.config";
import { randomUUID } from "crypto";

// Tipos MIME permitidos para documentos financieros
const ALLOWED_MIME_TYPES = [
  // PDF
  "application/pdf",
  // XML
  "application/xml",
  "text/xml",
  // Excel
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export class DigitalOceanSpacesService {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor() {
    this.bucket = env.DO_SPACES_BUCKET;

    // Extraer el endpoint base sin el bucket
    // Si el endpoint es https://bdpsystem.sfo3.digitaloceanspaces.com
    // El endpoint base debe ser https://sfo3.digitaloceanspaces.com
    const endpointUrl = new URL(env.DO_SPACES_ENDPOINT);
    const hostnameParts = endpointUrl.hostname.split(".");

    // Si el primer segmento es el bucket, lo removemos
    // bdpsystem.sfo3.digitaloceanspaces.com -> sfo3.digitaloceanspaces.com
    if (hostnameParts[0] === this.bucket) {
      hostnameParts.shift();
    }

    const baseHostname = hostnameParts.join(".");
    const baseEndpoint = `${endpointUrl.protocol}//${baseHostname}`;
    this.endpoint = baseEndpoint;

    this.s3Client = new S3Client({
      endpoint: baseEndpoint,
      region: env.DO_SPACES_REGION,
      credentials: {
        accessKeyId: env.DO_ACCESS_KEY,
        secretAccessKey: env.DO_SECRET_KEY,
      },
      forcePathStyle: true, // Usar path-style para Digital Ocean Spaces
    });
  }

  /**
   * Valida el tipo MIME del archivo
   */
  private validateMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType);
  }

  /**
   * Genera un nombre único para el archivo
   */
  private generateUniqueFileName(
    originalFileName: string,
    folder: string
  ): string {
    const extension = originalFileName.split(".").pop();
    const uniqueId = randomUUID();
    const timestamp = Date.now();
    return `${folder}/${timestamp}-${uniqueId}.${extension}`;
  }

  /**
   * Sube un archivo a Digital Ocean Spaces.
   *
   * El objeto se persiste como PRIVADO (sin `ACL: "public-read"`). El método
   * devuelve la **clave** (key) cruda del objeto, NO una URL pública. La
   * lectura posterior se hace vía `getPresignedGetUrl(key, ttl)` desde un
   * server action con guard de permisos — nunca compartiendo la URL directa.
   *
   * @param file - El archivo a subir
   * @param folder - La carpeta donde se guardará (ej: "facturas", "movimientos")
   * @returns La clave cruda del objeto en Spaces (ej: "facturas/1715…-uuid.pdf")
   */
  async uploadFile(file: File, folder: string): Promise<string> {
    // Validar tipo MIME
    if (!this.validateMimeType(file.type)) {
      throw new Error(
        `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: PDF, XML, Excel, Word`
      );
    }

    // Validar tamaño (máximo 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`El archivo excede el tamaño máximo permitido de 10MB`);
    }

    // Generar nombre único
    const fileName = this.generateUniqueFileName(file.name, folder);

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Digital Ocean Spaces — objeto privado (sin ACL pública).
    // secure-file-access Phase 2: la lectura se hace por URL presignada
    // corta (10 min), no por URL pública permanente.
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    try {
      await this.s3Client.send(command);

      // Devolvemos la clave cruda, NO una URL pública. La URL presignada
      // se genera bajo demanda por `getPresignedGetUrl(key)` desde el
      // server action autorizado (Phase 3).
      return fileName;
    } catch (error) {
      throw new Error(
        `Error al subir el archivo a Digital Ocean Spaces: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Elimina un archivo de Digital Ocean Spaces.
   *
   * Recibe la **clave** del objeto directamente (no una URL). El caller
   * (FileService) lee `FileAttachment.fileUrl`, que en filas nuevas ya es
   * la clave — sin parsing. Filas legadas con URL completa aún no pasaron
   * por la migración de Phase 7; ver apply-progress para el plan.
   *
   * @param key - La clave cruda del objeto en Spaces
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(
        `Error al eliminar el archivo de Digital Ocean Spaces: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Genera una URL presignada de GET para un objeto privado.
   *
   * Helper de bajo nivel (primitiva reutilizable). El control de acceso se
   * aplica en el server action que invoca este método (Phase 3:
   * `getFilePresignedUrlAction`), no acá. Esta función sólo firma el GET —
   * no verifica permisos, identidad ni entidad dueña.
   *
   * La URL funciona tanto para objetos públicos como privados: si el
   * objeto es público, la firma sigue siendo válida (DO Spaces la ignora);
   * si es privado, la firma es obligatoria para autorizar la descarga.
   *
   * @param key - Clave cruda del objeto en Spaces
   * @param ttlSeconds - Segundos hasta expiración (default 600s = 10 min,
   *   dentro de la banda 5–15 min exigida por la spec)
   * @returns URL presignada con query string de firma
   */
  async getPresignedGetUrl(
    key: string,
    ttlSeconds: number = 600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: ttlSeconds,
      });
    } catch (error) {
      throw new Error(
        `Error al generar URL presignada para el objeto: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }
}
