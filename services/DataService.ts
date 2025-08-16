// services/DataService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Importamos la librería para generar IDs únicos
import {
  MedicationItem,
  AppData,
  AssociatedDocument,
} from '../types/types';

// Clave de AsyncStorage para nuestra data
const STORAGE_KEY = 'ONI_MED_STORAGE_KEY';

/**
 * Carga todos los datos de la aplicación desde AsyncStorage.
 * @returns {Promise<AppData>} La data de la app, o un objeto vacío si no hay datos.
 */
export const loadData = async (): Promise<AppData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : { medications: [] };
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    return { medications: [] };
  }
};

/**
 * Guarda los datos de la aplicación en AsyncStorage.
 * @param {AppData} data - El objeto de datos a guardar.
 */
export const saveData = async (data: AppData) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error al guardar los datos:', e);
  }
};

/**
 * Agrega un nuevo medicamento al inventario.
 * @param {Omit<MedicationItem, 'id'>} newItem - El nuevo ítem sin ID.
 * @returns {Promise<MedicationItem[]>} La lista de medicamentos actualizada.
 */
export const addMedication = async (
  newItem: Omit<MedicationItem, 'id'>,
): Promise<MedicationItem[]> => {
  const data = await loadData();
  const newMedication: MedicationItem = {
    ...newItem,
    id: uuidv4(), // Generamos un ID único para el nuevo ítem
  };
  data.medications.push(newMedication);
  await saveData(data);
  return data.medications;
};

/**
 * Edita un medicamento existente.
 * @param {MedicationItem} updatedItem - El ítem con la información actualizada.
 * @returns {Promise<MedicationItem[]>} La lista de medicamentos actualizada.
 */
export const updateMedication = async (
  updatedItem: MedicationItem,
): Promise<MedicationItem[]> => {
  const data = await loadData();
  const index = data.medications.findIndex((m) => m.id === updatedItem.id);
  if (index !== -1) {
    data.medications[index] = updatedItem;
    await saveData(data);
  }
  return data.medications;
};

/**
 * Elimina un medicamento del inventario.
 * @param {string} id - El ID del medicamento a eliminar.
 * @returns {Promise<MedicationItem[]>} La lista de medicamentos actualizada.
 */
export const deleteMedication = async (id: string): Promise<MedicationItem[]> => {
  const data = await loadData();
  data.medications = data.medications.filter((m) => m.id !== id);
  await saveData(data);
  return data.medications;
};

/**
 * Exporta todos los datos a un archivo JSON.
 * @returns {Promise<string>} El URI del archivo exportado.
 */
export const exportData = async (): Promise<string> => {
  const data = await loadData();
  const jsonString = JSON.stringify(data, null, 2);
  const fileName = `oni-med-data-${new Date().toISOString()}.json`;
  const uri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, jsonString);
  return uri;
};

/**
 * Importa datos desde un archivo JSON.
 * @param {string} uri - El URI del archivo a importar.
 * @param {boolean} overwrite - Si es true, sobrescribe los datos existentes.
 * Si es false, fusiona los datos.
 * @returns {Promise<MedicationItem[]>} La lista de medicamentos actualizada.
 */
export const importData = async (
  uri: string,
  overwrite: boolean,
): Promise<MedicationItem[]> => {
  const jsonString = await FileSystem.readAsStringAsync(uri);
  const importedData = JSON.parse(jsonString) as AppData;

  if (overwrite) {
    await saveData(importedData);
    return importedData.medications;
  } else {
    const existingData = await loadData();
    const mergedData = { ...existingData };

    // Creamos un mapa para detectar y evitar duplicados por ID
    const existingIds = new Set(existingData.medications.map(item => item.id));

    importedData.medications.forEach(item => {
      // Si el ID no existe en los datos actuales, lo añadimos
      if (!existingIds.has(item.id)) {
        mergedData.medications.push(item);
      }
    });

    await saveData(mergedData);
    return mergedData.medications;
  }
};