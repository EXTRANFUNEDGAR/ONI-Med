// app/(tabs)/index.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import { loadData, deleteMedication } from '../../services/DataService';
import { MedicationItem } from '../../types/types';

// Definimos los colores y fuentes de la identidad visual de ONI-MED
const Colors = {
  primaryBg: '#0A0A0A', // Negro profundo
  secondaryBg: '#1F1F1F', // Gris oscuro táctico
  secondaryText: '#4A4A4A', // Gris acero
  accent: '#0078D4', // Azul cobalto ONI
  success: '#00FF88', // Verde HUD militar
};

// Componente para renderizar cada ítem de la lista
const ItemCard = ({ item, onDelete }: { item: MedicationItem; onDelete: (id: string) => void }) => {
  const navigation = useNavigation();

  // Función para navegar a la pantalla de detalles al presionar la tarjeta
  const handlePress = () => {
    // Redirige a la pantalla de detalles, pasando el ID del medicamento
    // El nombre de la ruta es '[id]' para que Expo Router la reconozca
    navigation.navigate('(tabs)/[id]', { id: item.id });
  };

  // Calcula la diferencia de días para mostrar la alerta de caducidad
  const daysUntilExpiry = Math.ceil((new Date(item.fechaCaducidad).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

  // Estilo condicional para la fecha de caducidad
  const expiryDateStyle = isExpired ? styles.expiredText : (isExpiringSoon ? styles.expiringSoonText : styles.normalText);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Entypo name="trash" size={24} color="#4A4A4A" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardText}>Cantidad: {item.cantidadTotal}</Text>
      <Text style={[styles.cardText, expiryDateStyle]}>Caducidad: {item.fechaCaducidad}</Text>
    </TouchableOpacity>
  );
};

const InventoryScreen = () => {
  const navigation = useNavigation();
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Usa useFocusEffect para recargar los datos cada vez que la pantalla se enfoca
  // Esto asegura que la lista esté siempre actualizada
  useFocusEffect(
    useCallback(() => {
      const fetchMedications = async () => {
        setLoading(true);
        const data = await loadData();
        setMedications(data.medications);
        setLoading(false);
      };
      fetchMedications();
    }, [])
  );

  const handleDeleteMedication = async (id: string) => {
    // Aquí podrías agregar una confirmación visual antes de eliminar
    const updatedList = await deleteMedication(id);
    setMedications(updatedList);
  };

  // Componente del botón flotante para agregar
  const AddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => navigation.navigate('(tabs)/[id]', { id: 'new' })} // Navegamos a la pantalla de detalles con un ID 'new'
    >
      <Entypo name="plus" size={32} color={Colors.primaryBg} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Control de Medicamentos</Text>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onDelete={handleDeleteMedication} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay registros. Presiona "+" para agregar.</Text>
          </View>
        }
      />
      <AddButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Exo2_400Regular', // Usa la fuente que carguemos
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: 'Orbitron_700Bold', // Usa la fuente que carguemos
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.secondaryBg,
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.secondaryText,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Exo2_700Bold',
  },
  cardText: {
    color: Colors.secondaryText,
    marginTop: 5,
    fontFamily: 'Exo2_400Regular',
  },
  expiredText: {
    color: 'red', // Rojo para medicamentos caducados
    fontWeight: 'bold',
  },
  expiringSoonText: {
    color: Colors.success, // Verde HUD para los que están a punto de caducar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Colors.secondaryText,
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});