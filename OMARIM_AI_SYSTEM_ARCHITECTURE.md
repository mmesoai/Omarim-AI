
# Omarim AI: System Architecture & Feature Overview

This document provides a comprehensive overview of the Omarim AI platform's architecture, features, and capabilities. It serves as a blueprint for the entire system, from user interaction channels to the underlying AI engine.

---

## 1. Core Concept & Mission

**Mission:** To act as an autonomous business development partner, automating tasks like lead generation, e-commerce sourcing, and content creation to help users grow their business with minimal human intervention.

The platform is divided into three main operational layers:
- **Inbound Channels:** How the user gives commands to the AI.
- **Outbound Channels:** How the AI proactively works for the user.
- **Dashboard Modules:** The user interface for managing the AI and viewing results.

---

## 2. Inbound Channels (User-to-AI Communication)

These are the primary ways a user can interact with and command Omarim AI.

### a. Conversational Chat (`/dashboard/chat`)
- **Function:** A real-time chat interface where users can issue natural language commands.
- **Underlying AI:** Uses the `interpretCommand` flow to understand the user's intent and route it to the correct action (e.g., generate content, navigate to a page, execute a campaign).
- **Outputs:** Can display simple text answers, structured results (like a generated social post), or trigger navigation to other parts of the app.

### b. Voice Command Center (`/dashboard/voice`)
- **Function:** Allows the user to speak commands directly to the AI.
- **Underlying AI:**
    - `convertSpeechToText`: Transcribes the user's spoken audio into text.
    - `interpretCommand`: Understands the transcribed command.
    - `convertTextToSpeech`: The AI can respond or read text aloud using a generated voice.
- **Outputs:** Executes commands and can provide an audible response.

### c. Quick Action Button (Global)
- **Function:** A floating action button on the dashboard that allows users to quickly issue a command from anywhere in the app.
- **Underlying AI:** Captures the command and forwards it to the main chat interface for interpretation and execution.

---

## 3. Outbound Channels (AI-to-World Autonomous Actions)

These are the proactive, autonomous engines where Omarim AI works on behalf of the user.

### a. Autonomous Business Agent (`/dashboard/agent`)
- **Function:** Finds and qualifies new business leads based on a high-level objective (e.g., "Find 5 local businesses that need a new website").
- **Underlying AI:**
    - `autonomousLeadGen`: Interprets the objective and uses the `findAndQualifyLeads` tool.
    - `findAndQualifyLeads`: Generates plausible, fictional leads and provides a reason for qualification.
    - `initiateOutreach`: Saves the qualified lead to the database, generates a personalized email, and simulates sending it.
- **Outputs:** A list of qualified leads, which can be engaged with a single click.

### b. Automated Digital Product Funnel (`/dashboard/digital-products`)
- **Function:** A fully automated weekly or on-demand workflow that finds, creates, and markets a new digital product.
- **Underlying AI:**
    - `automatedDigitalProductFunnel`: The master flow that orchestrates the entire process.
    - `findTrendingDigitalProduct`: Identifies a trending digital product idea.
    - `generateDigitalProduct`: Creates the actual content for the product (e.g., writes an e-book).
    - `generateLandingPage`: Generates the HTML for a dedicated product landing page.
    - `generateMultipleSocialPosts`: Creates a social media campaign to market the product.
- **Outputs:** A new product, a landing page, and a multi-platform marketing campaign, all generated autonomously.

### c. E-commerce Product Sourcing (`/dashboard/stores`)
- **Function:** The AI analyzes product categories to identify trending physical products and generate marketing campaigns.
- **Underlying AI:**
    - `findTrendingProducts`: Finds a single trending product, a potential (fictional) supplier, and a marketing angle.
    - `generateProductCampaign`: Takes product details and generates a full marketing campaign, including social posts, an AI-generated image, and a video concept.
