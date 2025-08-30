import { getDB } from './db';


export async function addExpense(expense) {
    const db = await getDB();
    await db.executeSql(
        'INSERT INTO expenses (id,title,amount,date,freq,interval) VALUES (?,?,?,?,?,?)',
        [expense.id, expense.title, expense.amount, expense.date, expense.freq || null, expense.interval || 1]
    );
}


export async function updateExpense(expense) {
    const db = await getDB();
    console.log("updateExpense", expense);
    await db.executeSql(
        'UPDATE expenses SET title=?, amount=?, date=?, freq=?, interval=? WHERE id=?',
        [expense.title, expense.amount, expense.date, expense.freq || null, expense.interval || 1, expense.id]
    );
}


export async function removeExpense(id) {
    const db = await getDB();
    await db.executeSql('DELETE FROM expenses WHERE id=?', [id]);
}


export async function loadExpenses() {
    const db = await getDB();
    const [results] = await db.executeSql('SELECT * FROM expenses');
    return results.rows.raw();
}