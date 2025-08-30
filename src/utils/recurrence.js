import dayjs from 'dayjs';


export function generateOccurrences(expense, untilDateStr) {
    if (!expense.freq) return [{ ...expense, date: expense.date }];

    console.log('generateOccurrences', expense, untilDateStr);

    const until = dayjs(untilDateStr);
    let cur = dayjs(expense.date);
    const out = [];
    while (cur.isBefore(until) || cur.isSame(until)) {
        out.push({ ...expense, date: cur.format('YYYY-MM-DD') });
        switch (expense.freq) {
            case 'diario':
                cur = cur.add(expense.interval || 1, 'day');
                break;
            case 'semanal':
                cur = cur.add(expense.interval || 1, 'week');
                break;
            case 'mensal':
            default:
                cur = cur.add(expense.interval || 1, 'month');
        }
    }
    return out;
}