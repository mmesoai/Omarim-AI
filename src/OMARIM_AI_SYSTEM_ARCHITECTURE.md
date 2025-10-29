
# Omarim AI: System Architecture & Feature Overview

This document provides a comprehensive overview of the Omarim AI platform's architecture, features, and capabilities. It serves as a blueprint for the entire system, from user interaction channels to the underlying AI engine.

---

## 1. Core Concept & Mission

**Mission:** To create a fleet of autonomous, revenue-generating businesses, all managed from a single platform. Each core capability of Omarim AI is designed not just as a tool, but as a sellable product with its own autonomous marketing and sales funnels.

The platform is divided into three main operational layers:
- **Inbound Channels:** How the user gives commands to the AI.
- **Outbound Channels:** How the AI proactively works for the user and its own products.
- **Dashboard Modules:** The user interface for managing the AI and its portfolio of autonomous businesses.

---

## 2. Inbound Channels (User-to-AI Communication)

These are the primary ways a user can interact with and command Omarim AI.

### a. Conversational Chat (`/dashboard/chat`)
- **Function:** A real-time chat interface where users can issue natural language commands.
- **Underlying AI:** Uses the `interpretCommand` flow to understand the user's intent and route it to the correct action.

### b. Voice Command Center (`/dashboard/voice`)
- **Function:** Allows the user to speak commands directly to the AI, which can then execute tasks or respond audibly.
- **Underlying AI:** `convertSpeechToText`, `interpretCommand`, `convertTextToSpeech`.

---

## 3. Outbound Channels & Sellable Products

These are the core autonomous engines of Omarim AI. Each one is a standalone product that the platform can market and sell on its own.

### a. Product: Autonomous Sales Agent (`/dashboard/products`)
- **Service Offered:** An AI agent that finds, qualifies, and engages new business leads 24/7.
- **Autonomous Funnel:** The platform can generate its own marketing assets (landing page, social posts) to sell this service to other businesses using the `generateFeatureMarketingAssets` flow.
- **Core AI Engine:** `autonomousLeadGen` and `initiateOutreach`.

### b. Product: Automated Digital Product Funnel (`/dashboard/products`)
- **Service Offered:** A fully automated service that identifies a trending digital product, generates the content (e.g., an e-book), and creates a complete marketing campaign to sell it.
- **Autonomous Funnel:** The platform generates marketing materials to sell this "business-in-a-box" service.
- **Core AI Engine:** `automatedDigitalProductFunnel`.

### c. Product: AI Calls Agent (`/dashboard/products`)
- **Service Offered:** An AI agent that can understand a business's products and services and handle inbound customer support calls.
- **Autonomous Funnel:** Generates its own marketing assets to sell this AI call center service, powered by the `automatedAiCallingServiceFunnel` flow.
- **Core AI Engine:** `answerCustomerQuery` (using a business blueprint) and `getCall` (to simulate receiving calls).

---

## 4. Dashboard Modules & UI Components

### a. Main Dashboard (`/dashboard`)
- **Function:** A central hub providing an overview of all business activities, including KPIs and revenue charts.

### b. Products (`/dashboard/products`)
- **Function:** The new central hub for managing Omarim's features as sellable products. From here, you can generate marketing assets for any of the platform's core capabilities.

### c. Lead Intelligence (`/dashboard/leads`)
- **Function:** A CRM-style table for managing leads found by the Autonomous Sales Agent.

### d. Outreach Engine (`/dashboard/outreach`)
- **Function:** Manage and create automated email outreach sequences.

### e. AI Social Publisher (`/dashboard/publisher`)
- **Function:** A tool to generate social media content for multiple platforms from a single input.

### f. AI Website/App Builder (`/dashboard/blueprints`)
- **Function:** A powerful tool to generate technical blueprints for new applications or strategic plans for new websites. These blueprints are also used as the knowledge base for the AI Calls Agent.

### g. Inbox & Voice Tools
- **Function:** Utilities for analyzing inbound emails and interacting with the system via voice.

### h. Settings (`/dashboard/settings`)
- **Function:** A page for managing user profile, billing, and all third-party integrations (e-commerce, email, social media, etc.).

---

## 5. AI Engine & Core Flows (`src/ai/`)

This is the "brain" of Omarim AI, containing all the Genkit flows and tools.

- **`generateFeatureMarketingAssets`:** The new core marketing engine that can generate a landing page and social campaign for any feature, turning it into a sellable product.
- **`automatedAiCallingServiceFunnel`:** The autonomous funnel specifically for marketing and selling the AI Calls Agent service.
- **`answerCustomerQuery`:** The core logic for the AI Calls Agent, answering questions based on a provided blueprint.
- **`getCall`:** A tool to simulate receiving an inbound phone call.
- **`autonomousLeadGen`:** Finds and qualifies leads.
- **`automatedDigitalProductFunnel`:** The complete A-to-Z digital product creation and marketing flow.
- **`interpretCommand`:** The core NLU engine for the chat and voice interfaces.
...and all other previously established flows.

    