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
```

## Code Quality

SmartCommerce uses SonarQube Cloud for automated backend code quality analysis.

The backend CI pipeline runs automatically on pull requests targeting `main` and on pushes to `main`. It:

- builds the Spring Boot backend with Maven
- runs the backend tests
- generates JaCoCo test coverage
- runs SonarQube Cloud analysis
- reports the Quality Gate result on GitHub pull requests

The Sonar authentication token is stored securely as the `SONAR_TOKEN` GitHub Actions secret and is not committed to the repository.