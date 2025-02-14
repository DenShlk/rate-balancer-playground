# Rate Balancer Project Structure

## Overview
This document outlines the structure of the Rate Balancer project, a React-based application for visualizing and testing different rate-limiting algorithms.

## Project Organization

```

├── src/                      # Source code directory
│   ├── algorithms/           # Rate-limiting algorithm implementations
│   ├── assets/              # Static assets
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions and classes
│   ├── App.tsx              # Main application component
│   ├── App.css              # Main application styles
│   ├── index.css            # Global styles
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type declarations
│
├── public/                   # Public assets directory
├── node_modules/            # Dependencies
├── development-plan.md      # Project development roadmap
├── package.json             # Project dependencies and scripts
├── bun.lock                 # Dependency lock file
├── tsconfig.json            # TypeScript base configuration
├── tsconfig.app.json        # App-specific TypeScript configuration
├── tsconfig.node.json       # Node-specific TypeScript configuration
├── vite.config.ts           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── index.html               # HTML entry point
```

## Key Directories

### `/src`
The main source code directory containing all application code:

- **algorithms/**: Contains different rate-limiting algorithm implementations
- **components/**: React components for UI elements like graphs and control panels
- **hooks/**: Custom React hooks for managing simulation state and logic
- **types/**: TypeScript type definitions and interfaces
- **utils/**: Utility functions and classes, including the server simulator
- **assets/**: Static assets like images and icons

### Configuration Files
- **package.json**: Project metadata and dependencies
- **tsconfig*.json**: TypeScript configuration files
- **vite.config.ts**: Vite bundler configuration
- **eslint.config.js**: Code linting rules

## Technology Stack

- **Framework**: React with TypeScript
- **Bundler**: Vite
- **Package Manager**: Bun
- **Type System**: TypeScript
- **Linting**: ESLint

## Development Workflow

The project follows a modular architecture where:
1. Algorithm implementations are separated from visualization logic
2. Components are organized by feature and responsibility
3. Shared utilities and types are centralized
4. Configuration files are in the root directory for easy access

This structure supports the development plan outlined in `development-plan.md`, providing clear separation of concerns and maintainable code organization. 