# Omarim AI: Final Integration Steps

This document provides the final instructions needed to connect your Omarim AI application to live, third-party services. Follow these steps to transition from a fully-functional prototype to a production-ready powerhouse.

---

## 1. **CRITICAL:** Activate the AI Engine (Required)

All AI features in this application are powered by Google's Gemini models. You must provide an API key for the AI to function.

**Purpose:** To enable all AI capabilities, including content generation, lead analysis, and autonomous agents.

**Instructions:**

1.  **Get a Gemini API Key:**
    *   Visit [**Google AI Studio**](https://aistudio.google.com/).
    *   Log in with your Google account.
    *   Click on **"Get API key"** and then **"Create API key in new project"**.
    *   Copy the generated API key.

2.  **Add the Key to Your Live Application:**
    *   Go to your application's dashboard on your hosting provider (e.g., Render, Vercel).
    *   Navigate to the **"Environment"** or **"Environment Variables"** section for your service.
    *   Add a new environment variable with the following name and value:
        *   **Name:** `GEMINI_API_KEY`
        *   **Value:** `YOUR_API_KEY_HERE` (Paste the key you copied from Google AI Studio)
    *   Save the changes. Your application will likely restart automatically to apply the new setting.

**Result:** With this key in place, all AI features of Omarim AI will be fully operational.

---

## 2. Activate Real Email Outreach (Ready for Keys)

The application has been fully integrated with the SendGrid SDK. You can add your API keys via the **Settings > Integrations** page in your dashboard.

**Purpose:** To enable the Autonomous Agent and other outreach features to send real emails to your leads.

**Instructions:**

1.  **Create a SendGrid Account:** If you don't have one, sign up at [sendgrid.com](https://sendgrid.com/).
2.  **Create a Sender Identity:** In your SendGrid dashboard, you must verify an email address or a domain that you will send emails from. Follow their "Sender Authentication" guide.
3.  **Generate an API Key:** In your SendGrid account, go to "Settings" -> "API Keys" and create a new API key with "Full Access" permissions.
4.  **Add the Key in Your Dashboard:** Navigate to **/dashboard/settings/integrations** in your live application and connect SendGrid by providing the API key.

**Result:** Once the key is saved, the "Engage Lead" and other email-related features will send emails through your SendGrid account.

---

## 3. Activate Data Enrichment (Ready for Keys)

**Purpose:** To automatically add valuable company and contact data to your leads.

**Instructions:**

1.  **Get a Clearbit API Key:** Sign up for a Clearbit account and get an API key from your dashboard.
2.  **Add the Key in Your Dashboard:** Navigate to **/dashboard/settings/integrations** in your live application and connect Clearbit by providing the API key.

---

## 4. Activate Print-on-Demand (Ready for Keys)

**Purpose:** To autonomously create and publish new custom apparel or other print-on-demand products.

**Instructions:**

1.  **Get a Printify API Key:** In your Printify account, go to "Settings" -> "API" to generate a new Personal Access Token.
2.  **Add the Key in Your Dashboard:** Navigate to **/dashboard/settings/integrations** in your live application and connect Printify by providing the API key.

---

## 5. E-commerce, Social Media, & Payments (Developer Required)

The user interface for managing these connections is complete. A developer is required to build the final API service logic for each platform.

**Purpose:** To sync products from your e-commerce stores, publish content to social media, and process payments.

**Instructions (For a developer):** For each integration (e.g., Shopify, Stripe, X/Twitter), a developer would need to:
1.  Obtain the necessary API credentials for the platform.
2.  Build the service logic (e.g., in a file like `src/services/shopify-service.ts`) that uses the stored credentials to make API calls to the platform.
3.  Connect this service to the existing UI and AI flows.
