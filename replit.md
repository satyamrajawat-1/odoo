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
- **Interactive Landing Page**: Modern home page with animations, gradient text, stats showcase, and feature highlights
- **Role-based Access Control**: Admin, Manager, and Employee dashboards with tailored workflows
- **Advanced OCR**: AI-powered receipt scanning supporting both printed and handwritten text
- **Multi-step Approvals**: Configurable approval workflows with drag-and-drop sequence builder
- **Smart Routing**: Intelligent approval routing that skips non-approving managers
- **Real-time Feedback**: Loading animations, progress bars, and instant notifications
- **Currency Conversion**: Multi-currency support with automatic conversion
- **Audit Trail**: Comprehensive logging of all actions and changes

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

### Running on Replit
The application is configured to run on Replit with the following setup:
- **Workflow**: "Server" runs `bun run dev` on port 5000
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Port**: 5000 (only port accessible in Replit)
- **Vite Config**: Configured with `allowedHosts: true` to work with Replit's iframe proxy
- **HMR**: Disabled for Replit environment compatibility

### Running Locally
The application runs on port 5000 with Vite's dev server:
```bash
bun run dev
# or
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
Configured for Replit Autoscale deployment:
- **Build**: `bun run build` - Creates optimized production bundle in `dist/`
- **Run**: `bun run preview` - Serves the built application
- **Type**: Autoscale (ideal for stateless web applications)

## Replit Environment Setup
- **Package Manager**: Bun (primary) and npm (fallback)
- **Dependencies**: All installed via `bun install`
- **Workflows**: Single "Server" workflow running development server
- **Deployment**: Configured for Autoscale with production build

## Recent Changes
- **2025-10-04**: Major UI/UX and OCR enhancements
  - Created interactive landing page with animations, gradient text, stats cards, and feature showcase
  - Enhanced OCR to support handwritten receipts with image preprocessing (binarization)
  - Added MAX_IMAGE_DIMENSION guard (3000px) to prevent memory issues
  - Implemented comprehensive error handling with fallback to original images
  - Added AbortController pattern for handling concurrent receipt uploads
  - Enhanced ExpenseCard with hover animations, color-coded icons, and progress bars
  - Improved EmployeeDashboard with loading spinners, tooltips, and AI-powered badges
  - Added empty state for better first-time user experience
  - Implemented smooth fade-in animations for expense cards
  - Added differentiated user feedback (success/warning/error toasts)
  - File input remains enabled during OCR processing for better UX

- **2025-10-04**: Project imported and configured for Replit
  - Installed all dependencies via bun (407 packages)
  - Configured workflow "Server" to run `bun run dev` on port 5000
  - Set up deployment configuration for Autoscale with build and preview commands
  - Verified application runs correctly in Replit environment
  - Environment variables for Supabase properly configured (.env file)
  - Vite config correctly set up with host 0.0.0.0, port 5000, and allowedHosts: true
  - Application tested and confirmed working - landing page displays correctly
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
