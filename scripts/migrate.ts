import { db } from '../src/core/database/mysql';
import fs from 'node:fs';
import path from 'node:path';

async function runMigrations() {
  console.log('🚀 Iniciando migraciones...');
  const migrationDir = path.join(__dirname, '../sql/migrations');
  const files = fs.readdirSync(migrationDir).sort();

  for (const file of files) {
    const filePath = path.join(migrationDir, file);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    console.log(`📄 Ejecutando migración: ${file}`);
    
    try {
      await db.query(sqlContent);
      console.log(`✅ Migración completada: ${file}`);
    } catch (err: any) {
      console.error(`❌ Error en migración ${file}: ${err.message}`);
    }
  }

  console.log('🎯 Todas las migraciones procesadas.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('❌ Error general en migraciones:', err);
  process.exit(1);
});