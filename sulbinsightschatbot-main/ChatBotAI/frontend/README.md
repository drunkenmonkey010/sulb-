# Frontend Setup Instructions

## Installation

```bash
cd frontend
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

## Features

✅ **ChatGPT-like UI**
- Responsive sidebar with chat history
- Fixed header with "New Chat" button
- Fixed footer with input area
- Auto-scrolling messages

✅ **Query Processing**
- Send natural language questions
- Real-time AI responses
- Loading indicators

✅ **Data Visualization**
- Automatic chart generation
- Embedded in chat messages
- Download as PNG

✅ **File Downloads**
- Download Excel files
- Download charts
- One-click exports

✅ **User Experience**
- Dark mode toggle
- Chat history management
- Copy response button
- Delete chat option
- Search chats

## Backend Integration

Make sure your FastAPI backend is running:

```powershell
# In the main directory
python main.py
```

The frontend will automatically connect to `http://localhost:8000`

## Customization

- Colors: Edit `tailwind.config.js`
- Layout: Modify component CSS in components
- API endpoints: Update fetch calls in `Message.jsx` and `ChatInput.jsx`

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder
