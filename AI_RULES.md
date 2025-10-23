# AI Rules for Application Development

This document outlines the core technologies and best practices to follow when developing for this application.

## Tech Stack Overview

*   **Framework:** React.js
*   **Language:** TypeScript
*   **Routing:** React Router (routes are defined in `src/App.tsx`)
*   **Styling:** Tailwind CSS for all styling
*   **UI Components:** shadcn/ui (prebuilt components, do not modify directly)
*   **Base UI Primitives:** Radix UI (underpins shadcn/ui components)
*   **Icons:** `lucide-react`
*   **Project Structure:**
    *   `src/`: Root directory for all source code.
    *   `src/pages/`: Contains page-level components.
    *   `src/components/`: Contains reusable UI components.
    *   `src/pages/Index.tsx`: The main entry page for the application.

## Library Usage Rules

*   **Styling:** Always use Tailwind CSS classes for all styling. Avoid inline styles or separate CSS files unless explicitly requested.
*   **UI Components:** Prioritize using components from `shadcn/ui`. If a specific component is not available or requires significant customization, create a new component in `src/components/` and style it using Tailwind CSS. **Do not modify `shadcn/ui` component files directly.**
*   **Icons:** Use icons provided by the `lucide-react` package.
*   **Routing:** All application routes should be managed and defined within the `src/App.tsx` file using React Router.
*   **New Components/Hooks:** Always create new, dedicated files for any new components or custom hooks (e.g., `src/components/MyNewComponent.tsx`, `src/hooks/useMyHook.ts`). Aim to keep files small and focused, ideally under 100 lines of code.
*   **File Structure:** Strictly adhere to the established directory structure: `src/pages/` for page components and `src/components/` for reusable UI components. All directory names must be lowercase.
*   **Dependencies:** If a new third-party library is needed, it must be installed using `<dyad-add-dependency>` and justified.