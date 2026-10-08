# bhel project guide

bhel is a human resource management system: a Next.js web app talks to a Spring Boot gateway, which calls a Java RMI server that owns the PostgreSQL database. The [root README](/README.md) covers the product; this page covers what an agent needs to work in the repository.

Contents:

1.  [Workloads](#workloads)
1.  [Commands](#commands)
1.  [Conventions](#conventions)
1.  [Deploys](#deploys)

## Workloads

- **`apps/web/`:** Next.js 16 (App Router), React 19 and Tailwind CSS 4, managed with bun. Routes live in `apps/web/src/app/`: `(auth)/login` and everything under `dashboard/`. API calls go through the axios client in `apps/web/src/lib/api/`, and state lives in the zustand stores in `apps/web/src/lib/store/`.
- **`apps/api/`:** one Maven module (Java 17, Spring Boot 3.5) with three packages under `hrms.bhel`:
  - `client` is the Spring Boot REST gateway (`ClientApplication`, port 8080): controllers, JWT security, CORS, and an RMI client to the server.
  - `server` is the RMI server (`RMIServerMain`, registry port 1099): service implementations, DAOs and the HikariCP pool. `server.config.DatabaseInitializer` loads `db/schema.sql` and `db/seed_data.sql`.
  - `common` holds the DTOs, exceptions and the remote service interfaces both sides share.

The fat jar holds all three entry points; Spring Boot's `Start-Class` is the gateway.

## Commands

Run these from the repository root unless noted. The Java processes read only environment variables, so load the root `.env` into the shell first: `set -a; . ./.env; set +a`.

- `bun install`: installs the repository tooling (Prettier, Husky, commitlint, lint-staged) and the Git hooks.
- `bun install` in `apps/web/`: installs the web app. `bun run check` needs it.
- `bun run check`: Prettier, the web app's ESLint (no warnings allowed), its typecheck and build, then `mvn package` for the API when `mvn` is on `PATH`.
- `bun run lint`: Prettier's check. `bun run lint:fix` runs Prettier's write.
- `bun run dev`, `bun run build`, `bun run lint` and `bun run typecheck`, in `apps/web/`: the Next.js dev server on `http://localhost:3000`, the production build, ESLint and `tsc --noEmit`.
- `mvn -q -B -f apps/api/pom.xml package`: builds `apps/api/target/hrms-1.0-SNAPSHOT.jar`.
- `java -cp apps/api/target/hrms-1.0-SNAPSHOT.jar -Dloader.main=<class> org.springframework.boot.loader.launch.PropertiesLauncher`: runs `hrms.bhel.server.config.DatabaseInitializer` or `hrms.bhel.server.RMIServerMain`. `java -jar apps/api/target/hrms-1.0-SNAPSHOT.jar` runs the gateway. Start the RMI server before the gateway.

`DatabaseInitializer` drops and recreates every table in the database `DATABASE_URL` points at, then seeds three local logins: `admin`/`admin`, `hr`/`hr` and `employee`/`employee`.

The gateway refuses to start unless `JWT_SECRET` is at least 32 bytes and isn't the `.env.example` placeholder (`openssl rand -hex 32` makes one).

## Conventions

- **Package managers:** bun for the root tooling and `apps/web/`, each with its own `bun.lock`. Maven for `apps/api/`.
- **Formatting:** Prettier formats every file type it supports, with the template's `.prettierrc.json`. It doesn't format Java, SQL or XML.
- **Commits:** Conventional Commits, with headers of at most 50 characters, enforced by commitlint in the `commit-msg` hook. The `pre-commit` hook runs Prettier on staged files.
- **Secrets:** never commit them. Copy `.env.example` to `.env` at the root; `.gitignore` keeps every `.env*` file except the example out of Git.

## Deploys

There are no deploy scripts and the repository has no CI.
