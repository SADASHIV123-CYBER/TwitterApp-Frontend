# Tweety — Frontend (React + Vite)

A clean, responsive frontend for a Twitter-like microblogging app built with React and Vite. This README is tailored to your current project structure (files & folders) and explains setup, structure, and where key features live.

---

## Project Overview

Tweety Frontend connects to your custom backend and provides:

- Authentication (Context API + protected routes)
- Create tweet with optional image (Tweet composer)
- Full CRUD for tweets and comments
- Follow / unfollow flows (followers / following lists)
- Profile page & edit flows
- Reusable UI components (Button, Card, Input, Navbar, TweetCard, etc.)
- Axios-based API layer (`src/api/*`)
- TailwindCSS styling

---

## Tech Stack

- React 19 + Vite
- React Router (v7)
- Context API for auth
- Axios for HTTP requests
- Tailwind CSS for styling
- Zod for validation
- Lucide icons

### Available Scripts
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}

Project Structure

src/
 ├── api/
 │   ├── client.js          # axios client / baseURL
 │   ├── tweetApi.js        # tweet-related requests
 │   └── userApi.js         # user-related requests
 ├── assets/                # images/fonts/static assets
 ├── components/
 │   ├── Button/
 │   │   ├── Button.jsx
 │   │   └── getButtonStyling.js
 │   ├── Card/
 │   │   └── Card.jsx
 │   ├── Comment/
 │   │   └── CommentList.jsx
 │   ├── FollowList/
 │   │   └── FollowListModal.jsx
 │   ├── Input/
 │   │   └── Input.jsx
 │   ├── Navbar/
 │   │   └── Navbar.jsx
 │   ├── Routes/
 │   │   └── ProtectedRoute.jsx
 │   ├── TweetCard/
 │   │   └── TweetCard.jsx
 │   └── TweetComposer/
 │       └── TweetComposer.jsx
 ├── context/
 │   └── AuthContext.jsx    # auth provider, login/logout, token handling
 └── pages/
     ├── FollowListPage/
     │   └── FollowList.jsx
     ├── Home/
     │   └── Home.jsx
     ├── LoginPage/
     │   └── Login.jsx
     ├── ProfilePage/
     │   ├── Profile.jsx
     │   └── userService.js
     └── RegisterPage/
         ├── Register.jsx
         └── registerService.js



Component & Feature Map

AuthContext.jsx — global auth state (current user, token), exposes login, logout, register

ProtectedRoute.jsx — wrapper for route protection using AuthContext

TweetComposer.jsx — UI + form to create tweet with optional image upload

TweetCard.jsx — displays a tweet (image, text, author, actions: edit, delete, like, comment)

CommentList.jsx — list of comments + create/edit/delete comment flows

FollowListModal.jsx — modal to view followers / following and toggle follow/unfollow

Button / Input / Card — reusable building blocks; getButtonStyling.js centralizes button styles

userService.js / registerService.js — page-level service helpers for user operations (profile fetch/update, register)


Setup & Run Locally

git clone <repo-url>
cd twitterapp-frontend
npm install

Run development server:
npm run dev

Build for production:
npm run build
npm run preview

