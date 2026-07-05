# Secure E-Voting Platform

A full-stack, multi-tier e-voting application designed to demonstrate secure architecture, modular service design, and modern web application development practices. The system combines a Spring Boot backend, a React frontend, and an independent authentication simulator to provide a realistic and production-oriented project structure.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Security Notes](#security-notes)
- [Contributing](#contributing)

## Overview

This repository showcases a secure and extensible e-voting platform that separates concerns across three main components:

- a core backend for business logic and voting operations,
- a React-based frontend for user interaction,
- and an authentication simulator service for secure verification workflows.

The project is built with an emphasis on:

- secure authentication and authorization,
- environment-driven configuration,
- decoupled service responsibilities,
- and maintainable code structure for real-world deployment scenarios.

## Key Features

- Secure authentication flow using JWT-based patterns
- Role-aware admin and user interactions
- Externalized configuration for secrets, URLs, and environment-specific values
- Decoupled frontend, backend, and simulator services
- Clean architecture suitable for demos, interviews, and further extension
- Tamper-aware ballot integrity handling through configurable signing mechanisms

## Architecture

The solution follows a modular multi-tier architecture with clear boundaries between presentation, application logic, and supporting services.

```text
User / Admin Browser
        |
        v
React Frontend (evoting_frontend)
        |
        v
Core Backend API (evoting)
        |
        +--> MySQL Database
        |
        +--> Authentication Simulator (voterauthenticatorsimulator)
```

## Technology Stack

### Backend
- Java 21+
- Spring Boot
- Spring Security
- Spring Data JPA
- MySQL
- RESTful API design

### Frontend
- React.js
- Vite
- Axios
- Responsive UI with modern CSS styling

### Simulator Service
- Spring Boot
- Independent authentication and OTP simulation flow
- Secure service-to-service token exchange

## Project Structure

```text
secure-evoting-platform/
├── evoting/
│   ├── src/
│   │   ├── main/java
│   │   ├── main/resources
│   │   └── test/java
│   ├── pom.xml
│   └── mvnw
├── evoting_frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── voterauthenticatorsimulator/
    └── voterauthenticatorsimulator/
        ├── src
        ├── pom.xml
        └── mvnw
```

## Prerequisites

Before running the project locally, ensure the following are installed:

- Java 21 or later
- Maven 3.9+
- Node.js 18+
- npm 9+
- MySQL 8+

## Configuration

The application is designed to use environment variables for sensitive and environment-specific configuration.

### Backend Environment Variables

Use values such as the following before starting the backend:

- `SERVER_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET_KEY`
- `SIMULATOR_URL`
- `SIMULATOR_JWT_SECRET`
- `BALLOT_SIGNING_SECRET`

### Frontend Environment Variables

For the frontend, configure the API base URL using a Vite-compatible environment variable such as:

- `VITE_API_BASE_URL`

> Use strong, randomly generated secrets in production and never commit real credentials to source control.

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Fullstack_secure_evoting_application_gitpublicversion
```

### 2. Start the Backend

```bash
cd evoting
./mvnw spring-boot:run -DskipTests
```

### 3. Start the Authentication Simulator

```bash
cd ../voterauthenticatorsimulator/voterauthenticatorsimulator
./mvnw spring-boot:run -DskipTests
```

### 4. Start the Frontend

```bash
cd ../../evoting_frontend
npm install
npm run dev
```

## Testing

Run backend tests with:

```bash
cd evoting
./mvnw test
```

Run frontend validation with:

```bash
cd evoting_frontend
npm run build
```

## Security Notes

- Keep all secrets in environment variables or a secure secret manager.
- Rotate signing keys and credentials regularly.
- Restrict admin access and review authentication flows before production deployment.
- Validate all deployment settings before exposing the application publicly.

## Contributing

Contributions are welcome. If you would like to improve the project, please open an issue or submit a pull request with a clear description of the change.

## License

This repository currently does not include a formal license file. If you plan to reuse or distribute the project, add an appropriate open-source license before publication.

