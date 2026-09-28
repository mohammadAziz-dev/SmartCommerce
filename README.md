# SmartCommerce

SmartCommerce is a full-stack capstone project demonstrating modern software development with Spring Boot, PostgreSQL,
Angular, React, testing, CI/CD, Docker, and deployment.

## Repository Structure

- `backend/` — Spring Boot backend
- `frontend/angular-app/` — Angular frontend
- `frontend/react-app/` — React frontend
- `docs/` — Project and architecture documentation

## Deployment

SmartCommerce is deployed using Render and Neon PostgreSQL.

- Customer Shop (React): https://smartcommerce-shop.onrender.com
- Admin Dashboard (Angular): https://smartcommerce-admin-c1k4.onrender.com
- Backend API (Spring Boot): https://smartcommerce-v233.onrender.com
- Database: Neon PostgreSQL

### Production Environment

- The backend connects to Neon PostgreSQL using environment variables configured in Render.
- Production secrets are not committed to the repository.
- The React shop uses `VITE_API_BASE_URL` and `VITE_BUSINESS_ID` for deployment-specific configuration.
- The Angular Admin uses Angular environment configuration for the production API URL.
- Deployments are triggered automatically from the `main` branch.

> **Note:** Free hosting services may enter an idle state. The first request after inactivity can therefore take longer
> to respond.

## Local PostgreSQL

SmartCommerce uses PostgreSQL for local development.

### Prerequisite

Set the `POSTGRES_PASSWORD` environment variable on your local machine.

### Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres
```

## Code Quality

SmartCommerce uses SonarQube Cloud for automated backend code quality analysis.

The backend CI pipeline runs automatically on pull requests targeting `main` and on pushes to `main`. It:

- builds the Spring Boot backend with Maven
- runs the backend tests
- generates JaCoCo test coverage
- runs SonarQube Cloud analysis
- reports the Quality Gate result on GitHub pull requests

The Sonar authentication token is stored securely as the `SONAR_TOKEN` GitHub Actions secret and is not committed to the
repository.