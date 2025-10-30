import 'tsconfig-paths/register';
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 EcoRide API listening on port ${PORT}`));
