# ✨ StudySpark – AI Study Notes Summarizer

**StudySpark** is an AI-powered web application that transforms lengthy study notes into clear, structured and easy-to-understand summaries. It helps students save time, identify important concepts and prepare for quick revision.

## 🚀 Live Demo

[Open StudySpark](https://studyspark-gamma.vercel.app/)

##  Project Overview

Students often work with lengthy notes and study materials, making revision time-consuming. StudySpark simplifies this process by allowing users to paste their study notes and generate organized summaries using Google's Gemini API.

The application presents the generated content in a readable format and supports streaming responses so users can see the summary as it is generated.

##  Objectives

- Simplify lengthy study materials.
- Generate structured and readable summaries.
- Highlight important concepts and information.
- Provide a simple and user-friendly interface.
- Reduce the time required for revision.

##  Features

- **AI-Powered Summarization:** Converts lengthy notes into concise summaries.
- **Structured Output:** Organizes summaries into Overview, Key Points, Important Terms and Definitions, and Quick Revision.
- **Streaming Responses:** Displays generated content progressively.
- **Character Limit:** Supports up to 12,000 characters per input.
- **Loading Indicators:** Displays progress while generating summaries.
- **Error Handling:** Provides helpful messages for invalid inputs and API errors.
- **Copy Summary:** Allows users to copy generated content.
- **Clear All:** Clears the input and generated summary.

##  Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | UI styling |
| Google Gemini API | AI-powered summarization |
| Node.js | Backend execution environment |
| Vercel | Application deployment |

##  Application Workflow

1. User opens the StudySpark application.
2. User pastes study notes into the input area.
3. The application validates the input.
4. Notes are sent to the backend API.
5. The backend sends the notes to the Gemini API.
6. Gemini generates a structured summary.
7. The response is streamed to the frontend.
8. The user can copy or clear the generated summary.

##  Project Structure

```text
studyspark/
│
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── public/
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── .gitignore
└── README.md
```

##  Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project folder

```bash
cd studyspark
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root directory.

Add the following:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

Replace the placeholder with your actual Gemini API key.

**Important:** Never upload your actual API key to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Security

- Gemini API requests are handled through a backend API route.
- API credentials are stored in environment variables.
- Secret environment files are excluded from Git using `.gitignore`.

##  Deployment

StudySpark is deployed using Vercel.

**Live Application:**  
https://studyspark-gamma.vercel.app/

##  Future Enhancements

- Support for PDF and document uploads.
- Multiple summary lengths.
- Download summaries as PDF.
- Support for multiple languages.
- Additional AI model integrations.
- Improved summarization and revision features.

##  Conclusion

StudySpark provides a simple and efficient way to convert lengthy study notes into organized summaries. By integrating AI-powered text generation with a user-friendly web interface, the application aims to make learning and revision more convenient for students.

---

**StudySpark – Learn Smarter, Not Harder. ✨**
