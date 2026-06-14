# Friday Meals

Friday Meals is a premium homemade cookies and bakery e-commerce platform built with Next.js, Prisma, and MariaDB.

## Features
- **User Authentication**: Secure login and registration.
- **Product Catalog**: Browse and manage bakery products.
- **Cart & Checkout**: Add items to cart and checkout with multiple payment methods (Bank Transfer, QRIS, etc.).
- **Admin Dashboard**: Manage products, orders, users, and bank accounts.
- **Payment Verification**: Upload payment proofs for manual verification.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: MariaDB 10.11
- **ORM**: Prisma
- **Styling**: Tailwind CSS & Shadcn UI
- **Auth**: NextAuth.js

---

## 🛠 Local Development

1. **Clone and Install Dependencies**
   ```bash
   git clone <repo-url>
   cd fridaymeals
   npm install
   ```

2. **Setup Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/fridaymeals"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key"
   ```

3. **Start Database (Development)**
   Run MariaDB using Docker Compose (only the mariadb service):
   ```bash
   docker compose up -d mariadb
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 🚀 Production Deployment (Docker)

The easiest and most reliable way to deploy Friday Meals to a production server (VPS, Cloud Server, etc.) is by using **Docker Compose**. The provided configuration will spin up both the MariaDB database and the Next.js standalone server in isolated, optimized containers.

### Prerequisites
Make sure you have [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your server.

### Deployment Steps

1. **Clone the Repository to your Server**
   ```bash
   git clone <repo-url>
   cd fridaymeals
   ```

2. **Configure Production Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="generate-a-strong-secret-key-here"
   ```
   *(Note: The database URL is already handled internally by the docker-compose network).*

3. **Build and Run the Containers**
   Execute the following command to build the Next.js production image and start all services in detached mode:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Deployment**
   - Wait a few seconds for the database to initialize and Next.js to start.
   - The application automatically pushes the Prisma schema to the database on startup.
   - You can view the application running on port `3000`. If you are using a reverse proxy like Nginx or Cloudflare Tunnels, point it to `http://localhost:3000`.

### Persistent Data
The `docker-compose.yml` file is configured with **Docker Volumes** to ensure your data is safe and persistent across restarts:
- `mariadb_data`: Stores all database tables and records.
- `uploads_data`: Stores all images uploaded by users (e.g., payment proofs) in `public/uploads`.
