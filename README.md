This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Flashcard-Saas

Flashcard SaaS is a web-based application that allows users to create, manage, and memorize flashcards. It is designed to facilitate quick learning through flashcards, leveraging techniques like spaced repetition, mnemonics, and simple language to make memorization more effective. The platform also integrates with Stripe for managing subscriptions, allowing users to choose between free and paid plans.

## Features

**User Authentication:** Secure sign-up, login, and user session management powered by Clerk.
**Flashcard Creation:** Generate flashcards from any text input, with a focus on creating 12 cards per session using mnemonics and proven memorization techniques.
**Flashcard Management:** Rename and delete flashcard sets directly from the dashboard.
**Subscription Management:** Integrates with Stripe to handle both free and paid subscription plans.
**Responsive Design:** Accessible across all devices with a clean, user-friendly interface.

## Technologies Used

🚀 **Next.js:** React framework for building server-side rendered (SSR) applications.  
🔥 **Firebase:** Used for storing user data and flashcard sets.  
🖱️ **Clerk:** Handles user authentication, login, and session management.  
💳 **Stripe:** For processing payments and managing subscription plans.  
💅 **Material-UI:** Provides UI components for a clean, responsive design.  
😺 **Styled-Components:** For styling the components in a modular and maintainable way.  


## Setup and Installation

### Prerequisites

	•	Node.js (v14 or above)
	•	Firebase account with a Firestore database
	•	Stripe account for managing payments
	•	Clerk account for user authentication

### Steps to Setup

1. Clone the repository:

git clone https://github.com/yourusername/flashcard-saas.git
cd flashcard-saas

2.	Install dependencies:
   
npm install

3.	Environment Variables:
   
Create a .env.local file in the root directory and add the following:

  ``` NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  STRIPE_SECRET_KEY=your_stripe_secret_key
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
  FIREBASE_API_KEY=your_firebase_api_key
  FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
  FIREBASE_PROJECT_ID=your_firebase_project_id
  FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
  FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
  FIREBASE_APP_ID=your_firebase_app_id
```


4.	Firebase/Clerk/Stripe/OpenRouter Setup:
  - Set up a Firestore database and replace the placeholders in the .env.local file with your Firebase configuration.
  - Paste your public and secret keys for Clerk, Stripe, and OpenRouter.


   
8.	Run the development server:
    `npm run dev`

[Open](http://localhost:3000) in your browser to see the application running.

## Usage

### Flashcard Management

- Create Flashcards: Navigate to the “Generate” page to create flashcards from any text input.
- Manage Sets: View your flashcard sets on the dashboard. You can rename or delete any set directly from this interface.

### Subscription Management

- Choose a Plan: From the “Pricing” section, choose between a free or a paid subscription plan.
- Stripe Integration: The application will redirect you to Stripe’s checkout page to complete the subscription process.

### To-Do

	•	Implement advanced spaced repetition algorithms.
	•	Add more customization options for flashcards.
	•	Introduce a community-sharing feature for public flashcard sets.

