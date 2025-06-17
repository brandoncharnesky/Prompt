# 🏥 DME Prompt Tuning Tool

A modern web application for experimenting with AI prompt tuning to extract structured data from clinical notes for DME (Durable Medical Equipment) healthcare providers.

## 🚀 Features

- **🧠 Intelligent Prompt Engineering**: Input system and user prompts for optimal data extraction
- **🧾 Clinical Note Processing**: Paste messy clinical notes and get structured JSON output
- **🛠️ Model Parameter Tuning**: Adjust temperature, max tokens, and model selection
- **🤖 Multi-LLM Support**: Compatible with OpenAI GPT models (with easy extension to other providers)
- **📊 Performance Metrics**: Real-time token usage and response time tracking
- **💻 Modern UI**: Beautiful, responsive interface designed for healthcare professionals
- **🔄 Real-time Testing**: Instant feedback for prompt optimization

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Usage

1. **Install dependencies**:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Start Development**:
   ```bash
   # Run both frontend and backend
   npm run start:full

   # Or run separately:
   npm run dev          # Frontend (localhost:5173)
   npm run dev:server   # Backend (localhost:3001)
   ```

3. **Open the app**: Navigate to `http://localhost:5173`

The app runs in demo mode by default with mock responses - no API keys required!

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
