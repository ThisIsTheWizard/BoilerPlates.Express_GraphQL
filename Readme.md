# BoilerPlates.Express_GraphQL

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![GraphQL](https://img.shields.io/badge/GraphQL-Apollo_Server_v4-e10098?logo=graphql)
![Postgres](https://img.shields.io/badge/Postgres-17-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow)

A boilerplate setup for running an **Express.js** backend with **GraphQL** and **PostgreSQL** using Docker Compose.
This repository provides a ready-to-use GraphQL API with Apollo Server v4 connected to a PostgreSQL database for rapid backend development.

---

## 🚀 Features

- Express.js GraphQL API with Apollo Server v4
- Modular GraphQL schema with type extensions
- Role-based authentication with @auth directive
- PostgreSQL database in a Docker container
- pgAdmin 4 for database administration
- Environment-based configuration
- Dockerized for easy setup and deployment

---

## 📂 Project Structure

```
BoilerPlates.Express_GraphQL/
└───src/
   ├───server.js
   ├───graphql/
   │   ├───schema.js
   │   ├───context.js
   │   ├───typeDefs/
   │   │   ├───auth.graphql
   │   │   ├───user.graphql
   │   │   ├───role.graphql
   │   │   ├───permission.graphql
   │   │   ├───role-user.graphql
   │   │   └───role-permission.graphql
   │   ├───resolvers/
   │   │   ├───index.js
   │   │   ├───auth.mutation.js
   │   │   ├───user.query.js
   │   │   ├───user.mutation.js
   │   │   ├───role.query.js
   │   │   ├───role.mutation.js
   │   │   ├───permission.query.js
   │   │   ├───permission.mutation.js
   │   │   ├───role-user.query.js
   │   │   ├───role-user.mutation.js
   │   │   ├───role-permission.query.js
   │   │   └───role-permission.mutation.js
   │   └───directives/
   │       └───auth.js
   ├───middlewares/
   │   ├───authorizer.js
   │   ├───error.js
   │   └───index.js
   ├───modules/
   │   ├───entities.js
   │   ├───helpers.js
   │   ├───services.js
   │   ├───**/
   │   │   ├───**.entity.js
   │   │   ├───**.helper.js
   │   │   └───**.service.js
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
git clone https://github.com/ThisIsTheWizard/BoilerPlates.Express_GraphQL.git
cd BoilerPlates.Express_GraphQL
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

- **GraphQL Playground** → `http://localhost:8000/graphql`
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

- Run Express GraphQL server locally:

  ```bash
  npm run dev
  ```

## 🔍 GraphQL Examples

### Authentication

```graphql
# Register a new user
mutation {
  register(input: { email: "user@example.com", password: "Password123!", first_name: "John", last_name: "Doe" }) {
    id
    email
    status
  }
}

# Login
mutation {
  login(input: { email: "user@example.com", password: "Password123!" }) {
    access_token
    refresh_token
  }
}
```

### Queries (with Authentication)

```graphql
# Get current user
query {
  me {
    id
    email
    first_name
    last_name
  }
}

# Get all roles
query {
  roles {
    id
    name
    description
  }
}
```

### Headers for Authenticated Requests

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
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
