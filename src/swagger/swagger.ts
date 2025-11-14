import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    components: {
  securitySchemes: { //define el tipo de autenticación.
//Swagger ahora sabe que los endpoints protegidos usan un token JWT.
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
},
security: [{ bearerAuth: [] }], //aplica ese esquema por defecto a todos los endpoints.

    openapi: "3.0.0",
    info: {
      title: "EcoRide API",
      version: "1.0.0",
      description: "Documentación de la API de EcoRide (usuarios, estaciones, reservas, viajes, comentarios).",
    },
    tags: [
  { name: "Auth", description: "Endpoints de autenticación y login" },
  { name: "Usuarios", description: "Registro y activación de usuarios" },
  { name: "Stations", description: "Gestión y consulta de estaciones" },
  { name: "Reservations", description: "Creación, consulta y cancelación de reservas" },
  { name: "Rides", description: "Operaciones relacionadas con los viajes" },
  { name: "Comments", description: "Comentarios de usuarios" },
],

    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./src/modules/**/*.ts"],  //le dice a Swagger dónde buscar los comentarios @swagger
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Función para configurar Swagger en la app de Express.
 */
export const swaggerDocs = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger Docs disponibles en http://localhost:3000/api-docs");
};
