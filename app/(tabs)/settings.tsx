// app/(tabs)/settings.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Entypo } from '@expo/vector-icons';
import { exportData, importData } from '../../services/DataService';

// Definimos los colores y fuentes de la identidad visual de ONI-MED
const Colors = {
  primaryBg: '#0A0A0A', // Negro profundo
  secondaryBg: '#1F1F1F', // Gris oscuro táctico
  secondaryText: '#4A4A4A', // Gris acero
  accent: '#0078D4', // Azul cobalto ONI
  success: '#00FF88', // Verde HUD militar
};

const SettingsScreen = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Maneja la exportación de datos a un archivo JSON.
   */
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Usamos la función de nuestro DataService para crear el archivo
      const fileUri = await exportData();
      
      // En un entorno real, aquí se abriría un diálogo para guardar el archivo.
      // Expo FileSystem nos da la URI, pero en Android/iOS se gestiona de forma diferente.
      Alert.alert(
        'Exportación Exitosa',
        `El archivo ha sido guardado en: ${fileUri}`,
      );
    } catch (error) {
      console.error('Error al exportar los datos:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Maneja la importación de datos desde un archivo JSON.
   */
  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) {
        setIsImporting(false);
        return; // El usuario canceló la selección
      }

      const uri = result.assets[0].uri;
      const fileName = result.assets[0].name;

      // Le preguntamos al usuario si quiere sobrescribir o fusionar los datos
      Alert.alert(
        'Importar Datos',
        '¿Quieres sobrescribir todos los datos existentes o fusionar con los nuevos?',
        [
          {
            text: 'Fusionar',
            onPress: async () => {
              try {
                await importData(uri, false); // false para fusionar
                Alert.alert('Éxito', `Datos fusionados desde ${fileName}.`);
              } catch (e) {
                console.error('Error al fusionar datos:', e);
                Alert.alert('Error', `Ocurrió un error al fusionar los datos.`);
              } finally {
                setIsImporting(false);
              }
            },
          },
          {
            text: 'Sobrescribir',
            onPress: async () => {
              try {
                await importData(uri, true); // true para sobrescribir
                Alert.alert('Éxito', `Datos sobrescritos desde ${fileName}.`);
              } catch (e) {
                console.error('Error al sobrescribir datos:', e);
                Alert.alert('Error', `Ocurrió un error al sobrescribir los datos.`);
              } finally {
                setIsImporting(false);
              }
            },
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setIsImporting(false),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error al importar los datos:', error);
      Alert.alert('Error', 'No se pudieron importar los datos.');
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Configuración</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleExportData}
        disabled={isExporting}
      >
        <Text style={styles.buttonText}>
          {isExporting ? 'Exportando...' : 'Exportar Datos'}
        </Text>
        <Entypo name="export" size={24} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleImportData}
        disabled={isImporting}
      >
        <Text style={styles.buttonText}>
          {isImporting ? 'Importando...' : 'Importar Datos'}
        </Text>
        <Entypo name="upload" size={24} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: 'Orbitron_700Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Exo2_700Bold',
    marginRight: 10,
  },
  buttonIcon: {
    // Estilo para el icono
  },
});

export default SettingsScreen;
