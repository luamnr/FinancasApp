import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { loadExpenses, removeExpense } from '../utils/expenses';
import ExpenseItem from '../components/ExpenseItem';
import { generateOccurrences } from '../utils/recurrence';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width - 24;

export default function Home({ navigation }) {

    const [expenses, setExpenses] = useState([]);

    async function refresh() {
        const list = await loadExpenses();
        setExpenses(list);
    }


    useEffect(() => {
        const unsub = navigation.addListener('focus', refresh);
        return unsub;
    }, [navigation]);

    useEffect(() => {
        console.log("Teste dump expenses", expenses);
    }, [expenses]);

    function handleEdit(item) {
        navigation.navigate('Despesa', { item });
    }


    async function handleDelete(id) {
        await removeExpense(id);
        refresh();
    }


    const now = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6.push(d);
    }


    const labels = last6.map(d => `${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`);
    const totals = last6.map(m => {
        const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0);
        let sum = 0;
        expenses.forEach(exp => {
            const occ = generateOccurrences(exp, endOfMonth.toISOString().slice(0, 10));
            occ.forEach(o => {
                const od = new Date(o.date + 'T00:00:00');
                if (od.getMonth() === m.getMonth() && od.getFullYear() === m.getFullYear()) sum += Number(o.amount);
            });
        });
        return Number(sum.toFixed(2));
    });

    return (

        <FlatList
            data={expenses.sort((a, b) => (a.date < b.date ? 1 : -1))}
            keyExtractor={i => i.id}
            renderItem={({ item }) => <ExpenseItem item={item} onEdit={handleEdit} onDelete={handleDelete} />}
            ListHeaderComponent={
                <View style={{ padding: 12 }}>
                    <Text style={styles.header}>Resumo (últimos 6 meses)</Text>

                    <LineChart
                        data={{ labels, datasets: [{ data: totals }] }}
                        width={screenWidth}
                        height={220}
                        yAxisLabel="R$ "
                        chartConfig={{
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 2,
                            propsForDots: { r: '4' },
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 8 }}
                    />

                    <View style={{ marginTop: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18 }}>Despesas</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Despesa')} style={styles.addBtn}>
                            <Text>+ Nova</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { fontSize: 16, fontWeight: '600' },
    addBtn: { padding: 8 }
});