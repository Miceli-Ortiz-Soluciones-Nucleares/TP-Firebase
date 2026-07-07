# Kultrumm E-Commerce Constitution

## Core Principles

### I. Spec-First (NON-NEGOTIABLE)
No feature, button, route or flow is implemented unless explicitly defined in `integrated-spec-v2.md`. Code is the execution of the plan, never the other way around. Any PR introducing unspecified behavior must be rejected.

### II. MVC Architecture Adapted to React
- **View** (`src/components/`): Pure React + Tailwind CSS only. No Firebase calls, no business logic.
- **Controller** (`src/hooks/`): Custom Hooks encapsulating state and service calls.
- **Model** (`src/services/`): Stateless JS/TS modules that exclusively interact with Firebase Auth and Firestore.
Violations of layer boundaries are treated as architectural defects.

### III. JWT-Based Role Authorization
Admin role is transported via Firebase Auth JWT Custom Claims (`{ "admin": true }`). The frontend reads the decoded token via `user.getIdTokenResult()`. Firestore rules validate `request.auth.token.admin == true`. UID hardcoding anywhere in application code is forbidden.

### IV. No Firebase Functions (Phase 1)
All logic runs client-side using Firestore security rules and JWT. This keeps the project locally testable without additional infrastructure.

### V. Bauhaus Design System
UI must follow the Bauhaus aesthetic: geometric grids, 1px borders (`border-neutral-800`), dark palette (`#121212` bg / `#f3f3f3` text), Space Grotesk (sans) + Space Mono (mono) fonts. Red `#dd3b3b` and amber `#ff9d00` accents used sparingly for active states only.

### VI. Phase-Gated Delivery
- **Phase 1 (current)**: Full MVC app with simulated checkout, JWT auth, Firestore CRUD, CI/CD pipeline.
- **Phase 2 (deferred)**: PayPal Sandbox integration replacing the simulated checkout.
No Phase 2 code enters the codebase until Phase 1 is 100% functional and deployed.

## Technology Stack
- React 18 + TypeScript 5 + Vite 5
- Tailwind CSS 3 + lucide-react
- React Router DOM 6
- Firebase SDK 10 (Auth + Firestore)
- Google Fonts: Space Grotesk + Space Mono

## Security Requirements
- Firestore rules defined in `firestore.rules` (see §6 of spec)
- Products: public read, admin-only write
- Orders (`/compras`): public create (anonymous checkout), admin-only read/update/delete
- `.env` never committed; all secrets in GitHub Secrets for CI/CD

## Governance
This constitution supersedes all other practices. Amendments require updating both this file and `integrated-spec-v2.md` with version bump and date. All implementation decisions must be traceable to a User Story in the spec.

**Version**: 3.0.0 | **Ratified**: 2026-07-07 | **Last Amended**: 2026-07-07
