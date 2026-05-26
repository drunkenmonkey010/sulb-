# SULB Insight AI Chatbot

An AI-powered chatbot and document intelligence platform built using **FastAPI**, **React**, **LangChain**, **FAISS**, and **Google Gemini**.

This project enables intelligent querying, semantic document search, and Retrieval-Augmented Generation (RAG) for structured and unstructured datasets.

---

# Features

- AI chatbot powered by Google Gemini
- Retrieval-Augmented Generation (RAG)
- Semantic document search using FAISS
- BigQuery data integration
- FastAPI backend
- React + Vite frontend
- Interactive data visualization
- Modular backend architecture
- REST API support
- Team collaboration workflow using GitHub

---

# Tech Stack

## Frontend
- React
- Vite
- JavaScript
- Tailwind CSS

## Backend
- FastAPI
- LangChain
- FAISS
- NumPy
- Uvicorn
- Python

## AI / ML
- Google Gemini API
- Vector embeddings
- Semantic retrieval pipeline

---

# Project Structure

```text
sulbinsightschatbot-main/
│
├── .gitignore
├── README.md
│
└── ChatBotAI/
    │
    ├── backend/
    │   │
    │   ├── prompts.md
    │   ├── requirments.txt
    │   │
    │   ├── app/
    │   │   │
    │   │   ├── main.py
    │   │   ├── users.json
    │   │   ├── documents.pkl
    │   │   ├── embeddings.npy
    │   │   ├── faiss_index.bin
    │   │   │
    │   │   ├── api/
    │   │   │   └── chat.py
    │   │   │
    │   │   ├── core/
    │   │   │   ├── bigquery_data.py
    │   │   │   ├── bigquery_fetching.py
    │   │   │   ├── config.py
    │   │   │   ├── hybrid_llm_chain.py
    │   │   │   ├── hybrid_template.py
    │   │   │   ├── llm_chain.py
    │   │   │   ├── prompt_template.py
    │   │   │   ├── GNX_Data_070426.xlsx
    │   │   │   └── credentials/
    │   │   │
    │   │   ├── executor/
    │   │   │   ├── executor.py
    │   │   │   ├── new_executor.py
    │   │   │   └── validator.py
    │   │   │
    │   │   ├── schemas/
    │   │   │   └── chat_schemas.py
    │   │   │
    │   │   └── services/
    │   │       ├── hybrid_aggregate.py
    │   │       └── llm_service.py
    │   │
    │   └── docker/
    │       └── Dockerfile
    │
    └── frontend/
        │
        ├── package.json
        ├── vite.config.js
        ├── tailwind.config.js
        ├── postcss.config.js
        ├── index.html
        │
        ├── public/
        │   └── images/
        │       └── iris-logo.png
        │
        └── src/
            │
            ├── App.jsx
            ├── main.jsx
            │
            ├── components/
            │   ├── ChartRenderer.jsx
            │   ├── ChatArea.jsx
            │   ├── ChatInput.jsx
            │   ├── Header.jsx
            │   ├── LoginCreation.jsx
            │   ├── Message.jsx
            │   ├── Sidebar.jsx
            │   ├── Visualization.jsx
            │   └── WelcomeScreen.jsx
            │
            ├── context/
            │   └── ThemeContext.jsx
            │
            └── styles/
                └── index.css
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/drunkenmonkey010/sulb-.git
```

```bash
cd sulb-
```

---

# Frontend Setup

```bash
cd ChatBotAI/frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Backend Setup

Open a new terminal:

```bash
cd ChatBotAI/backend
```

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirments.txt
```

---

## Run Backend

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

# Environment Variables

Create a `.env` file inside:

```text
ChatBotAI/backend/
```

Example:

```env
GEMINI_API_KEY=your_api_key
GEMINI_RAG_KEY=your_api_key
```

---

# Credentials

Google Cloud service account credentials are NOT included in this repository for security reasons.

Create this folder locally if needed:

```text
backend/app/core/credentials/
```

Place your own credential JSON files inside the folder.

---

# Git Workflow

## Pull Latest Changes

```bash
git pull origin develop
```

---

## Push Changes

```bash
git add .
git commit -m "your message"
git push
```

---

# Team Collaboration

Main development branch:

```text
develop
```

Create feature branches using:

```bash
git checkout -b feature-name
```

---

# Security Notes

- API keys are excluded using `.gitignore`
- Credentials folder is ignored
- Sensitive files are not committed
- Large vector files should preferably remain local

---

# Future Improvements

- User authentication
- Chat history persistence
- Multi-document upload support
- Streaming responses
- Docker deployment
- Cloud deployment
- Advanced analytics dashboard

---

# Contributors

- SULB Insight AI Team

---

# License

This project is intended for educational and research purposes.
