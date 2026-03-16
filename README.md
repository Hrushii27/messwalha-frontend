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
