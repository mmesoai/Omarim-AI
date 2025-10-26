# Omarim AI: Final Integration Steps

This document provides the final instructions needed to connect your Omarim AI application to live, third-party services. Follow these steps to transition from a fully-functional prototype to a production-ready powerhouse.

---

## 1. Activate Real Email Outreach (Ready for Keys)

The application has been fully integrated with the SendGrid SDK. All you need to do is provide your API keys.

**Purpose:** To enable the Autonomous Agent and other outreach features to send real emails to your leads.

**Instructions:**

1.  **Create a SendGrid Account:** If you don't have one, sign up at [sendgrid.com](https://sendgrid.com/).
2.  **Create a Sender Identity:** In your SendGrid dashboard, you must verify an email address or a domain that you will send emails from. Follow their "Sender Authentication" guide.
3.  **Generate an API Key:** In your SendGrid account, go to "Settings" -> "API Keys" and create a new API key with "Full Access" permissions.
4.  **Update Your `.env` File:** Open the `.env` file in the root of your project and add the following lines, replacing the placeholders with your actual credentials.

    ```bash
    # --- SendGrid API Keys ---
    # Used by the email service to send real outreach emails.
    SENDGRID_API_KEY="YOUR_API_KEY_HERE"
    SENDGRID_FROM_EMAIL="your.verified.email@example.com"
    ```

**Result:** Once these keys are in place, the "Engage Lead" and other email-related features will send emails through your SendGrid account.

---

## 2. Activate E-commerce Data Sync (Developer Required)

The user interface for managing stores and viewing products is complete. The next step is to build the backend logic to fetch data from live stores.

**Purpose:** To automatically sync product listings from your Shopify, WooCommerce, or other e-commerce stores into the "Product Sourcing" dashboard.

**Instructions:**

1.  **Obtain API Credentials:** For each store you want to connect (e.g., Shopify), go to its admin panel and create "Private App" or "Custom App" credentials to get an API Key and API URL.
2.  **Store Credentials Securely:** Add these credentials to your `.env` file. For example, for a Shopify store:

    ```bash
    # --- Shopify Integration ---
    SHOPIFY_STORE_URL="https://your-store-name.myshopify.com"
    SHOPIFY_API_KEY="shpat_xxxxxxxxxxxxxxxxxxxx"
    ```

3.  **Build the Service Logic (For a developer):** A developer would need to create a new service file (e.g., `src/services/shopify-service.ts`) that uses these credentials to make API calls to Shopify to fetch product data. This service would then be used to populate the Firestore database, which the UI already reads from.

---

## 3. Activate Social Media Publishing (Developer Required)

The "AI Social Publisher" is fully functional for generating content. The final step is to build the logic to post this content to social media platforms.

**Purpose:** To enable one-click publishing of your AI-generated content to X (Twitter), LinkedIn, Facebook, and other platforms.

**Instructions:**

1.  **Create Developer Apps:** For each platform (e.g., X, LinkedIn), you will need to apply for a developer account and create a new "app".
2.  **Implement OAuth 2.0 Flow (For a developer):** Social media integrations require a secure authentication process called OAuth 2.0. A developer would need to build the UI flow (pop-ups, redirects) that allows a user to grant Omarim AI permission to post on their behalf.
3.  **Build the API Service (For a developer):** After authentication, a developer would write the code in a new service file (e.g., `src/services/twitter-service.ts`) to take the generated content and use the platform's API to publish it as a new post.

---

## 4. Automate YouTube Live Reposting (Developer Required)

This is the most advanced feature and requires a dedicated backend service.

**Purpose:** To automatically generate social media posts about a YouTube live stream moments after it has finished.

**Instructions:**

1.  **Set Up a Google Cloud Function:** This task is best handled by a serverless function that can run independently.
2.  **Use the YouTube Data API:** A developer would write code inside this Cloud Function to "watch" a specific YouTube channel. It would periodically check if a live stream is active and detect when it transitions from "live" to "completed".
3.  **Trigger the Omarim AI Flow:** Once the stream has ended, the Cloud Function would make a secure API call to your Omarim AI application, triggering the existing `generateMultipleSocialPosts` flow with the YouTube video URL.
4.  **Publish Posts:** If you have completed Step 3 (Social Media Publishing), these generated posts could then be published automatically.
