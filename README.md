# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

const readmeContent = `
# Vite React TypeScript Setup with ESLint

This guide will walk you through the process of setting up ESLint for a Vite React TypeScript application.

## Steps:

### 1. Install Dependencies

Start by installing the project dependencies:

```bash
npm i
```

### 2. Install ESLint as a Development Dependency

Install ESLint by running the following command:

```bash
npm i -D eslint
```

### 3. Initialize ESLint Configuration

Now, initialize the ESLint configuration using:

```bash
npm init @eslint/config
```

During the setup process, you will be prompted with a series of questions. Below are the recommended answers:

- **How would you like to use ESLint?**
  - Select: `To check syntax, find problems, and enforce code style`.

- **What type of modules does your project use?**
  - Select: `JavaScript modules (import/export)`.

- **Which framework does your project use?**
  - Select: `React`.

- **Does your project use TypeScript?**
  - Select: `Yes`.

- **Where does your code run?**
  - Select: `Browser`.

- **What format do you want your config file to be in?**
  - Select: `JavaScript`.

- **Which style guide do you want to follow?**
  - Select: `Airbnb` (or another style guide of your choice).

- **What type of settings do you prefer?**
  - Select: `Manual configuration`.

- **Do you use React?**
  - Select: `Yes`.

- **Do you want to enforce TypeScript strict props?**
  - Select: `Yes`.

- **Which line endings do you prefer?**
  - Select: `Unix (LF)`.

- **Do you want to use semicolons?**
  - Select: `Yes`.

### 4. Modify `tsconfig.json`

You may need to add `"types": ["node"]` in your `tsconfig.json` file to ensure Node types are available in your TypeScript setup. Add the following to your `compilerOptions`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### 5. Install Node Typings (if necessary)

If you get an error about missing Node typings, run the following command to install them:

```bash
npm i @types/node -D
```

## Conclusion

You’ve successfully set up ESLint in your Vite React TypeScript project! Your code is now ready for linting with the rules and configurations you’ve chosen. You can now run ESLint to check your code:

```bash
npx eslint .
```

This will lint your project files and display any warnings or errors based on your configuration.
`;


## Styling

 * Component-Based SCSS vs. Traditional SCSS
 
  1. **Component-Based SCSS (SCSS Modules):**
     - Scope: Styles are scoped locally to the component, preventing CSS conflicts.
     - Usage: Imported as a module in a component and accessed via unique class names.
     - Example:
       ```tsx
       // PageNotFound.module.scss
       .container {
           background: red;
       }
       
       // PageNotFound.tsx
       import styles from './PageNotFound.module.scss';
       <div className={styles.container}>Not Found</div>
       ```
     - Benefit: Avoids global namespace pollution and enforces modular design.
 
  2. **Traditional SCSS:**
     - Scope: Styles are applied globally, which can lead to naming conflicts.
     - Usage: Imported globally or per file without the need for mapping classes.
     - Example:
       ```scss
       // styles.scss
       .container {
           background: blue;
       }
       ```
       ```tsx
       // App.tsx
       import './styles.scss';
       <div className="container">Hello</div>
       ```
     - Benefit: Simpler for global styles or projects with less strict modularity.
 ---
  **Key Difference:** 

  SCSS modules prioritize encapsulation and maintainability by scoping styles locally, 
  while traditional SCSS allows global styles that are easier to use but prone to conflicts.
 
