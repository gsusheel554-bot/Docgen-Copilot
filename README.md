# DocGen Copilot: Institutional Asset Management AI Hub

DocGen Copilot is a high-performance AI-powered suite designed specifically for asset managers to streamline document analysis and portfolio intelligence. It combines deep document parsing with real-time conversational data analysis.

## 🎯 Problem Statement
Institutional asset managers are inundated with hundreds of pages of financial reports, legal filings, and internal memos daily. Manually extracting key performance indicators (KPIs), assessing strategic risks, and correlating this information with existing portfolio data is time-consuming and prone to human error.

### Target User
- **Portfolio Managers:** Seeking quick executive summaries of new investment memos.
- **Investment Analysts:** Needing to verify metrics against source documents.
- **Compliance Officers:** Reviewing risk mitigation strategies in structured drafts.

## ✨ Solution Overview
DocGen Copilot provides a centralized workspace with three integrated modules:
1. **PDF/Memo Drafting Workspace (Memo Drafting Copilot):** Uses `gemini-3-pro-preview` to parse complex PDFs and text files into structured executive summaries, including automated metric extraction and risk assessment.
2. **Asset Copilot (Chat):** A conversational interface powered by `gemini-3-flash-preview` that allows users to query portfolio data. It supports persistent history (Local Storage) and automatically renders data in Markdown tables or Recharts-powered graphs.
3. **Assets/Portfolio Dashboard:** A visual command center showing total AUM, volatility shifts, and inventory breakdown.

## 🚀 How to Run

### Hosted Requirements
- An active Google Gemini API Key.
- The app expects `process.env.API_KEY` to be available in the environment.
-Here is a **clean, step-by-step guide** 

### Using Google AI Studio for Local Development (Gemini Access)

When developing the application locally, configuring of Gemini API key required to use AI driven functionality.
As a workaround, we use **Google AI Studio**, which allows access through a Google account instead of manually configuring a Gemini API key.

### Step-by-Step Instructions
1. Open the browser and go to:
   **https://ai.studio/apps/drive/1MNFVXA5nJYcpuitPsHBaeFN1JFwmICVk?fullscreenApplet=true**
2. Sign in using your **Google (Gmail) account**.
3. After login, Google may ask for permission to:
   * Access your Google account
   * Connect to Google Drive (if required)
4. Approve the permissions to proceed.
5. A security popup may appear with the message:
   **“This app is from another developer”**
6. Click on **“Continue”** to proceed.
   This is expected behavior when using Google AI Studio for development purposes.
7. Once access is granted, Google AI Studio becomes available for:
   * Prompt testing
   * Model experimentation
   * Local development and prototyping
8. Use this setup during local development instead of manually configuring a Gemini API key.

---

### Important Notes

* This approach is intended for **development and demo purposes**.
* No sensitive user data is stored or shared.
* For production usage, a proper API key setup is recommended.

---


## 🏗️ Architecture
The application follows a clean, frontend-only architecture leveraging the Google GenAI SDK for direct model communication.

```text
[ User Interface (React + Tailwind) ]
          |
          |--- [ Component Layer ]
          |    |-- DraftingRoom (Document Logic)
          |    |-- CopilotChat (Conversation + LocalStorage)
          |    |-- AssetDashboard (Visualization)
          |
          |--- [ Service Layer ]
          |    |-- Gemini API Service (SDK Wrapper)
          |    |-- PDF.js (Text Extraction)
          |
          |--- [ Model Layer ]
               |-- Gemini 3 Pro (High-Reasoning Analysis)
               |-- Gemini 3 Flash (Low-Latency Interaction)
```

## 🛠️ Tech Stack
- **Framework:** React 19 (via ESM)
- **Styling:** Tailwind CSS (Tailwind Labs)
- **AI Engine:** Google Gemini API (`@google/genai`)
- **Data Visualization:** Recharts (D3-based)
- **Document Parsing:** PDF.js (Mozilla)
- **State Management:** React Hooks + LocalStorage Persistence

## 📜 Credits & Reused Code
While the core business logic and integration are original, this project leverages the following:
- **Generative AI:** Powered by Google's Gemini 3 series models.
- **Icons:** SVG paths adapted from **Heroicons** and **Lucide** (SaaS standard icon sets).
- **PDF Extraction:** Text parsing logic follows common implementation patterns for the **Mozilla PDF.js** library.
- **Charts:** Visualizations are implemented using the **Recharts** open-source library.
- **Markdown Handling:** The regex-based markdown and table parser in the chat interface is adapted from common lightweight implementation patterns for converting markdown-style strings to React components.
- **Modules:** Served via [esm.sh](https://esm.sh/) for modern browser-native module loading.

Attaching Sceenshorts:
PFA screenshorts document for reference
[DocGen Copilot Screenshorts.docx](https://github.com/user-attachments/files/24422973/DocGen.Copilot.Screenshorts.docx)

