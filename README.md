# 🏥 DME Prompt Tuning Tool

A modern web application for experimenting with AI prompt tuning to extract structured data from clinical notes for DME (Durable Medical Equipment) healthcare providers.

## 🚀 Features

- **🧠 Multi-Prompt Engineering**: Create and test up to 5 different user prompts simultaneously
- **⚡ Individual & Batch Processing**: Submit prompts individually or all at once for comparison
- **📊 Side-by-Side Results**: Compare outputs from different prompts in a responsive grid layout
- **✨ AI-Powered Prompt Generation**: Automatically generate prompt variations with different focus areas
- **💾 Configuration Management**: Save and load prompt configurations for repeated testing
- **🎯 Quick Examples**: Load pre-configured examples to get started quickly
- **🧾 Clinical Note Processing**: Paste messy clinical notes and get structured JSON output
- **🛠️ Model Parameter Tuning**: Adjust temperature, max tokens, and model selection
- **🤖 Multi-LLM Support**: Compatible with OpenAI GPT models (with easy extension to other providers)
- **📈 Performance Metrics**: Real-time token usage and response time tracking for each prompt
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

## 💡 Usage Guide

### Quick Start
1. **Load Example**: Click "🎯 Load Example Configuration" to see the tool in action
2. **Test Prompts**: Use individual 🚀 buttons or "Submit All" to compare results

### Multi-Prompt Testing
1. **Configure System Prompt**: Set your base instructions for the AI
2. **Create User Prompts**: Enter up to 5 different user prompts to test various approaches
3. **Input Clinical Data**: Paste your clinical notes in the input field
4. **Adjust Parameters**: Fine-tune temperature, max tokens, and model selection
5. **Submit & Compare**: 
   - Click individual 🚀 buttons to test specific prompts
   - Use "Submit All Prompts" to run all prompts for comparison
6. **Analyze Results**: View side-by-side outputs with performance metrics

### AI-Powered Prompt Generation
1. **Enter Base Prompt**: Type a starting prompt in the variation generator
2. **Choose Focus**: Select specialized focus areas:
   - 🔧 **Equipment Focus**: Emphasize medical equipment details
   - 💼 **Insurance Focus**: Prioritize authorization and coverage
   - 👨‍⚕️ **Physician Focus**: Extract ordering physician information
   - ✨ **General**: Create diverse general-purpose variations
3. **Auto-Fill**: Generated variations automatically populate your prompt slots

### Configuration Management
- **💾 Save Configurations**: Name and save your current prompt setup
- **📁 Load Configurations**: Quickly restore previously saved configurations
- **🗑️ Delete**: Remove configurations you no longer need

### Example Use Cases
- **Prompt A**: Focus on equipment specifications
- **Prompt B**: Prioritize insurance and authorization details  
- **Prompt C**: Extract physician and ordering information
- **Prompt D**: Identify safety and compliance requirements
- **Prompt E**: Comprehensive data extraction

This allows you to quickly iterate and find the most effective prompt for your specific DME data extraction needs.

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


This project was created using Claude Sonnet 4 with an initial prompt of:

#new You’re the newest AI engineer on a fast-moving DME healthcare team. Doctors are sending in messy clinical notes like:
“Patient needs a CPAP with full face mask and humidifier. AHI > 20. Ordered by Dr. Cameron.”
Your mission: extract structured data using an LLM, and build a mini tool to help you experiment with prompt tuning.
⏱️ The Challenge (Timebox: 1 Hour)
Build a lightweight tool (web or CLI) that lets a user:
•	🧠 Input a system + user prompt
•	🧾 Paste a sample input text
•	🛠️ Tweak a few model parameters (e.g., temperature, max_tokens)
•	🤖 Send it to the LLM
•	📤 Display the structured output
•	📊 Show token usage + response time
