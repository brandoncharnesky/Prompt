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
    throw new Error('Failed to generate prompt variations');
  }
}

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
