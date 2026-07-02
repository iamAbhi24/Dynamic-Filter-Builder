# Dynamic Filter System

A reusable React + TypeScript employee directory demo with:

- dynamic filter rows
- field-aware operator selection
- text, number, date, boolean, and array filtering
- localStorage persistence
- CSV export

## Prerequisites

- Node.js 18+ recommended
- npm 9+

## Install dependencies

```bash
npm install
```

## Run the app locally

This project uses a local mock API for employee data.

1. Start the mock API server:

```bash
node mock-server.cjs
```

2. In a second terminal, start the Vite app:

```bash
npm run dev
```

3. Open the local URL shown by Vite (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

## Notes

- The app fetches employee data from the mock API at /api/employees.
- Filter state is persisted in the browser via localStorage.
- The current filtered rows can be exported as CSV from the UI.
