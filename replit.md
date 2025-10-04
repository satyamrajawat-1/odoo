# ExesManen - Expense Management System

## Overview
ExesManen is a smart expense management application with automated approvals and OCR receipt scanning. Built with React, TypeScript, Vite, and Supabase, it provides role-based dashboards for admins, managers, and employees to manage expense workflows efficiently.

## Project Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **OCR**: Tesseract.js for receipt scanning

### Backend
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **Real-time**: Supabase Realtime for notifications

### Key Features
- Role-based access control (Admin, Manager, Employee)
- Configurable multi-step approval workflows with drag-and-drop sequence builder
- Manager opt-in/opt-out for approval workflows (isManagerApprover field)
- Support for role-based and specific user approval steps
- Smart approval routing that skips non-approving managers
- OCR receipt scanning and data extraction
- Currency conversion support
- Real-time notifications
- Audit logging
- Team management

## Project Structure
```
/src
  /components      - React components including dashboards and UI elements
  /contexts        - React context providers (AppContext)
  /hooks           - Custom React hooks
  /integrations    - Supabase client and type definitions
  /lib             - Utility functions (currency, OCR, mock data)
  /pages           - Page components (Index, NotFound)
  /types           - TypeScript type definitions
/supabase
  /migrations      - Database schema migrations
/public            - Static assets
```

## Database Schema
The application uses Supabase with the following main tables:
- **profiles**: User profiles with role associations
- **user_roles**: Role assignments (admin, manager, employee)
- **teams**: Team organization
- **expenses**: Expense records with OCR data and approval tracking
- **approvals**: Multi-step approval workflow records
- **notifications**: Real-time user notifications
- **audit_logs**: Audit trail for all actions

## Development

### Running Locally
The application runs on port 5000 with Vite's dev server:
```bash
npm run dev
```

### Environment Variables
Required environment variables (already configured in `.env`):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID`: Supabase project ID

### Build
```bash
npm run build
```

## Deployment
Configured for Replit Autoscale deployment with production build optimization.

## Recent Changes
- **2025-10-04**: Enhanced approval workflow system
  - Added `isManagerApprover` field to User type to allow managers to opt-in/opt-out of approval workflows
  - Implemented configurable approval sequences with admin UI for creating and managing multi-step workflows
  - Added drag-and-drop functionality (@dnd-kit/sortable) for intuitive sequence step reordering
  - Support for both role-based (e.g., "manager", "admin") and specific user approval steps
  - Smart approval routing that automatically skips non-approving managers and advances to next eligible approver
  - Approval flow now iterates through all sequence steps until an eligible approver is found
  - Sequences tab in admin dashboard for managing multiple approval workflows
  - Visual sequence builder with step type selection, user/role picker, and drag handles

- **2025-10-04**: Added login page and authentication
  - Created login page with traditional email/password form
  - Added one-click demo login buttons for all user roles (Admin, Manager, Employee)
  - Updated navigation to show login page first, then dashboard after authentication
  - Added logout functionality to user header
  - Configured for Replit environment (port 5000, host 0.0.0.0, HMR disabled)

## User Preferences
None specified yet.
