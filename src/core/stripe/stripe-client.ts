// Importa la clase Stripe desde el paquete 'stripe'
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config(); // Inicializa dotenv para que process.env contenga las variables del .env

// Verifica que la clave secreta de Stripe esté definida en las variables de entorno
if (!process.env.STRIPE_API_KEY) {
    // Si no está definida, se lanza un error para evitar inicializar el cliente sin credenciales
    throw new Error('STRIPE_API_KEY no está definida en las variables de entorno');
}

// Usa una versión de API por defecto si no se especifica (evita cadenas extrañas)
const apiVersion = process.env.STRIPE_API_VERSION || '2023-11-15';

// Crea y exporta una instancia del cliente de Stripe usando la clave secreta.
export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
    // stripe types expect a literal union; for flexibility cast to any to accept runtime value.
    apiVersion: apiVersion as any,
});