import { useState, useEffect } from 'react'
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

interface PromptVariationRequest {
  originalPrompt: string;
  numVariations: number;
  focus?: string;
}

interface PromptVariationResponse {
  variations: string[];
  responseTimeMs: number;
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
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<{[key: string]: any}>({});

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

  const generateVariations = async (basePrompt: string, focus?: string) => {
    setGeneratingVariations(true);
    setError(null);

    try {
      const request: PromptVariationRequest = {
        originalPrompt: basePrompt,
        numVariations: 5,
        focus
      };

      const res = await fetch('http://localhost:3001/api/generate-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: PromptVariationResponse = await res.json();
      
      // Update user prompts with generated variations
      const newPrompts = [...data.variations];
      // Fill remaining slots with empty strings if needed
      while (newPrompts.length < 5) {
        newPrompts.push('');
      }
      setUserPrompts(newPrompts);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setGeneratingVariations(false);
    }
  };

  const saveConfiguration = (name: string) => {
    const config = {
      systemPrompt,
      userPrompts,
      inputText,
      temperature,
      maxTokens,
      model,
      timestamp: new Date().toISOString()
    };
    
    const newConfigs = { ...savedConfigs, [name]: config };
    setSavedConfigs(newConfigs);
    localStorage.setItem('promptConfigs', JSON.stringify(newConfigs));
  };

  const loadConfiguration = (name: string) => {
    const config = savedConfigs[name];
    if (config) {
      setSystemPrompt(config.systemPrompt);
      setUserPrompts(config.userPrompts);
      setInputText(config.inputText);
      setTemperature(config.temperature);
      setMaxTokens(config.maxTokens);
      setModel(config.model);
    }
  };

  const deleteConfiguration = (name: string) => {
    const newConfigs = { ...savedConfigs };
    delete newConfigs[name];
    setSavedConfigs(newConfigs);
    localStorage.setItem('promptConfigs', JSON.stringify(newConfigs));
  };

  const loadExample = () => {
    setSystemPrompt(`You are a DME (Durable Medical Equipment) data extraction specialist. Extract structured information from clinical notes and format it as JSON with the following fields:
- patient_info: {name, medical_record_number}
- equipment_needed: {device, accessories, pressure_setting}
- medical_data: {ahi_score, severity}
- ordering_physician: {name, specialty}
- insurance: {authorization_required, coverage_status}`);
    
    setUserPrompts([
      'Extract all relevant DME information from the following clinical note:',
      'Focus specifically on equipment specifications and medical requirements:',
      'Prioritize insurance authorization and coverage details:',
      'Extract physician information and ordering details:',
      'Identify patient safety requirements and compliance needs:'
    ]);
    
    setInputText(`Patient John Smith (MRN: 12345) requires CPAP therapy with full face mask and heated humidifier. AHI score shows severe sleep apnea at 35 events/hour. Pressure settings should be auto-adjusting 4-20 cmH2O. Patient has Medicare Part B coverage - prior authorization required. Ordered by Dr. Sarah Cameron, Sleep Medicine specialist. Patient education on compliance monitoring completed. Follow-up in 30 days for equipment check.`);
    
    setTemperature(0.1);
    setMaxTokens(600);
    setModel('gpt-3.5-turbo');
  };

  // Load saved configurations on component mount
  useEffect(() => {
    const saved = localStorage.getItem('promptConfigs');
    if (saved) {
      try {
        setSavedConfigs(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved configurations:', error);
      }
    }
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🏥 DME Prompt Tuning Tool</h1>
        <p>Extract structured data from clinical notes using AI</p>
        <button 
          className="example-btn"
          onClick={loadExample}
          type="button"
        >
          🎯 Load Example Configuration
        </button>
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
              
              <div className="variation-generator">
                <h4>🎯 Generate Prompt Variations</h4>
                <p>Automatically create different variations of a base prompt for testing</p>
                <div className="variation-controls">
                  <input
                    type="text"
                    placeholder="Enter a base prompt to generate variations from..."
                    className="base-prompt-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        generateVariations(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="focus-buttons">
                    <button 
                      className="focus-btn"
                      onClick={() => {
                        const input = document.querySelector('.base-prompt-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          generateVariations(input.value.trim(), 'equipment');
                          input.value = '';
                        }
                      }}
                      disabled={generatingVariations}
                      type="button"
                    >
                      🔧 Equipment Focus
                    </button>
                    <button 
                      className="focus-btn"
                      onClick={() => {
                        const input = document.querySelector('.base-prompt-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          generateVariations(input.value.trim(), 'insurance');
                          input.value = '';
                        }
                      }}
                      disabled={generatingVariations}
                      type="button"
                    >
                      💼 Insurance Focus
                    </button>
                    <button 
                      className="focus-btn"
                      onClick={() => {
                        const input = document.querySelector('.base-prompt-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          generateVariations(input.value.trim(), 'physician');
                          input.value = '';
                        }
                      }}
                      disabled={generatingVariations}
                      type="button"
                    >
                      👨‍⚕️ Physician Focus
                    </button>
                    <button 
                      className="focus-btn generate-general"
                      onClick={() => {
                        const input = document.querySelector('.base-prompt-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          generateVariations(input.value.trim());
                          input.value = '';
                        }
                      }}
                      disabled={generatingVariations}
                      type="button"
                    >
                      {generatingVariations ? '🔄 Generating...' : '✨ Generate General'}
                    </button>
                  </div>
                </div>
              </div>
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

          <div className="config-management">
            <h3>💾 Configuration Management</h3>
            <div className="config-controls">
              <div className="save-config">
                <input
                  type="text"
                  placeholder="Configuration name..."
                  className="config-name-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      saveConfiguration(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button 
                  className="save-btn"
                  onClick={() => {
                    const input = document.querySelector('.config-name-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      saveConfiguration(input.value.trim());
                      input.value = '';
                    }
                  }}
                  type="button"
                >
                  💾 Save Current
                </button>
              </div>
              
              {Object.keys(savedConfigs).length > 0 && (
                <div className="saved-configs">
                  <h4>Saved Configurations:</h4>
                  <div className="config-list">
                    {Object.entries(savedConfigs).map(([name, config]) => (
                      <div key={name} className="config-item">
                        <span className="config-name">{name}</span>
                        <span className="config-date">
                          {new Date(config.timestamp).toLocaleDateString()}
                        </span>
                        <div className="config-actions">
                          <button 
                            className="load-btn"
                            onClick={() => loadConfiguration(name)}
                            type="button"
                          >
                            📁 Load
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteConfiguration(name)}
                            type="button"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
