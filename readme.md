# Project Title

This project is a structured Node.js application developed with TypeScript, following best practices for scalable, maintainable code. The project leverages reusable components, such as base classes for controllers, services, routes, and validators, to streamline development and encourage clean architecture.

## Project Structure

### `bin/`
Contains the CLI and Plop configuration files for code generation.
- **templates/**: Handlebars templates for generating CRUD files.
    - `controller.hbs`: Template for controllers.
    - `repo.hbs`: Template for repositories.
    - `route.hbs`: Template for routes.
    - `service.hbs`: Template for services.
    - `validator.hbs`: Template for validators.
- `cli.ts` / `cli.js`: CLI script enabling the `npm run create:crud` command.
- `plopfile.js`: Plop configuration file for defining generators.

### `logs/`
Stores application logs for debugging and monitoring.

### `specs/`
Contains test files and specifications.

### `src/`
Main application source code.
- **app/**
    - **db/**
        - **models/**: Contains Mongoose models.
        - **repos/**: Data handling layer that abstracts database operations.
            - `Repo.ts`: Base class for repository operations.
            - `OtherRepo.ts`: Example repository extending the base repo with custom operations.
    - **http/**
        - **controllers/**: Contains application controllers.
            - `Controller.ts`: Base class for CRUD operations, extendable with validators.
        - **routes/**: Route management.
            - `Route.ts`: Base route class with predefined CRUD routes and middleware support.
        - **validators/**: Input validation logic.
            - `Validators.ts`: Base validator class.
        - **middlewares/**: Contain middlewares.
    - **services/**: Business logic layer, containing the core application logic.
        - `Service.ts`: Base class for managing repositories, enabling cleaner controllers.
    - **types/**: Type declarations for the project.
    - **util/**: Utility functions.
    - **views/**: Contains email templates and PDF generation HTML files.

### `pre-start/`
Configuration and environment setup files.

### `index.ts`
Entry point for initializing the server.

### `server.ts`
Application setup, including middleware, database connection, and server configurations.

## Key Features

### 1. Code Generation
Run the command `npm run create:crud` to auto-generate files for CRUD operations, reducing repetitive work.

### 2. Base Classes
- **Controllers**: Abstracted CRUD operations in `Controller.ts`, extendable for custom methods.
- **Services**: Business logic encapsulated in `Service.ts`, isolating controller complexity.
- **Routes**: Manage route registration in `Route.ts` for predefined and custom routes.
- **Validators**: Handle validation rules in `Validators.ts`.

### 3. Proper Logging
Winston logger is configured for structured logging across the application.

## Scripts
- **`build.ts`**: TypeScript build configuration.

## Setup and Installation

1. **Install dependencies**: `npm install`
2. **Run the server**: `npm start` or `ts-node index.ts`
3. **Generate CRUD files**: `npm run create:crud`

## Configuration Files
- `tsconfig.json`: TypeScript configuration for development.
- `tsconfig.prod.json`: TypeScript configuration for production.

## Dependencies
Refer to `package.json` for project dependencies.

## License
This project is licensed under the MIT License. But ensure to check the licenses of the dependencies used in this project.
Also, please provide attribution to the author and project if you use this code.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Authors
- [Radoan Hossain](https://www.linkedin.com/in/revendol/)
- If you have any questions or feedback, feel free to reach out.
- Email: `radoan.cse@gmail.com`
- LinkedIn: [Radoan Hossain](https://www.linkedin.com/in/revendol/)
- I'm open to collaboration and job opportunities.

## Acknowledgements
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)