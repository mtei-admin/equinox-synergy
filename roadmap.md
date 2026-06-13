# Target Architecture: Next.js (App Router) + Supabase BaaS
# Project Name: Equinox Synergy CMS & Inventory

This roadmap outlines the modular, sequential phases required to develop and deploy the Equinox Synergy platform. Follow these phases in order to maintain a clean codebase, clear context for AI generation, and secure data boundaries.

---

## Phase 1: Environment Setup & Supabase Initialization

### Objective
Establish the repository structure, initialize local or remote Supabase services, and generate TypeScript types to enforce type safety from day one.

- [x] **Task 1.1: Initialize Next.js Project** Create a fresh Next.js project using TypeScript, Tailwind CSS, and the App Router configuration. Clean up boilerplate code in `/app`.
- [x] **Task 1.2: Install Supabase Dependencies** Install official dependencies: `@supabase/supabase-js` and `@supabase/ssr`.
- [x] **Task 1.3: Configure Environment Variables** Set up a `.env.local` file containing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Add a `.env.example` template to the repository.
- [x] **Task 1.4: Set Up Database Migration Tracking** Initialize the local Supabase directory structure (`/supabase/migrations`) to track database schema evolutions cleanly using the Supabase CLI.

---

## Phase 2: Database Schema & Row-Level Security (RLS)

### Objective
Deploy the relational PostgreSQL database structure and apply security rules directly to the tables so that data isolation is handled natively by the database engine.

- [x] **Task 2.1: Implement User Core Architecture** Create a migration script to establish the `profiles` table that safely references Supabase's internal `auth.users` schema. Include columns for user `role` (enum: `'dealer'`, `'employee'`), company details, and timestamps.
- [x] **Task 2.2: Establish Inventory & WMS Schemas** Draft schemas for:
  - `products`: SKU, names, descriptions, internal supplier cost, dealer wholesale pricing, and total stock quantities.
  - `purchase_orders`: Order numbers, dealer foreign keys, total financial amount, and status markers (`pending`, `processing`, `dispatched`, `completed`, `cancelled`).
  - `order_items`: Line items linking purchase orders to products with locked quantities and prices.
  - `cms_assets`: Published CMS files stored in Supabase Storage.
- [x] **Task 2.3: Apply Row-Level Security Policies** Enable RLS on all tables with dealer/employee isolation, including a dealer-safe `products_dealer_catalog` view that hides supplier costs.

---

## Phase 3: Authentication & Route Protection

### Objective
Provide a secure login experience and enforce role-based routing between the dealer portal and employee admin areas.

- [x] **Task 3.1: Login Portal** Build `/login` with email/password sign-in via Supabase Auth and server actions.
- [x] **Task 3.2: Session Middleware** Redirect unauthenticated users to `/login`, refresh sessions, and route authenticated users to the correct home dashboard.
- [x] **Task 3.3: Route Isolation** Block dealers from `/admin` and route employees away from `/dealer` paths.
- [x] **Task 3.4: Portal Shells** Scaffold `/dealer` and `/admin` layouts with navigation placeholders for upcoming modules.

---

## Phase 4: Dealer Inventory & Purchase Orders

### Objective
Deliver the dealer-facing inventory catalog, cart checkout flow, and order tracking backed by Supabase RLS and server actions.

- [x] **Task 4.1: Product Catalog** Load `products_dealer_catalog` with stock indicators (in stock, low stock, out of stock) and wholesale pricing.
- [x] **Task 4.2: Cart & PO Submission** Client-side cart with server-action checkout that validates stock, locks line prices, and creates `purchase_orders` + `order_items`.
- [x] **Task 4.3: Order Tracking** Dealer order list and detail pages with fulfillment status badges.
- [x] **Task 4.4: Employee Fulfillment** Admin orders pipeline with status updates for incoming dealer POs.
- [x] **Task 4.5: Seed & Dashboard Metrics** Sample products in `seed.sql` and live counts on dealer/admin dashboards.

---

## Phase 5: CMS Assets & Announcements

### Objective
Enable employees to upload and publish CMS files while dealers browse announcements and download approved assets from Supabase Storage.

- [x] **Task 5.1: Storage Bucket & Policies** Create private `cms-assets` bucket with employee upload and dealer read access tied to published `cms_assets` rows.
- [x] **Task 5.2: Announcements Schema** Add `announcements` table with RLS for published dealer visibility and employee management.
- [x] **Task 5.3: Admin CMS Management** Build `/admin/cms` for asset uploads, publish/archive controls, and announcement drafting.
- [x] **Task 5.4: Dealer Asset Library** Build `/dealer/assets` with signed download URLs for published files.
- [x] **Task 5.5: Dealer Announcement Feed** Show recent published announcements on the dealer dashboard; seed sample content.

