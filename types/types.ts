// types/types.ts

// Definimos el tipo para la notificación local
export type LocalNotification = {
  id: string; // ID único para la notificación
  title: string; // Título de la notificación
  body: string; // Cuerpo de la notificación
  trigger: {
    repeats: boolean; // Si la notificación se repite
  };
  data: {
    medicationId: string; // ID del medicamento asociado a la notificación
    isTakeNotification: boolean; // Para diferenciar entre notificaciones de dosis y de stock
  };
};

// Definimos el tipo para un documento o foto asociado a un medicamento
export type AssociatedDocument = {
  name: string; // Nombre del archivo
  uri: string; // URI para acceder al archivo en el sistema de archivos
  mimeType: string; // Tipo de archivo (por ejemplo, 'image/jpeg', 'application/pdf')
};

// Definimos la estructura completa de un ítem de medicamento en el inventario
export interface MedicationItem {
  id: string; // ID único para cada medicamento
  nombre: string;
  fechaCaducidad: string; // Usaremos un string en formato ISO 8601 para manejar fechas
  cantidadTotal: number; // Cantidad actual en stock
  // Opcional: para medicamentos con horario de toma
  intervalo?: number; // Intervalo de toma en horas (ej: 8 para cada 8 horas)
  horaInicio?: string; // Hora de inicio de la toma (ej: '10:00')
  dosisPorToma?: number; // Cantidad de dosis por toma
  // Propiedades adicionales
  notas?: string;
  documentos?: AssociatedDocument[]; // Array de documentos y fotos
}

// Definimos el tipo para la estructura de nuestro almacenamiento de datos principal
export type AppData = {
  medications: MedicationItem[];
};
