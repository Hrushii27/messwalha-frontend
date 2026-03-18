<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# MessWalha Production Backend

Production-ready Node.js/Express backend for the MessWalha platform.

## Features
- **User Authentication**: Secure JWT-based auth with bcrypt password hashing.
- **Subscription System**: 
  - Automatic 60-day free trial on registration.
  - Subscription management (Active/Trial/Expired).
  - Automated daily trial expiry check and listing deactivation.
- **Razorpay Integration**: End-to-evid payment flow and webhook handling.
- **Admin Metrics**: API for business stats (MRR, User segments).
- **Listing Management**: CRUD operations for owner mess listings.
- **Heroku Ready**: Configured for Heroku Postgres and GitHub deployment.

## Tech Stack
- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **PostgreSQL**: Primary database.
- **node-cron**: Background job scheduling.
- **jsonwebtoken**: Authentication.

## Setup
1. Clone the repository.
2. Navigate to `messwalha-backend`.
3. Install dependencies: `npm install`.
4. Create `.env` from `.env.example`.
5. Start development: `npm run dev`.

## Heroku Deployment
1. Connect GitHub repository to Heroku.
2. Add "Heroku Postgres" add-on.
3. Set environment variables in Heroku settings.
4. Deploy branch.
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
