import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

interface ScoredPromptResponse extends PromptResponse {
  score: number;
  scoreBreakdown: {
    device: number;
    maskType: number;
    addOns: number;
    qualifier: number;
    orderingProvider: number;
    structureBonus: number;
    total: number;
  };
}

interface DesiredResult {
  device: string;
  mask_type: string;
  add_ons: string[];
  qualifier: string;
  ordering_provider: string;
}

interface ScoreRequest {
  responses: PromptResponse[];
  desiredResult: DesiredResult;
}

// OpenAI Chat Completion API response interface
// Based on https://platform.openai.com/docs/api-reference/chat/object
interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Mock LLM function for demonstration
async function callLLM(request: PromptRequest): Promise<PromptResponse> {
  const startTime = Date.now();
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock structured output for clinical notes
  const mockOutput = {
    patient_info: {
      name: "Patient Name",
      medical_record_number: "MRN-12345"
    },
    equipment_needed: {
      device: "CPAP Machine",
      accessories: ["Full Face Mask", "Humidifier"],
      pressure_setting: "Auto-adjusting"
    },
    medical_data: {
      ahi_score: "> 20",
      severity: "Severe Sleep Apnea"
    },
    ordering_physician: {
      name: "Dr. Cameron",
      specialty: "Sleep Medicine"
    },
    insurance: {
      authorization_required: true,
      coverage_status: "Pending verification"
    }
  };
  
  const responseTime = Date.now() - startTime;
  const estimatedTokens = Math.floor(request.inputText.length / 4) + Math.floor(JSON.stringify(mockOutput).length / 4);
  
  return {
    output: JSON.stringify(mockOutput, null, 2),
    tokensUsed: estimatedTokens,
    responseTimeMs: responseTime,
    model: request.model
  };
}

// Real OpenAI integration (commented out for demo)
async function callOpenAI(request: PromptRequest): Promise<PromptResponse> {
  const startTime = Date.now();
  
  try {
    // Uncomment and configure for real OpenAI usage
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: `${request.userPrompt}\n\nInput: ${request.inputText}` }
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIChatCompletionResponse = await response.json() as OpenAIChatCompletionResponse;
    const responseTime = Date.now() - startTime;
    
    return {
      output: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 0,
      responseTimeMs: responseTime,
      model: request.model
    };

    // For now, use mock implementation
    //return await callLLM(request);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to call OpenAI API');
  }
}

