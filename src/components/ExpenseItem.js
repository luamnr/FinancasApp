import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


export default function ExpenseItem({ item, onEdit, onDelete }) {
    return (
        <View style={styles.row}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>{item.date}</Text>
                <Text style={{ color: item.type === 'renda' ? 'green' : 'red' }}>
                    {item.type === 'renda' ? '+' : '-'} R$ {Number(item.amount).toFixed(2)}
                </Text>
                {item.freq && (
                    <Text>{item.freq} x {item.interval}</Text>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.btn}>
                    <Text>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.btn}>
                    <Text>Apagar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontWeight: '600' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    btn: { marginLeft: 8, padding: 6 }
});