# SmartCommerce

SmartCommerce is a full-stack capstone project demonstrating modern software development with Spring Boot, PostgreSQL, Angular, React, testing, CI/CD, Docker, and deployment.

## Repository Structure

- `backend/` — Spring Boot backend
- `frontend/angular-app/` — Angular frontend
- `frontend/react-app/` — React frontend
- `docs/` — Project and architecture documentation

## Local PostgreSQL

SmartCommerce uses PostgreSQL for local development.

### Prerequisite

Set the `POSTGRES_PASSWORD` environment variable on your local machine.

### Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres