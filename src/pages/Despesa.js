import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Select } from 'react-native';
import { addExpense, updateExpense } from '../utils/expenses';
import dayjs from 'dayjs';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export default function AddEditExpense({ navigation, route }) {
    const editing = route.params?.item;
    const [title, setTitle] = useState(editing?.title || '');
    const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : '');
    const [date, setDate] = useState(editing?.date || dayjs().format('YYYY-MM-DD'));
    const [isRecurring, setIsRecurring] = useState(Boolean(editing?.freq));
    const [freq, setFreq] = useState(editing?.freq || 'mensal');
    const [interval, setFormInterval] = useState(editing?.interval ? String(editing.interval) : '1');
    const [type, setType] = useState(editing?.type || 'despesa');

    useEffect(() => {
        if (editing) {
            navigation.setOptions({ title: 'Editar Despesa' });
            console.log("UseEffect isRecurring", isRecurring);
            console.log("UseEffect editing", editing);
        } else {
            navigation.setOptions({ title: 'Nova Despesa' });
        }
    }, []);


    async function handleSave() {
        console.log("handleSave", "is recurring:", isRecurring);
        try {

            const item = {
                id: editing?.id || uuidv4(),
                title,
                amount: Number(amount),
                date,
                freq: isRecurring ? freq : null,
                interval: isRecurring ? Number(interval) : 1,
                type: type
            };

            console.log("Item a ser salvo:", item);

            if (editing) {
                console.log("Editando despesa existente");
                await updateExpense(item);
            } else {
                console.log("Criando nova despesa");
                await addExpense(item);
            }

            console.log("Despesa salva com sucesso!");
            navigation.goBack();

        } catch (error) {
            console.error("Erro ao salvar despesa:", error);
        }
    }


    return (
        <View style={styles.container}>
            <Text>Título</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <View style={{ padding: 12 }}>
                <Text>Tipo:</Text>
                <View style={styles.inlineContainer}>
                    <TouchableOpacity
                        style={[styles.button, type === 'despesa' && styles.active]}
                        onPress={() => setType('despesa')}
                    >
                        <Text style={type === 'despesa' ? styles.activeText : styles.text}>Despesa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, type === 'renda' && styles.active]}
                        onPress={() => setType('renda')}
                    >
                        <Text style={type === 'renda' ? styles.activeText : styles.text}>Receita</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ marginTop: 12 }}>Tipo selecionado: {type}</Text>
            </View>

            <Text>Valor (R$)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />


            <Text>Data (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />


            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <Text>Recorrente?</Text>
                <Switch value={isRecurring} onValueChange={setIsRecurring} />
            </View>


            {isRecurring && (
                <View>
                    <Text>Frequência</Text>
                    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
                        {['diario', 'semanal', 'mensal'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => setFreq(option)}
                                style={{
                                    padding: 8,
                                    marginRight: 8,
                                    borderRadius: 6,
                                    backgroundColor: freq === option ? '#2b6cb0' : '#ddd',
                                }}
                            >
                                <Text style={{ color: freq === option ? '#fff' : '#000' }}>
                                    {option === 'diario' ? 'Diária' : option === 'semanal' ? 'Semanal' : 'Mensal'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text>Intervalo (ex: 1)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={interval}
                        onChangeText={setFormInterval}
                    />
                </View>
            )}



            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={{ color: '#fff' }}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8, borderRadius: 6 },
    saveBtn: { marginTop: 12, backgroundColor: '#2b6cb0', padding: 12, alignItems: 'center', borderRadius: 6 },
    inlineContainer: { flexDirection: 'row', marginTop: 4 },
    button: {
        flex: 1,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        marginHorizontal: 2,
        alignItems: 'center'
    },
    active: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    text: { color: '#000' },
    activeText: { color: '#fff', fontWeight: '600' }
});