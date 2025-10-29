# Omarim AI: Deployment Guide

This guide provides the step-by-step instructions to deploy your Omarim AI application to a live, public URL using Firebase.

---

### **Prerequisite: Node.js and npm**
Ensure you have Node.js (which includes npm) installed on your local machine. You can download it from [nodejs.org](https://nodejs.org/).

### **Step 1: Install the Firebase CLI**
The Firebase Command Line Interface (CLI) is the tool you'll use to deploy your app. If you don't have it installed, open your terminal or command prompt and run:

```bash
npm install -g firebase-tools
```

### **Step 2: Log in to Firebase**
Authenticate the CLI with your Google account. This command will open a browser window for you to log in.

```bash
firebase login
```

### **Step 3: Initialize Firebase in Your Project**
Navigate to your project's root directory in the terminal. Since you're using Firebase App Hosting, you just need to initialize it.

```bash
firebase init apphosting
```

Follow the prompts:
1.  When asked `Which Firebase project would you like to associate with this directory?`, select the project ID `studio-9731020287-1911d`.
2.  When asked `What is the name of the backend you'd like to deploy?`, you can press Enter to accept the default or give it a name like `omarim-ai-backend`.
3.  When asked about the region, you can select a region close to your users (e.g., `us-central1`).

This will create a `firebase.json` file configured for App Hosting.

### **Step 4: Build Your Next.js Application**
Before deploying, you need to create a production-ready build of your app. This command compiles and optimizes your Next.js code.

```bash
npm run build
```

This will create an `.next` directory containing the optimized build output.

### **Step 5: Deploy to Firebase**
This is the final step. Run the deploy command. Firebase will automatically read your `firebase.json` and `apphosting.yaml` files, upload your build, and deploy it.

```bash
firebase deploy
```

You'll see output in your terminal as Firebase works:
```text
=== Deploying to 'studio-9731020287-1911d'...

i  deploying apphosting
✔  apphosting: successfully released backend omarim-ai-backend
i  apphosting: If you have a custom domain, you can add it to your site by running: firebase hosting:clone omarim-ai-backend your-site-id

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/studio-9731020287-1911d/overview
Hosting URL: https://[your-backend-name]--[your-project-id].web.app
```

### **Step 6: Visit Your Live App!**
Your app is now live on the internet! You can visit it at the **Hosting URL** provided at the end of the deployment process.

🎉 **Congratulations! Omarim AI is now live!** 🎉
