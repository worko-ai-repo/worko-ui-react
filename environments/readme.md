# Environment Configuration for Vite React TypeScript Application

This project uses environment-specific configurations to manage variables such as API URLs, authentication details, and other application settings. The environment files are stored in the `./environments` directory, and all environment variables are prefixed with `APP_` for consistency.

## Directory Structure
The environment files are located in the `./environments` folder:

```
./environments
|-- .env (Fallback)
|-- .env.development
|-- .env.production
```

## Environment Variable Conventions
- **Prefix**: All environment variables start with `APP_` (e.g., `APP_API_URL`).
- **File Usage**:
  - `.env`: Default environment settings. (Fallback)
  - `.env.development`: Overrides for the development environment.
  - `.env.production`: Overrides for the production environment.

## Adding New Variables
1. Open the appropriate `.env` file in the `./environments` folder.
2. Add the new variable with the `APP_` prefix. For example:
   ```env
   APP_NEW_FEATURE_ENABLED=true
   APP_ANALYTICS_API=https://analytics.api.com
   ```
   ---
   `HTML`
   
   ```html
   <pre>%APP_NAME%</pre>
   ```
3. Access the variable in your application code using `import.meta.env`:
   ```ts
   const isFeatureEnabled = import.meta.env.APP_NEW_FEATURE_ENABLED === 'true';
   const analyticsApi = import.meta.env.APP_ANALYTICS_API;
   ```

## Accessing Variables in Code
To access environment variables in the application, use `import.meta.env`. For example:
```tsx
const apiUrl = import.meta.env.APP_API_URL;
console.log(`API URL: ${apiUrl}`);
```

## Switching Between Modes
To build or preview the application in different modes, specify the mode using Vite CLI commands:

### Development Mode
Run the application in development mode using:
```bash
npm run dev --mode development
```

### Production Mode
Build the application for production using:
```bash
npm run build --mode production
```

Preview the production build:
```bash
npm run preview
```

## TypeScript Support for Environment Variables
To enable TypeScript support and autocompletion for environment variables:
1. Create a `vite-env.d.ts` file in the `src` folder:
   ```ts
   /// <reference types="vite/client" />

   interface ImportMetaEnv {
     readonly APP_API_URL: string;
     readonly APP_ANALYTICS_API?: string;
     readonly APP_NEW_FEATURE_ENABLED?: string;
     // Add more variables as needed
   }

   interface ImportMeta {
     readonly env: ImportMetaEnv;
   }
   ```

2. Define new environment variables in this file to ensure type safety and autocompletion in your code.

## Best Practices
- **Do not commit sensitive information**: Add `./environments/.env*` to your `.gitignore` file to avoid exposing secrets.
- **Use default values**: Provide fallback values in code when accessing environment variables to handle missing configurations gracefully.

## Example Environment File
**`.env.development`**:
```env
APP_API_URL=https://api.dev.example.com
APP_COGNITO_USER_POOL_ID=ap-south-1xxGrexxKkNc
APP_COGNITO_CLIENT_ID=16sh5sxxxxxxxxxxfdm8gtp0e4
APP_NEW_FEATURE_ENABLED=true
```

**`.env.production`**:
```env
APP_API_URL=https://api.example.com
APP_COGNITO_USER_POOL_ID=ap-south-1_1f9O34ojY
APP_COGNITO_CLIENT_ID=7ul99pqf5uflpl2ckvukklc6c3
APP_NEW_FEATURE_ENABLED=false
```

## Overriding ENV using terminal
    >> APP_NAME=XYZ npm run dev