# Worko (React + TypeScript + Vite)

This project provides a minimal setup to build a React application using TypeScript and Vite, along with SCSS for styling and essential development tools.

---

## Get Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd worko
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` by default.

---

## Common Issues and Fixes

### Missing Node Typings

If you encounter errors related to Node typings, run:

```bash
npm install @types/node -D
```

---

## ESLint Configuration

For type-aware linting, ensure the following configuration in your ESLint setup:

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

---

## Styling Options

### Component-Based SCSS (Recommended)

Encapsulates styles locally to prevent conflicts.

#### Example:

**SCSS Module (PageNotFound.module.scss):**

```scss
.container {
  background: red;
}
```

**Component (PageNotFound.tsx):**

```tsx
import styles from './PageNotFound.module.scss';

export default function PageNotFound() {
  return <div className={styles.container}>Not Found</div>;
}
```

### Traditional SCSS (Global)

Useful for global styles but prone to conflicts.

#### Example:

**SCSS File (styles.scss):**

```scss
.container {
  background: blue;
}
```

**Component (App.tsx):**

```tsx
import './styles.scss';

export default function App() {
  return <div className="container">Hello</div>;
}
```

---

## Project Dependencies

### Key Libraries:

- **React**: Core library for building UI.
- **React Router DOM**: For routing.
- **React Toastify**: Notifications.
- **Lucide React**: Icon library.
- **SCSS**: For styling.
- **AWS SDK**: Integrations with AWS services.
- **Crypto-JS**: Encryption and hashing utilities.
- **JWT Decode**: For decoding JSON Web Tokens.

### Install Additional Libraries (if needed):

```bash
npm install <library-name>
```

---

## Scripts

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

---

## Folder Structure

```
worko/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page-level components
│   ├── styles/            # Global SCSS styles
│   └── App.tsx            # Main application component
├── public/                # Static assets
├── .eslintrc.js           # ESLint configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## Contribution Guidelines

### Git Commit Message Conventions

- **feat**: Adding a new feature
- **fix**: Fixing a bug
- **docs**: Documentation changes
- **style**: Code formatting (e.g., indentation, missing semi-colons)
- **refactor**: Code changes that neither fix a bug nor add a feature
- **test**: Adding or updating tests
- **chore**: Changes to the build process or auxiliary tools/libraries

### File and Naming Conventions

- **SCSS Modules**: Should match the component name, in lowercase without spaces, ending with `.module.scss`.
  - Example: `xyzcomp.module.scss` for `XyzComp.tsx`
- **TypeScript Files**: Use PascalCase for components and utilities.
  - Example: `Tutils.ts` for utilities.
- **Context Files**: Use the `use` prefix followed by PascalCase.
  - Example: `useXYZ.tsx`
- **Interfaces**: Use PascalCase and end with `.dto.ts`.
  - Example: `Xyz.dto.ts`

### Workflow

1. Create a new branch for your feature:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Commit your changes with a meaningful message:

   ```bash
   git commit -m "feat: Add user authentication"
   ```

3. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request for review.

---

For questions or issues, feel free to reach out to the project maintainers.

=======
# Worko (React + TypeScript + Vite)

This project provides a minimal setup to build a React application using TypeScript and Vite, along with SCSS for styling and essential development tools.

---

## Get Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd worko
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` by default.

---

## Common Issues and Fixes

### Missing Node Typings

If you encounter errors related to Node typings, run:

```bash
npm install @types/node -D
```

---

## ESLint Configuration

For type-aware linting, ensure the following configuration in your ESLint setup:

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

---

## Styling Options

### Component-Based SCSS (Recommended)

Encapsulates styles locally to prevent conflicts.

#### Example:

**SCSS Module (PageNotFound.module.scss):**

```scss
.container {
  background: red;
}
```

**Component (PageNotFound.tsx):**

```tsx
import styles from './PageNotFound.module.scss';

export default function PageNotFound() {
  return <div className={styles.container}>Not Found</div>;
}
```

### Traditional SCSS (Global)

Useful for global styles but prone to conflicts.

#### Example:

**SCSS File (styles.scss):**

```scss
.container {
  background: blue;
}
```

**Component (App.tsx):**

```tsx
import './styles.scss';

export default function App() {
  return <div className="container">Hello</div>;
}
```

---

## Project Dependencies

### Key Libraries:

- **React**: Core library for building UI.
- **React Router DOM**: For routing.
- **React Toastify**: Notifications.
- **Lucide React**: Icon library.
- **SCSS**: For styling.
- **AWS SDK**: Integrations with AWS services.
- **Crypto-JS**: Encryption and hashing utilities.
- **JWT Decode**: For decoding JSON Web Tokens.

### Install Additional Libraries (if needed):

```bash
npm install <library-name>
```

---

## Scripts

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

---

## Folder Structure

```
worko/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page-level components
│   ├── styles/            # Global SCSS styles
│   └── App.tsx            # Main application component
├── public/                # Static assets
├── .eslintrc.js           # ESLint configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## Contribution Guidelines

### Git Commit Message Conventions

- **feat**: Adding a new feature
- **fix**: Fixing a bug
- **docs**: Documentation changes
- **style**: Code formatting (e.g., indentation, missing semi-colons)
- **refactor**: Code changes that neither fix a bug nor add a feature
- **test**: Adding or updating tests
- **chore**: Changes to the build process or auxiliary tools/libraries

### File and Naming Conventions

- **SCSS Modules**: Should match the component name, in lowercase without spaces, ending with `.module.scss`.
  - Example: `xyzcomp.module.scss` for `XyzComp.tsx`
- **TypeScript Files**: Use PascalCase for components and utilities.
  - Example: `Tutils.ts` for utilities.
- **Context Files**: Use the `use` prefix followed by PascalCase.
  - Example: `useXYZ.tsx`
- **Interfaces**: Use PascalCase and end with `.dto.ts`.
  - Example: `Xyz.dto.ts`

### Workflow

1. Create a new branch for your feature:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Commit your changes with a meaningful message:

   ```bash
   git commit -m "feat: Add user authentication"
   ```

3. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request for review.

---

For questions or issues, feel free to reach out to the project maintainers.
