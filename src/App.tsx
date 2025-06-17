import { useState } from 'react'
import './App.css'

interface PromptRequest {
  systemPrompt: string;
  userPrompt: string;
  inputText: string;
  temperature: number;
  maxTokens: number;
  model: string;
}

interface PromptResponse {
  output: string;
  tokensUsed: number;
  responseTimeMs: number;
  model: string;
}

function App() {
  const [systemPrompt, setSystemPrompt] = useState(`You are a DME (Durable Medical Equipment) data extraction specialist. Extract structured information from clinical notes and format it as JSON with the following fields:
- patient_info: {name, medical_record_number}
- equipment_needed: {device, accessories, pressure_setting}
- medical_data: {ahi_score, severity}
- ordering_physician: {name, specialty}
- insurance: {authorization_required, coverage_status}`);
  
  const [userPrompt, setUserPrompt] = useState('Extract all relevant DME information from the following clinical note:');
  
  const [inputText, setInputText] = useState('Patient needs a CPAP with full face mask and humidifier. AHI > 20. Ordered by Dr. Cameron.');
  
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(500);
  const [model, setModel] = useState('gpt-3.5-turbo');
  
  const [response, setResponse] = useState<PromptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: PromptRequest = {
        systemPrompt,
        userPrompt,
        inputText,
        temperature,
        maxTokens,
        model
      };

      const res = await fetch('http://localhost:3001/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: PromptResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🏥 DME Prompt Tuning Tool</h1>
        <p>Extract structured data from clinical notes using AI</p>
      </header>

      <div className="container">
        <div className="input-section">
          <div className="prompt-inputs">
            <div className="input-group">
              <label htmlFor="system-prompt">System Prompt</label>
              <textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
                placeholder="Enter your system prompt..."
              />
            </div>

            <div className="input-group">
              <label htmlFor="user-prompt">User Prompt</label>
              <textarea
                id="user-prompt"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={2}
                placeholder="Enter your user prompt..."
              />
            </div>

            <div className="input-group">
              <label htmlFor="input-text">Clinical Note Input</label>
              <textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                placeholder="Paste clinical note here..."
              />
            </div>
          </div>

          <div className="parameters">
            <h3>Model Parameters</h3>
            <div className="param-grid">
              <div className="param-group">
                <label htmlFor="model">Model</label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>

              <div className="param-group">
                <label htmlFor="temperature">
                  Temperature: {temperature}
                </label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>

              <div className="param-group">
                <label htmlFor="max-tokens">Max Tokens</label>
                <input
                  id="max-tokens"
                  type="number"
                  min="50"
                  max="2000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </div>

            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '🔄 Processing...' : '🚀 Extract Data'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="output-section">
            <div className="response-header">
              <h3>📤 Structured Output</h3>
              <div className="metrics">
                <span className="metric">
                  🔤 {response.tokensUsed} tokens
                </span>
                <span className="metric">
                  ⏱️ {response.responseTimeMs}ms
                </span>
                <span className="metric">
                  🤖 {response.model}
                </span>
              </div>
            </div>
            <pre className="output">{response.output}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
