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

interface MultiPromptResponse extends PromptResponse {
  promptIndex: number;
  userPrompt: string;
}

function App() {
  const [systemPrompt, setSystemPrompt] = useState(`You are a DME (Durable Medical Equipment) data extraction specialist. Extract structured information from clinical notes and format it as JSON with the following fields:
- patient_info: {name, medical_record_number}
- equipment_needed: {device, accessories, pressure_setting}
- medical_data: {ahi_score, severity}
- ordering_physician: {name, specialty}
- insurance: {authorization_required, coverage_status}`);
  
  const [userPrompts, setUserPrompts] = useState([
    'Extract all relevant DME information from the following clinical note:',
    'Focus on equipment specifications and medical requirements:',
    'Prioritize insurance and authorization details:',
    'Extract physician and ordering information:',
    'Identify patient safety and compliance requirements:'
  ]);
  
  const [inputText, setInputText] = useState('Patient needs a CPAP with full face mask and humidifier. AHI > 20. Ordered by Dr. Cameron.');
  
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(500);
  const [model, setModel] = useState('gpt-3.5-turbo');
  
  const [responses, setResponses] = useState<MultiPromptResponse[]>([]);
  const [loading, setLoading] = useState<boolean[]>([false, false, false, false, false]);
  const [error, setError] = useState<string | null>(null);

  const updateUserPrompt = (index: number, value: string) => {
    const newPrompts = [...userPrompts];
    newPrompts[index] = value;
    setUserPrompts(newPrompts);
  };

  const handleSubmit = async (promptIndex: number) => {
    const newLoading = [...loading];
    newLoading[promptIndex] = true;
    setLoading(newLoading);
    setError(null);
    
    try {
      const request: PromptRequest = {
        systemPrompt,
        userPrompt: userPrompts[promptIndex],
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
      
      const multiResponse: MultiPromptResponse = {
        ...data,
        promptIndex,
        userPrompt: userPrompts[promptIndex]
      };

      setResponses(prev => {
        const newResponses = prev.filter(r => r.promptIndex !== promptIndex);
        return [...newResponses, multiResponse].sort((a, b) => a.promptIndex - b.promptIndex);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      const newLoading = [...loading];
      newLoading[promptIndex] = false;
      setLoading(newLoading);
    }
  };

  const handleSubmitAll = async () => {
    for (let i = 0; i < userPrompts.length; i++) {
      if (userPrompts[i].trim()) {
        await handleSubmit(i);
        // Small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
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
              <label htmlFor="user-prompts">User Prompts (up to 5)</label>
              {userPrompts.map((prompt, index) => (
                <div key={index} className="user-prompt-row">
                  <textarea
                    value={prompt}
                    onChange={(e) => updateUserPrompt(index, e.target.value)}
                    rows={2}
                    placeholder={`User prompt ${index + 1}...`}
                  />
                  <button 
                    className="submit-individual-btn"
                    onClick={() => handleSubmit(index)}
                    disabled={loading[index] || !prompt.trim()}
                    type="button"
                  >
                    {loading[index] ? '🔄' : '🚀'}
                  </button>
                </div>
              ))}
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

            <div className="submit-buttons">
              <button 
                className="submit-btn submit-all"
                onClick={handleSubmitAll}
                disabled={loading.some(l => l)}
                type="button"
              >
                {loading.some(l => l) ? '🔄 Processing...' : '🚀 Submit All Prompts'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {responses.length > 0 && (
          <div className="results-grid">
            <h2 className="results-title">📤 Comparison Results</h2>
            <div className="responses-container">
              {responses.map((response) => (
                <div key={response.promptIndex} className="response-card">
                  <div className="response-header">
                    <h3>Prompt {response.promptIndex + 1}</h3>
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
                  <div className="user-prompt-display">
                    <strong>User Prompt:</strong> {response.userPrompt}
                  </div>
                  <pre className="output">{response.output}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
