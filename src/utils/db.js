import SQLite from 'react-native-sqlite-storage';
import runMigrations from './migrations';

SQLite.enablePromise(true);

export async function getCurrentDBVersion(db) {
    try {
        const result = await db.executeSql(
            'SELECT version FROM db_version ORDER BY version DESC LIMIT 1;'
        );
        return result[0].rows.length > 0 ? result[0].rows.item(0).version : 0;
    } catch (error) {
        console.error('Erro ao obter versão do banco:', error);
        return 0;
    }
}

export async function resetDB() {
    const db = await getDB();
    await db.executeSql('DROP TABLE IF EXISTS db_version;');
    await db.executeSql('DROP TABLE IF EXISTS expenses;');
    // Adicione outras tabelas aqui
    
    // Reinicializar o banco
    return initDB();
}

export async function getDB() {
    return SQLite.openDatabase({ name: 'financas.db', location: 'default' });
}


export async function initDB() {
    const db = await getDB();

    await db.executeSql(`
    CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT (datetime('now'))
    );
    `);

        const result = await db.executeSql('SELECT version FROM db_version ORDER BY version DESC LIMIT 1;');
        const currentVersion = result[0].rows.length > 0 ? result[0].rows.item(0).version : 0;
        await runMigrations(db, currentVersion);

    return db;
}