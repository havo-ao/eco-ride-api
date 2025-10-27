
import dotenv from "dotenv";
import 'dotenv/config';

dotenv.config();

import app from "./app";
import { testConnection } from './core/database/mysql';

const PORT = process.env.PORT || 3000;

(async () => {
	// Intentamos verificar la conexión a la BD al iniciar para detectar fallos temprano.
	await testConnection();

	app.listen(PORT, () => console.log(`🚀 EcoRide API listening on port ${PORT}`));
})();
