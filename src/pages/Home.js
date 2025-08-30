import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { loadExpenses, removeExpense } from '../utils/expenses';
import ExpenseItem from '../components/ExpenseItem';
import { generateOccurrences } from '../utils/recurrence';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 24;

const Home = ({ navigation }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({ search: '', from: null, to: null });

    const loadExpensesPage = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const list = await loadExpenses({
                search: filters.search,
                from: filters.from,
                to: filters.to,
                limit: 10,
                offset: page * 10
            });
            setExpenses(prevExpenses => [...prevExpenses, ...list]);
            setPage(prevPage => prevPage + 1);
            if (list.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading expenses:", error);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, filters]);

    const refreshExpenses = useCallback(() => {
        setPage(0);
        setHasMore(true);
        setExpenses([]);
        loadExpensesPage();
    }, [loadExpensesPage]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', refreshExpenses);
        return unsubscribe;
    }, [navigation, refreshExpenses]);

    const handleEdit = (item) => {
        navigation.navigate('Despesa', { item });
    };

    const handleDelete = async (id) => {
        await removeExpense(id);
        refreshExpenses();
    };

    const handleApplyFilters = () => {
        refreshExpenses();
    };

    const expenseChartData = React.useMemo(() => {
        const now = new Date();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push(d);
        }

        const labels = last6Months.map(d => `${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`);
        const totals = last6Months.map(month => {
            const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            let sum = 0;
            expenses.forEach(exp => {

                const occurrencesInMonth = generateOccurrences(
                    exp,
                    endOfMonth.toISOString().slice(0, 10)
                );

                occurrencesInMonth.forEach(occ => {
                    const occDate = new Date(occ.date + 'T00:00:00');
                    if (occDate.getMonth() === month.getMonth() && occDate.getFullYear() === month.getFullYear()) {
                        sum += Number(occ.amount) * (occ.type === 'renda' ? 1 : -1);
                    }
                });
            });
            return Number(sum.toFixed(2));
        });

        return { labels, totals };
    }, [expenses]);

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>Resumo (últimos 6 meses)</Text>
            <LineChart
                data={{ labels: expenseChartData.labels, datasets: [{ data: expenseChartData.totals }] }}
                width={screenWidth}
                height={280}
                yAxisLabel="R$ "
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                    }
                }}
                bezier
                style={styles.chartStyle}
            />

            <View style={styles.filtersContainer}>
                <TextInput
                    placeholder="Buscar por título"
                    value={filters.search}
                    onChangeText={(text) => setFilters({ ...filters, search: text })}
                    style={styles.filterInput}
                />

                {/* TODO: Implementar componentes de filtro por data */}
                <TouchableOpacity onPress={handleApplyFilters} style={styles.applyFilterBtn}>
                    <Text>Filtrar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.addExpenseHeader}>
                <Text style={styles.listTitle}>Despesas</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Despesa')} style={styles.addBtn}>
                    <Text>+ Nova</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={expenses}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ExpenseItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
                )}
                ListHeaderComponent={renderHeader}
                onEndReached={loadExpensesPage}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} /> : null}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
        backgroundColor: '#fff',
    },
    headerSection: {
        padding: 4,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 10,
        paddingLeft: 4,
        // elevation: 3, 
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    filterInput: {
        flex: 1, // Takes up available space
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
        backgroundColor: '#f9f9f9',
    },
    applyFilterBtn: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addExpenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 6,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    addBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#d3d3d3',
        borderRadius: 8,
    },
    loadingIndicator: {
        marginVertical: 16,
    },
});

export default Home;