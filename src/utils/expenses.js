import { getDB } from './db';


export async function addExpense(expense) {
    const db = await getDB();
    await db.executeSql(
        'INSERT INTO expenses (id,title,amount,date,freq,interval,type) VALUES (?,?,?,?,?,?,?)',
        [expense.id, expense.title, expense.amount, expense.date, expense.freq || null, expense.interval || 1, expense.type]
    );
}


export async function updateExpense(expense) {
    const db = await getDB();
    console.log("updateExpense", expense);
    await db.executeSql(
        'UPDATE expenses SET title=?, amount=?, date=?, freq=?, interval=?, type=? WHERE id=?',
        [expense.title, expense.amount, expense.date, expense.freq || null, expense.interval || 1, expense.type, expense.id]
    );
}


export async function removeExpense(id) {
    const db = await getDB();
    await db.executeSql('DELETE FROM expenses WHERE id=?', [id]);
}


export async function loadExpenses(options = {}) {
    const db = await getDB();
    const { search, from, to, limit = 20, offset = 0 } = options;

    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND title LIKE ?';
        params.push(`%${search}%`);
    }

    if (from) {
        query += ' AND date >= ?';
        params.push(from.toISOString().slice(0, 10));
    }

    if (to) {
        query += ' AND date <= ?';
        params.push(to.toISOString().slice(0, 10));
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [results] = await db.executeSql(query, params);
    return results.rows.raw();
}

export async function getMonthlyTotals(months = 6) {
    const db = await getDB();
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const startStr = startMonth.toISOString().slice(0, 10);

    const query = `
    SELECT 
      strftime('%Y-%m', date) AS year_month,
      SUM(CASE WHEN type='renda' THEN amount ELSE -amount END) AS total
    FROM expenses
    WHERE date >= ?
    GROUP BY year_month
    ORDER BY year_month ASC
  `;

    const [results] = await db.executeSql(query, [startStr]);
    return results.rows.raw();
}