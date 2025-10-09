# BoilerPlates.Express_Postgres

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![Postgres](https://img.shields.io/badge/Postgres-17-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow)

A boilerplate setup for running an **Express.js** backend with **PostgreSQL** using Docker Compose.
This repository provides a ready-to-use Express API connected to a PostgreSQL database for rapid backend development.

---

## 🚀 Features

- Express.js REST API
- PostgreSQL database in a Docker container
- pgAdmin 4 for database administration
- Environment-based configuration
- Dockerized for easy setup and deployment

---

## 📂 Project Structure

```
BoilerPlates.Express_Postgres/
└───src/
   ├───server.js
   ├───middlewares/
   │   ├───authorizer.js
   │   ├───error.js
   │   └───index.js
   ├───modules/
   │   ├───controllers.js
   │   ├───entities.js
   │   ├───helpers.js
   │   ├───routers.js
   │   ├───services.js
   │   ├───**/
   │   │   ├───**.controller.js
   │   │   ├───**.entity.js
   │   │   ├───**.helper.js
   │   │   ├───**.router.js
   │   │   └───**.service.js
   ├───routes/
   │   └───index.js
   └───utils/
      ├───database/
      │   └───index.js
      ├───error/
      │   └───index.js
      └───seed/
         └───**.seed.js
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/ThisIsTheWizard/BoilerPlates.Express_Postgres.git
cd BoilerPlates.Express_Postgres
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Rename the `.env.sample` file into .env and customize as per need:

### 4. Start services

```bash
docker-compose up -d -build
```

---

## 🌐 Access

- **Express API** → `http://localhost:8000`
- **PostgreSQL** → `localhost:5432`
- **pgAdmin** → [http://localhost:8080](http://localhost:8080)
  - Login with credentials from `.env`

---

## 🛠️ Commands

- Start containers:

  ```bash
  docker-compose up -d -build
  ```

- Stop containers:

  ```bash
  docker-compose down
  ```

- View logs:

  ```bash
  docker-compose logs -f
  ```

- Run Express server locally:

  ```bash
  npm run dev
  ```

---

## 📦 Volumes

Data is persisted via Docker volumes:

- `node_server_data` → Stores Node server files for hot reload in dev mode
- `postgres_admin_data` → Stores pgAdmin configuration
- `postgres_data` → Stores PostgreSQL database files

---

## 📝 License

This boilerplate is provided under the MIT License.
Feel free to use and modify it for your projects.

---

👋 Created by [Elias Shekh](https://sheikhthewizard.world)
If you find this useful, ⭐ the repo or reach out!