---

## Phase 6: Admin Inventory & Dealer Management

### Objective
Give employees full WMS inventory control and dealer onboarding tools backed by server actions and secure admin APIs.

- [x] **Task 6.1: Inventory Dashboard** Stock valuation summary, low-stock alerts, and out-of-stock counts on `/admin/inventory`.
- [x] **Task 6.2: Product CRUD** Create, update, and archive products with supplier cost and dealer pricing.
- [x] **Task 6.3: Dealer Account Creation** Provision dealer Auth users and profiles via service-role server actions.
- [x] **Task 6.4: Dealer Profile Management** Edit company details and activate/deactivate dealer portal access.
- [x] **Task 6.5: Operations Dashboard** Inventory snapshot and active dealer metrics on `/admin`.

---

## Phase 7: Real-Time Order Alerts

### Objective
Notify employees instantly when dealers submit purchase orders using Supabase Realtime WebSocket subscriptions.

- [x] **Task 7.1: Realtime Publication** Add `purchase_orders` to the `supabase_realtime` publication with full replica identity.
- [x] **Task 7.2: Admin WebSocket Listener** Subscribe to `INSERT` events on `purchase_orders` from the admin layout using the browser Supabase client.
- [x] **Task 7.3: In-App Notifications** Toast alerts with order number, total, and link to `/admin/orders`; auto-refresh admin data on new POs.
- [x] **Task 7.4: Connection Indicator** Show live connection status for the PO alert channel in the admin shell.

---

## Phase 8: Production Deployment

### Objective
Deploy Equinox Synergy to Vercel with production Supabase configuration, auth redirects, and environment documentation.

- [x] **Task 8.1: Vercel Configuration** Add `vercel.json`, Node engine constraint, and production build settings.
- [x] **Task 8.2: Auth Callback Hardening** Support `x-forwarded-host` redirects for Vercel/production OAuth flows.
- [x] **Task 8.3: Deployment Guide** Document Vercel env vars, Supabase Auth URLs, migration push, and post-deploy checks in `DEPLOYMENT.md`.
- [x] **Task 8.4: Database Deploy Script** Add `npm run db:push` for applying migrations to the linked remote project.
- [x] **Task 8.5: Initial Vercel Deploy** Production alias live at `https://equinox-synergy.vercel.app` (env vars must be set in Vercel dashboard).

---

## Phase 9: WMS Process Flow (Inbound & Outbound)

### Objective
Implement the full purchasing and delivery workflow from the operations diagram: supplier procurement through goods receipt, and dealer sales orders through invoice, DR, picking, dispatch, and POD. Introduce an inventory ledger so stock movements are event-driven.

**Schema reference:** `docs/PHASE9_SCHEMA.md`  
**Migration:** `supabase/migrations/20250618000000_phase9_wms_flow_schema.sql`

- [x] **Task 9.1: Inventory Ledger** `inventory_transactions` table, stock sync trigger, opening-balance backfill; migrate admin stock edits to ledger writes.
- [x] **Task 9.2: Suppliers & Purchase Requests** Supplier master, PR workflow (draft → approved), PR line items.
- [x] **Task 9.3: Supplier Purchase Orders** Convert approved PRs to `supplier_purchase_orders`; track expected delivery dates.
- [x] **Task 9.4: Inbound Logistics & Receiving** `inbound_shipments`, `goods_receipts`, receive lines, `post_goods_receipt()` posting.
- [x] **Task 9.5: Receipt Exceptions** NG path via `receipt_exceptions` (damage, short ship, returns/claims).
- [x] **Task 9.6: Outbound Documents** `sales_invoices` and `delivery_receipts` linked to dealer `purchase_orders`.
- [x] **Task 9.7: Picking & Shipping** `pick_lists`, `post_pick_list()`, `outbound_shipments`, trucking fields.
- [x] **Task 9.8: Proof of Delivery** `proof_of_deliveries` with sign-off; auto-complete dealer order on POD.
- [ ] **Task 9.9: Serial Unit Tracking** `inventory_units` at receipt; assign units during pick for serialized products.
- [x] **Task 9.10: Admin UI Pipelines** `/admin/purchasing`, `/admin/fulfillment`, and `/admin/orders/[id]` workflow screens.