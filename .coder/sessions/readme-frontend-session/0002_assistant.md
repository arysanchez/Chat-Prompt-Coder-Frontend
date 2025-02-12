### frontend/README.md [coder:save]
```
# Vite React TypeScript Starter

This is a starter project for building a React application using Vite and TypeScript. It includes essential configurations and dependencies to get you up and running quickly.

## Table of Contents

- [Getting Started](#getting-started)
- [Setup and Configuration](#setup-and-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Backend Integration](#backend-integration)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher) or [Yarn](https://yarnpkg.com/)

### Setup and Configuration

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/vite-react-typescript-starter.git
   cd vite-react-typescript-starter/frontend
   ```

2. **Install dependencies:**

   Using npm:
   ```sh
   npm install
   ```

   Using Yarn:
   ```sh
   yarn install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root of the `frontend` directory and add any necessary environment variables. For example:
   ```sh
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

4. **Run the development server:**

   Using npm:
   ```sh
   npm run dev
   ```

   Using Yarn:
   ```sh
   yarn dev
   ```

   The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

- `npm run dev` or `yarn dev`: Starts the development server.
- `npm run build` or `yarn build`: Builds the app for production.
- `npm run lint` or `yarn lint`: Runs ESLint to check for linting errors.
- `npm run preview` or `yarn preview`: Previews the production build locally.

## Project Structure

```
frontend/
├── .bolt/
│   ├── config.json
│   └── prompt
├── src/
│   ├── api/
│   │   └── endpoints.ts
│   ├── components/
│   │   ├── ChatArea.tsx
│   │   └── Sidebar.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Backend Integration

This frontend project interacts with a backend service for various functionalities. The backend repository can be found at: [flow-coder-service](https://github.com/CI-T-HyperX/flow-coder-service).

The routes used in `src/api/endpoints.ts` are defined in the backend service. Make sure to set up and run the backend service to ensure full functionality of the application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
[coder:end]