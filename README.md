# Bitweet

A social media platform built with modern web technologies. This project is a frontend application that provides features like a tweet feed, user authentication, profiles, notifications, and audio chat rooms.

## Features

*   **Authentication:** User registration and login.
*   **Tweets:** Create and view tweets.
*   **User Profiles:** View user profiles.
*   **Notifications:** Receive real-time notifications.
*   **Audio Rooms:** Create and join audio chat rooms.

## Tech Stack

This project is built with a modern and powerful tech stack:

*   **Framework:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

## Folder Structure

The project follows a standard structure for React applications:

```
/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # Reusable UI components (not detailed here)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # API clients, utility functions, etc.
│   ├── pages/            # Application pages
│   ├── store/            # Redux store and slices
│   └── types/            # TypeScript type definitions
├── .env.template         # Environment variable template
├── index.html            # Main HTML file
├── package.json          # Project dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Core Logic and Hooks

### Hooks (`src/hooks/`)

*   `useAudioRoom.tsx`: Manages the state and logic for audio rooms.
*   `useConnections.tsx`: Handles logic related to user connections.
*   `useTweets.tsx`: Manages the state and logic for tweets.
*   `useWebRTCAudio.tsx`: Provides WebRTC functionality for audio communication.

### Library (`src/lib/`)

*   `api.ts`: Configures the Axios instance for making API requests.
*   `endpoints.ts`: Defines the API endpoints used in the application.
*   `notification-socket.tsx`: Manages the WebSocket connection for real-time notifications.
*   `utils.ts`: Contains utility functions used throughout the application.
*   `validations/auth.ts`: Defines the Zod schemas for authentication-related form validations.

### State Management (`src/store/`)

*   `slices/audioroomSlice.ts`: Manages the state for audio rooms.
*   `slices/authSlice.ts`: Manages the state for user authentication.
*   `slices/notificationSlice.ts`: Manages the state for notifications.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repo
    ```sh
    git clone <repo_url>
    ```
2.  Install NPM packages
    ```sh
    pnpm install
    ```
3.  Create a `.env` file from the `.env.template` and add the required environment variables.

### Usage

To start the development server, run:

```sh
pnpm dev
```

This will open the application in your browser at `http://localhost:5173`.
