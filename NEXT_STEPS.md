
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

## 2. Activate E-commerce Data Sync (Ready for Keys)

The UI and service layer for syncing with Shopify are complete. Provide your store credentials to bring in live product data.

**Purpose:** To automatically sync product listings from your Shopify store into the "Product Sourcing" dashboard.

**Instructions:**

1.  **Obtain API Credentials:** In your Shopify store's admin panel, go to "Apps" -> "Develop apps" -> "Create an app". Give it a name (e.g., "Omarim AI Sync"). In the "API credentials" tab, configure "Admin API access scopes" and grant `read_products` permissions. Install the app to get your Admin API access token.
2.  **Store Credentials Securely:** Add these credentials to your `.env` file.

    ```bash
    # --- Shopify Integration ---
    SHOPIFY_STORE_URL="https://your-store-name.myshopify.com"
    SHOPIFY_API_KEY="shpat_xxxxxxxxxxxxxxxxxxxx" # Your Admin API access token
    ```

**Result:** The "E-commerce" page will be able to fetch and display real products from your Shopify store.

---

## 3. Activate Social Media Publishing (Ready for Keys)

The AI Social Publisher is fully functional for generating content and the service for publishing to X (Twitter) is complete. Provide developer tokens to enable live posting.

**Purpose:** To enable one-click publishing of your AI-generated content to X (Twitter) and other platforms.

**Instructions (for X/Twitter):**

1.  **Apply for a Developer Account:** Go to [developer.twitter.com](https://developer.twitter.com/) and apply for a developer account.
2.  **Create an App:** Create a new app with "Read and Write" permissions.
3.  **Generate Keys and Tokens:** Generate an API Key, API Key Secret, Access Token, and Access Token Secret.
4.  **Update Your `.env` File:** Add the generated credentials to your `.env` file.

    ```bash
    # --- Twitter/X API Keys ---
    TWITTER_API_KEY="YOUR_API_KEY"
    TWITTER_API_SECRET="YOUR_API_KEY_SECRET"
    TWITTER_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
    TWITTER_ACCESS_SECRET="YOUR_ACCESS_TOKEN_SECRET"
    ```

**Result:** The "Publish" button for Twitter posts will now post directly to your account. For other platforms, a developer would follow a similar process to add their respective services.

---

## 4. Activate Data Enrichment (Ready for Keys)

The service for enriching leads via Clearbit is complete.

**Purpose:** To automatically add valuable company and contact data to your leads.

**Instructions:**

1.  **Get a Clearbit API Key:** Sign up for a Clearbit account and get an API key from your dashboard.
2.  **Update Your `.env` File:**

    ```bash
    # --- Data Enrichment ---
    CLEARBIT_API_KEY="YOUR_CLEARBIT_API_KEY"
    ```

---

## 5. Activate Print-on-Demand (Ready for Keys)

The service for creating print-on-demand products via Printify is ready.

**Purpose:** To autonomously create and publish new custom apparel or other print-on-demand products.

**Instructions:**

1.  **Get a Printify API Key:** In your Printify account, go to "Settings" -> "API" to generate a new Personal Access Token.
2.  **Update Your `.env` File:**

    ```bash
    # --- Fulfillment ---
    PRINTIFY_API_KEY="YOUR_PRINTIFY_API_KEY"
    ```