- **Integrations:** Designed to connect with e-commerce platforms like Shopify, WooCommerce, and print-on-demand services like Printify.
- **Outputs:** A complete marketing campaign for a new product, ready for review and launch.

---

## 4. Dashboard Modules & UI Components

### a. Main Dashboard (`/dashboard`)
- **Function:** A central hub providing a high-level overview of all business activities.
- **Components:**
    - **KPI Cards:** Show key metrics like Total Leads, Synced Products, and Active Campaigns.
    - **Outbound Engine:** A unified card representing the AI's autonomous lead and product sourcing capabilities.
    - **AI Approval Request:** A card that appears when the AI needs human confirmation to proceed with an action (e.g., launching a campaign).
    - **Revenue Overview & Recent Activity:** Charts and feeds that visualize financial data and recent system actions.
    - **Lead Intelligence Chart:** A pie chart showing the status distribution of the lead pipeline.

### b. Lead Intelligence (`/dashboard/leads`)
- **Function:** A real-time table displaying all leads from the Firestore database.
- **Features:** Shows lead name, company, email, and status. Allows users to initiate outreach to a lead, which updates their status and triggers an AI-generated email.

### c. Outreach Engine (`/dashboard/outreach`)
- **Function:** Manage and create automated email outreach sequences.
- **Features:** Users can create new multi-step email campaigns. The UI displays key performance metrics like open rate and reply rate for each sequence.

### d. AI Social Publisher (`/dashboard/publisher`)
- **Function:** A tool to generate social media content for multiple platforms from a single input (text, topic, or YouTube URL).
- **Features:** Creates tailored posts for Twitter, LinkedIn, and Facebook, complete with relevant hashtags.

### e. App Builder (`/dashboard/app-builder`)
- **Function:** An AI-powered tool to generate a professional technical blueprint for a new application idea.
- **Features:** Takes a user's app description and outputs a full specification, including core features, data models, user personas, and a recommended tech stack.

### f. Website Blueprint (`/dashboard/website-blueprint`)
- **Function:** An AI-powered tool to generate a professional website blueprint from a business description.
- **Features:** Takes a user's business idea and outputs a site name, tagline, domain suggestion, and a full sitemap with page descriptions.

### g. Inbox (`/dashboard/inbox`)
- **Function:** A mock email client to view and analyze inbound replies.
- **Underlying AI:** `classifyInboundReply` flow analyzes each email to determine its sentiment, category, and relevant tags, which are displayed to the user.

### h. Settings (`/dashboard/settings`)
- **Function:** A page for managing user profile, billing information, and third-party integrations.
- **Features:** Allows users to connect e-commerce stores (Shopify, WooCommerce, Printify), payment gateways (Stripe, PayPal), email services (SendGrid, Gmail), and social media accounts.

---

## 5. AI Engine & Core Flows (`src/ai/`)

This is the "brain" of Omarim AI, containing all the Genkit flows and tools that power the platform's features.

- **`autonomousLeadGen`:** Finds and qualifies leads.
- **`initiateOutreach`:** Saves a lead and sends the first email.
- **`automatedDigitalProductFunnel`:** The complete A-to-Z digital product creation and marketing flow.
- **`generateProductCampaign`:** Creates a full marketing campaign for a product.
- **`findTrendingProducts`:** Identifies trending physical products.
- **`generateProductIdeas`:** Brainstorms new product ideas from a topic.
- **`interpretCommand`:** The core NLU engine for the chat and voice interfaces.
- **`generateMultipleSocialPosts`:** Repurposes content for different social platforms.
- **`generateAppBlueprint`:** Creates a technical spec from an app idea.
- **`generateSiteBlueprint`:** Creates a website plan from a business idea.
- **`classifyInboundReply`:** Analyzes inbound emails for sentiment and category.
- **`convertSpeechToText` & `convertTextToSpeech`:** The core voice interaction tools.
- **`getOmarimAiCapabilities`:** A tool that allows the AI to be self-aware of its own features, which it uses to answer questions about itself.
