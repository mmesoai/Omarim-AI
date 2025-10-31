# Omarim AI: Final Integration Steps

This document provides the final instructions needed to connect your Omarim AI application to live, third-party services. Follow these steps to transition from a fully-functional prototype to a production-ready powerhouse.

---

## 1. **CRITICAL:** Activate the AI Engine (Required)

All AI features in this application are powered by Google's Gemini models. You must provide an API key for the AI to function.

**Purpose:** To enable all AI capabilities, including content generation, lead analysis, and autonomous agents.

### Step 1: Get Your Gemini API Key

1.  **Visit Google AI Studio:** Open your web browser and go to [**aistudio.google.com**](https://aistudio.google.com/).
2.  **Log In:** Sign in with your Google account.
3.  **Get API Key:** On the main screen, look for a button or link that says **"Get API key"**. Click on it.
4.  **Create API Key:** You will be taken to a page to manage your keys. Click the button that says **"Create API key in new project"**.
5.  **Copy Your Key:** A new API key will be generated. It is a long string of letters and numbers. **Copy this key to your clipboard immediately.**

### Step 2: Add the Key to Your Render Application (Click-by-Click)

1.  **Go to Your Render Dashboard:** Log in to your account at [**dashboard.render.com**](https://dashboard.render.com).
2.  **Select Your Application:** On the main dashboard, find and click on your Omarim AI service in the list of projects.
3.  **Find "Environment" Settings:** On the sidebar for your application (on the left), look for a menu item named **"Environment"**. Click on it.
4.  **Add a New Variable:** Under the "Environment Variables" section, look for a button that says **"Add Environment Variable"**. Click it. This will show two input boxes: one for the `Key` and one for the `Value`.
5.  **Enter the Key Name:** In the first input box, labeled **`Key`**, type exactly:
    ```
    GEMINI_API_KEY
    ```
6.  **Enter the Key Value:** In the second input box, labeled **`Value`**, **paste the Gemini API key** you copied from Google AI Studio.
7.  **Save Your Changes:** Click the **"Save Changes"** button at the bottom of the page.
8.  **Wait for Redeployment:** Render will automatically detect the new variable and start a new deployment for your application. This may take a minute or two. You can monitor its progress in the "Events" tab.

**Result:** Once the new deployment is live, all AI features of Omarim AI will be fully operational.

---

## 2. Activate Real Email Outreach (Via Dashboard)

The application is integrated with SendGrid. You can add your API keys directly via the **Settings > Integrations** page in your dashboard.

**Purpose:** To enable the Autonomous Agent to send real emails to your leads.

**Instructions:**

1.  **Create a SendGrid Account:** If you don't have one, sign up at [sendgrid.com](https://sendgrid.com/).
2.  **Create a Sender Identity:** In your SendGrid dashboard, you must verify an email address or a domain that you will send emails from. Follow their "Sender Authentication" guide.
3.  **Generate an API Key:** In your SendGrid account, go to "Settings" -> "API Keys" and create a new API key with "Full Access" permissions.
4.  **Add the Key in Your Dashboard:** Navigate to **/dashboard/settings/integrations** in your live application and connect SendGrid by providing the API key.

---

## 3. Activate Other Integrations (Via Dashboard)

**Purpose:** To connect other services like data enrichment, print-on-demand, and payment gateways.

**Instructions:**
For each service (Clearbit, Printify, Stripe, etc.), obtain your API key from that service's dashboard, then navigate to **/dashboard/settings/integrations** in your live application and add the key to the corresponding integration.
