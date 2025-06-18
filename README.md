# 🏥 DME Prompt Tuning Tool

A modern web application for experimenting with AI prompt tuning to extract structured data from clinical notes for DME (Durable Medical Equipment) healthcare providers.

## 🚀 Features

- **🧠 Multi-Prompt Engineering**: Create and test up to 5 different user prompts simultaneously
- **⚡ Individual & Batch Processing**: Submit prompts individually or all at once for comparison
- **📊 Side-by-Side Results**: Compare outputs from different prompts in a responsive grid layout
- **✨ AI-Powered Prompt Generation**: Automatically generate prompt variations with different focus areas
- **🎯 Intelligent Scoring System**: Automatically evaluate response quality with 0-100 scoring
- **🏆 Best Response Identification**: Automatically highlights the highest-scoring response
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

### Response Scoring System (0-100 Points)
The built-in scoring system automatically evaluates how well each response matches your desired result:

**Scoring Breakdown:**
- **Device (20 pts)**: Correctly identifies the medical device (e.g., "CPAP")
- **Mask Type (20 pts)**: Accurately extracts mask specifications (e.g., "full face")
- **Add-ons (20 pts)**: Identifies required accessories (e.g., "humidifier")
- **Qualifier (20 pts)**: Captures medical qualifiers (e.g., "AHI > 20")
- **Ordering Provider (20 pts)**: Extracts physician information (e.g., "Dr. Cameron")
- **Structure Bonus (10 pts)**: Extra points for well-formatted JSON output

**Default Configuration:**
```json
{
  "device": "CPAP",
  "mask_type": "full face", 
  "add_ons": ["humidifier"],
  "qualifier": "AHI > 20",
  "ordering_provider": "Dr. Cameron"
}
```

**How to Use:**
1. Configure your desired result parameters
2. Submit multiple prompts for testing
3. Click "📊 Score All Responses" 
4. View scores and identify the 🏆 highest-scoring response
5. Toggle between scored and original views

### Example Use Cases
- **Prompt A**: Focus on equipment specifications
- **Prompt B**: Prioritize insurance and authorization details  
- **Prompt C**: Extract physician and ordering information
- **Prompt D**: Identify safety and compliance requirements
- **Prompt E**: Comprehensive data extraction

This allows you to quickly iterate and find the most effective prompt for your specific DME data extraction needs.

## 🔧 API Endpoints

- `POST /api/prompt` - Process individual prompts and return structured data
- `POST /api/generate-variations` - Generate AI-powered prompt variations
- `POST /api/score-responses` - Score responses against desired results
- `GET /health` - Server health check

## 🚨 Troubleshooting

**Server won't start?**
- Check if ports 3001 (backend) and 5173 (frontend) are available
- Run `npm install` in both root and server directories

**OpenAI API not working?**
- Ensure your API key is set in `.env`: `OPENAI_API_KEY=sk-your-key-here`
- Check your OpenAI account has sufficient credits
- The app works in demo mode without an API key

**Scoring not working?**
- Make sure you have responses before scoring
- Check that the desired result configuration matches your expected format

## 🏗️ Technical Architecture

**Frontend Stack:**
- React 19 + TypeScript
- Vite for fast development
- CSS Grid for responsive layouts
- localStorage for configuration persistence

**Backend Stack:**
- Node.js + Express + TypeScript
- OpenAI Chat Completions API
- CORS enabled for development
- Environment-based configuration

## 📊 Scoring Algorithm

The scoring system uses a weighted approach:
1. **Exact matches** get full points (20 each)
2. **Partial matches** get reduced points (10-15)
3. **Structure bonus** rewards valid JSON (10 points)
4. **Total score** capped at 100 for clarity

This provides objective comparison of prompt effectiveness!

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

Then the logic around using the real OPENAI endpoint was update, and a key can be added to the /server/.env file for testing.
prompt: Add the typescript interface for OpenAIChatCompletionResponse and handle the response as that

Additional clause prompts were used to generate bonus features.
- Allow up to five different user prompts to be added, and then each request submitted seperately to the API and all five results shown side by side
- Create a new simple openAI endpoint that uses simple chat completions to generate variations on prompts
- Create a scoring mechanism (0-100) to evaluate which response is closest to the desired result. Show which response scored the highest. use "{
"device": "CPAP",
"mask_type": "full face",
"add_ons": ["humidifier"],
"qualifier": "AHI > 20",
"ordering_provider": "Dr. Cameron"
}
" as the initial configuration for the desired result.

The configuration management piece was added by the AI without specific prompting.  

An additional roadmap, is to have this tool to score the results, and use that data to self-train the "variations".  Variations in temperature and model could be done as well, and some cost analysis added It could then iterate thought multiple runs, and eventually end up with a best result.
