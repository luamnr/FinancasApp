
const migrations = [
    {
        version: 1,
        up: async (db) => {
            await db.executeSql(`
                CREATE TABLE IF NOT EXISTS expenses (
                    id TEXT PRIMARY KEY NOT NULL,
                    title TEXT,
                    amount REAL,
                    date TEXT,
                    freq TEXT,
                    interval INTEGER
                );
            `);
        },
        down: async (db) => {
            await db.executeSql('DROP TABLE IF EXISTS expenses;');
        }
    },
    // {
    //     version: 2,
    //     up: async (db) => {

    //         await db.executeSql('ALTER TABLE expenses ADD COLUMN category TEXT;');
    //     },
    //     down: async (db) => {


    //     }
    // }

];

export default async function runMigrations(db, currentVersion) {
    try {
        
        const sortedMigrations = migrations.sort((a, b) => a.version - b.version);
        
        for (const migration of sortedMigrations) {
            if (migration.version > currentVersion) {
                console.log(`Executando migração para versão ${migration.version}`);
                
                await db.executeSql('BEGIN TRANSACTION;');
                
                try {

                    await migration.up(db);
                    
                    await db.executeSql(
                        'INSERT OR REPLACE INTO db_version (version) VALUES (?);',
                        [migration.version]
                    );
                    
                    await db.executeSql('COMMIT;');
                    
                    console.log(`Migração para versão ${migration.version} concluída com sucesso`);
                } catch (error) {
                    await db.executeSql('ROLLBACK;');
                    console.error(`Erro na migração ${migration.version}:`, error);
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error('Erro durante as migrações:', error);
        throw error;
    }
}

