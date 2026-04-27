# FinControl - Gestor de Finanzas Personales

Aplicación web Full-Stack para la gestión de ingresos y gastos, construida con Node.js, Express, MongoDB, HTML, CSS y Vanilla JavaScript.

## Características
- **CRUD completo** de transacciones (Ingresos y Gastos).
- **Dashboard** con cálculo automático de Balance Total, Ingresos y Gastos.
- **Filtrado en tiempo real** por descripción o categoría sin recargar la página.
- **Diseño Moderno** adaptado de tu plantilla original con modales dinámicos.
- Interfaz reactiva usando `fetch`.

## Requisitos Previos
- [Node.js](https://nodejs.org/) instalado.
- [MongoDB](https://www.mongodb.com/try/download/community) (o MongoDB Compass para gestionar tu base de datos local).

## Instrucciones de Instalación y Ejecución

1. **Abre la terminal** en la carpeta del proyecto (`Finanzas Web`).
2. **Instala las dependencias** (si no lo has hecho aún):
   ```bash
   npm install
   ```
3. **Verifica que MongoDB esté corriendo** en tu computadora local (puedes abrir MongoDB Compass y conectarte a `mongodb://localhost:27017`).
4. **Inicia el servidor backend**:
   ```bash
   npm start
   ```
5. **Abre la aplicación** en tu navegador web yendo a la siguiente dirección:
   ```
   http://localhost:3000
   ```

## Estructura del Proyecto
- `/backend`: Lógica del servidor (Express), Modelos de Base de Datos (Mongoose) y Rutas de la API REST.
- `/public`: Frontend de la aplicación (HTML, CSS y el script `app.js`).
- `.env`: Variables de entorno (Puerto y URI de MongoDB).
- `package.json`: Dependencias y scripts de ejecución.