app.post('/api/prompt', async (req, res) => {
  try {
    const request: PromptRequest = req.body;
    
    // Validate request
    if (!request.systemPrompt || !request.userPrompt || !request.inputText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use OpenAI if API key is provided, otherwise use mock
    const response = process.env.OPENAI_API_KEY 
      ? await callOpenAI(request)
      : await callLLM(request);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

interface PromptVariationRequest {
  originalPrompt: string;
  numVariations: number;
  focus?: string; // Optional focus area like "equipment", "insurance", "physician", etc.
}

interface PromptVariationResponse {
  variations: string[];
  responseTimeMs: number;
}

// Generate prompt variations using OpenAI
async function generatePromptVariations(request: PromptVariationRequest): Promise<PromptVariationResponse> {
  const startTime = Date.now();
  
  if (!process.env.OPENAI_API_KEY) {
    // Mock variations for development
    const mockVariations = [
      `Extract ${request.focus || 'all relevant'} DME information with focus on clinical details from the following note:`,
      `Analyze the clinical note and identify ${request.focus || 'key'} DME requirements and specifications:`,
      `Parse the medical documentation for ${request.focus || 'essential'} equipment and patient information:`,
      `Review the clinical note and extract ${request.focus || 'critical'} DME data in structured format:`,
      `Process the healthcare document to identify ${request.focus || 'important'} medical equipment needs:`
    ];
    
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return {
      variations: mockVariations.slice(0, request.numVariations),
      responseTimeMs: Date.now() - startTime
    };
  }

  try {
    const focusText = request.focus ? ` with a focus on ${request.focus}` : '';
    const systemPrompt = `You are a prompt engineering specialist for healthcare AI applications. Your task is to generate ${request.numVariations} different variations of a user prompt for extracting DME (Durable Medical Equipment) information from clinical notes.

Each variation should:
- Use different phrasing and approach
- Maintain the same core objective
- Be clear and specific
- Be suitable for healthcare data extraction${focusText}

Return only the variations, one per line, without numbering or additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create ${request.numVariations} variations of this prompt: "${request.originalPrompt}"` }
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIChatCompletionResponse = await response.json() as OpenAIChatCompletionResponse;
    const variations = data.choices[0]?.message?.content?.split('\n').filter(line => line.trim()) || [];
    
    return {
      variations: variations.slice(0, request.numVariations),
      responseTimeMs: Date.now() - startTime
    };

  } catch (error) {
    console.error('Error generating prompt variations:', error);
    throw new Error('Failed to generate prompt variations');  }
}

// Scoring mechanism to evaluate response quality
function scoreResponse(response: PromptResponse, desiredResult: DesiredResult): ScoredPromptResponse {
  let parsedOutput: any;
  
  try {
    parsedOutput = JSON.parse(response.output);
  } catch (error) {
    // If not valid JSON, try to extract key information from text
    parsedOutput = extractFromText(response.output);
  }
  
  const scores = {
    device: 0,
    maskType: 0,
    addOns: 0,
    qualifier: 0,
    orderingProvider: 0,
    structureBonus: 0,
    total: 0
  };
  
  // Device scoring (20 points max)
  const deviceValue = extractValue(parsedOutput, ['device', 'equipment', 'equipment_needed.device', 'medical_equipment']);
  if (deviceValue && deviceValue.toLowerCase().includes(desiredResult.device.toLowerCase())) {
    scores.device = 20;
  } else if (deviceValue && (deviceValue.toLowerCase().includes('cpap') || deviceValue.toLowerCase().includes('sleep'))) {
    scores.device = 10;
  }
  
  // Mask type scoring (20 points max)
  const maskValue = extractValue(parsedOutput, ['mask_type', 'mask', 'equipment_needed.accessories', 'accessories']);
  if (maskValue && maskValue.toLowerCase().includes('full face')) {
    scores.maskType = 20;
  } else if (maskValue && maskValue.toLowerCase().includes('mask')) {
    scores.maskType = 10;
  }
  
  // Add-ons scoring (20 points max)
  const addOnsValue = extractValue(parsedOutput, ['add_ons', 'accessories', 'equipment_needed.accessories']);
  if (addOnsValue) {
    const addOnsText = Array.isArray(addOnsValue) ? addOnsValue.join(' ') : addOnsValue.toString();
    if (addOnsText.toLowerCase().includes('humidifier')) {
      scores.addOns = 20;
    } else if (addOnsText.toLowerCase().includes('humid') || addOnsText.toLowerCase().includes('moisture')) {
      scores.addOns = 10;
    }
  }
  
  // Qualifier scoring (20 points max)
  const qualifierValue = extractValue(parsedOutput, ['qualifier', 'ahi', 'medical_data.ahi_score', 'ahi_score', 'severity']);
  if (qualifierValue && qualifierValue.toString().includes('> 20')) {
    scores.qualifier = 20;
  } else if (qualifierValue && (qualifierValue.toString().includes('20') || qualifierValue.toString().includes('severe'))) {
    scores.qualifier = 15;
  } else if (qualifierValue && qualifierValue.toString().toLowerCase().includes('ahi')) {
    scores.qualifier = 10;
  }
  
  // Ordering provider scoring (20 points max)
  const providerValue = extractValue(parsedOutput, ['ordering_provider', 'physician', 'doctor', 'ordering_physician.name', 'provider']);
  if (providerValue && providerValue.toLowerCase().includes('cameron')) {
    scores.orderingProvider = 20;
  } else if (providerValue && providerValue.toLowerCase().includes('dr')) {
    scores.orderingProvider = 10;
  }
  
  // Structure bonus (extra points for well-structured JSON)
  try {
    JSON.parse(response.output);
    scores.structureBonus = 10; // Bonus for valid JSON
  } catch (error) {
    scores.structureBonus = 0;
  }
  
  scores.total = scores.device + scores.maskType + scores.addOns + scores.qualifier + scores.orderingProvider + scores.structureBonus;
  
  return {
    ...response,
    score: Math.min(100, scores.total), // Cap at 100
    scoreBreakdown: scores
  };
}

// Extract value from nested object using multiple possible paths
function extractValue(obj: any, paths: string[]): any {
  for (const path of paths) {
    const value = getNestedValue(obj, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return null;
}

// Get nested value using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Extract information from plain text when JSON parsing fails
function extractFromText(text: string): any {
  const extracted: any = {};
  
  // Extract device
  if (text.toLowerCase().includes('cpap')) {
    extracted.device = 'CPAP';
  }
  
  // Extract mask type
  if (text.toLowerCase().includes('full face')) {
    extracted.mask_type = 'full face';
  }
  
  // Extract add-ons
  if (text.toLowerCase().includes('humidifier')) {
    extracted.add_ons = ['humidifier'];
  }
  
  // Extract AHI
  const ahiMatch = text.match(/AHI[^\d]*(\d+)/i);
  if (ahiMatch) {
    extracted.ahi = `> ${ahiMatch[1]}`;
  }
  
  // Extract provider
  const drMatch = text.match(/Dr\.?\s+(\w+)/i);
  if (drMatch) {
    extracted.ordering_provider = `Dr. ${drMatch[1]}`;
  }
  
  return extracted;
}

app.post('/api/score-responses', async (req, res) => {
  try {
    const { responses, desiredResult }: ScoreRequest = req.body;
    
    if (!responses || !Array.isArray(responses) || !desiredResult) {
      return res.status(400).json({ error: 'Invalid request: responses array and desiredResult required' });
    }
    
    const scoredResponses = responses.map(response => scoreResponse(response, desiredResult));
    
    // Sort by score (highest first)
    scoredResponses.sort((a, b) => b.score - a.score);
    
    res.json({
      scoredResponses,
      topScore: scoredResponses[0]?.score || 0,
      summary: {
        totalResponses: scoredResponses.length,
        averageScore: scoredResponses.reduce((sum, r) => sum + r.score, 0) / scoredResponses.length,
        scoreRange: {
          highest: scoredResponses[0]?.score || 0,
          lowest: scoredResponses[scoredResponses.length - 1]?.score || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Error scoring responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/generate-variations', async (req, res) => {
  try {
    const request: PromptVariationRequest = req.body;
    
    // Validate request
    if (!request.originalPrompt || !request.numVariations) {
      return res.status(400).json({ error: 'Missing required fields: originalPrompt and numVariations' });
    }
    
    if (request.numVariations < 1 || request.numVariations > 5) {
      return res.status(400).json({ error: 'numVariations must be between 1 and 5' });
    }
    
    const response = await generatePromptVariations(request);
    res.json(response);
    
  } catch (error) {
    console.error('Error processing variation request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 OpenAI API Key status: ${process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT SET - Using mock responses'}`);
  console.log(`🔧 Mode: ${process.env.OPENAI_API_KEY ? 'PRODUCTION (Real API)' : 'DEVELOPMENT (Mock Data)'}`);
});
