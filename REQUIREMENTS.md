# System Requirements Specification (SRS)
**Project Name:** Equinox Synergy CMS & Inventory
**Architecture:** Next.js + Supabase BaaS (Backend-as-a-Service)
**Document Version:** 1.0

---

## 1. Project Overview
Equinox Synergy is a unified web-based platform integrating a Content Management System (CMS) with an Inventory and Warehouse Management System (WMS). The system enforces strict Role-Based Access Control (RBAC) to serve two distinct user groups: external Dealers and internal Equinox Employees.

## 2. Technology Stack
*   **Frontend & Server Framework:** Next.js (App Router, React 18+)
*   **Language:** TypeScript (Strict Mode)
*   **Styling:** Tailwind CSS
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth (JWT-based)
*   **Storage:** Supabase Storage Buckets
*   **Real-time Capabilities:** Supabase Realtime (WebSockets)

---

## 3. User Roles & Access Levels
The system is bifurcated into two primary access roles governed by PostgreSQL Row-Level Security (RLS) policies.

### 3.1. External Users: Dealers
*   **Access:** Restricted / Sandboxed.
*   **Data Visibility:** Can only view available/public inventory (no cost metrics) and their own historical order data. Cannot view other dealers' activities.
*   **CMS Visibility:** Read-only access to published manuals, announcements, and marketing materials.

### 3.2. Internal Users: Equinox Employees
*   **Access:** Global / Administrative.
*   **Data Visibility:** Full CRUD (Create, Read, Update, Delete) access to all inventory tables, supplier costs, and all dealer purchase orders.
*   **CMS Visibility:** Full CRUD access to upload, edit, and delete system assets and announcements.

---

## 4. Functional Requirements

### 4.1. Authentication & Security
*   **[REQ-AUTH-01]** The system must provide a secure web-based login portal.
*   **[REQ-AUTH-02]** Authentication must be handled via Supabase Auth, issuing secure JWTs containing user metadata (Role: Dealer or Employee).
*   **[REQ-AUTH-03]** Next.js Middleware must intercept routing and redirect unauthenticated users to `/login`.
*   **[REQ-AUTH-04]** Next.js Middleware must enforce route isolation (Dealers cannot access `/admin` routes; Employees are routed to `/admin` dashboards).
*   **[REQ-AUTH-05]** All database tables must have PostgreSQL Row-Level Security (RLS) policies enabled.

### 4.2. Dealer Portal Module
*   **[REQ-DLR-01]** **CMS - Asset Library:** Dealers must be able to view and download specific digital assets (product manuals, labels, marketing media) from designated Supabase Storage buckets.
*   **[REQ-DLR-02]** **CMS - Announcements:** Dealers must have a dashboard view of recent company announcements.
*   **[REQ-DLR-03]** **Inventory - Stock View:** Dealers must be able to browse available product catalogs. Stock levels should be displayed dynamically (e.g., specific quantities or "In Stock/Out of Stock" indicators).
*   **[REQ-DLR-04]** **Inventory - Ordering:** Dealers must be able to assemble a cart and submit a formal Purchase Order (PO).
*   **[REQ-DLR-05]** **Inventory - Order Tracking:** Dealers must be able to view the real-time fulfillment status of their submitted POs (e.g., Pending, Processing, Dispatched).

### 4.3. Equinox Employee Admin Module (WMS)
*   **[REQ-EMP-01]** **Account Management:** Employees must be able to approve, create, and manage Dealer accounts and assign appropriate permissions.
*   **[REQ-EMP-02]** **CMS - Management:** Employees must be able to draft announcements and upload media files to Supabase Storage.
*   **[REQ-EMP-03]** **WMS - Stock Tracking:** Employees must have a real-time dashboard displaying exact stock valuations, low-stock alerts, and item movements.
*   **[REQ-EMP-04]** **WMS - Order Fulfillment:** Employees must have a pipeline/Kanban view to manage incoming Dealer POs and update their fulfillment statuses.
*   **[REQ-EMP-05]** **WMS - Purchasing:** Employees must be able to generate internal requisition workflows to order new stock from suppliers.
*   **[REQ-EMP-06]** **Real-Time Alerts:** Employees must receive instant WebSocket notifications (via Supabase Realtime) when a new Dealer PO is submitted.

---

## 5. Non-Functional Requirements

*   **[NFR-01] Performance:** System must utilize Next.js Server Components by default to minimize client-side JavaScript payloads and optimize dashboard load times.
*   **[NFR-02] Security:** Direct database mutations from the client are prohibited unless strictly enforced by RLS. Standard mutations should occur via Next.js Server Actions.
*   **[NFR-03] Type Safety:** The codebase must maintain end-to-end type safety using the Supabase CLI to generate TypeScript definitions from the PostgreSQL schema.
*   **[NFR-04] Data Integrity:** Critical inventory tables must utilize "soft deletes" (e.g., `is_active = false`) instead of hard database deletions to preserve historical audit logs.

---

## 6. Initial Database Schema Plan (Core Entities)
1.  **`users` (via Auth):** Managed by Supabase Auth.
2.  **`profiles`:** Links to `auth.users`, stores custom metadata (`role`, `company_name`, `contact_info`).
3.  **`products`:** SKU, name, description, retail price, cost price (RLS hidden from dealers), stock level.
4.  **`purchase_orders`:** PO number, dealer_id (Foreign Key), status, total_amount, created_at.
5.  **`order_items`:** Links POs to Products with specific locked-in quantities and prices.
6.  **`cms_assets`:** Asset title, category, Supabase Storage URL, uploaded_by (Employee ID).