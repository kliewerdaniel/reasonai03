// src/lib/agent.ts
export interface Step {
  number: number;
  description: string;
  reasoning?: string;
  output?: string;
}

export interface AgentResult {
  goal: string;
  steps: Step[];
  output: string;
}

export type StepCallback = (step: Step) => Promise<void> | void;

export class Agent {
  private goal: string;
  private maxSteps: number;
  private onStepComplete?: StepCallback;
  private model: string;
  private steps: Step[] = [];

  constructor(options: {
    goal: string;
    maxSteps?: number;
    onStepComplete?: StepCallback;
    model?: string;
  }) {
    this.goal = options.goal;
    this.maxSteps = options.maxSteps || 5;
    this.onStepComplete = options.onStepComplete;
    this.model = options.model || 'mistral'; // Default to mistral if no model specified
  }

  async execute(): Promise<AgentResult> {
    // Step 1: Task analysis
    const taskAnalysis = await this.callOllama(
      `Analyze this task: "${this.goal}". Break it down into ${this.maxSteps} clear steps that would lead to a high-quality result. Return a JSON array of step descriptions only, no additional text.`
    );
    
    console.log("Raw task analysis:", taskAnalysis);
    let steps: string[] = [];
    
    try {
      // First try JSON parsing
      const jsonText = this.extractJSON(taskAnalysis);
      console.log("Extracted JSON:", jsonText);
      const parsed = JSON.parse(jsonText);
      
      if (Array.isArray(parsed)) {
        steps = parsed.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) return String(item);
          return String(item);
        });
      }
    } catch (e) {
      console.log("JSON parsing failed, trying regex", e);
      // If parsing fails, try to extract steps using regex
      const stepRegex = /\d+\.\s*(.*?)(?=\d+\.|$)/gs;
      const matches = [...taskAnalysis.matchAll(stepRegex)];
      steps = matches.map(match => match[1].trim());
    }
    
    // Ensure we have steps
    if (steps.length === 0) {
      console.log("No steps found, using default steps");
      steps = ["Analyze the problem", "Research relevant information", "Process and organize data", "Apply logical reasoning", "Present findings and conclusions"];
    }
    
    console.log("Final steps:", steps);
    
    // Execute each step
    for (let i = 0; i < Math.min(steps.length, this.maxSteps); i++) {
      const stepNumber = i + 1;
      const stepDescription = typeof steps[i] === 'string' ? steps[i] : JSON.stringify(steps[i]);
      
      console.log(`Processing step ${stepNumber}: ${stepDescription}`);
      
      // Generate reasoning for this step
      const reasoning = await this.callOllama(
        `For the task: "${this.goal}", I am on step ${stepNumber}: "${stepDescription}". Explain your reasoning for how you'll approach this step. Keep it clear and concise.`
      );
      
      // Execute the step
      const stepPrompt = `
Task: "${this.goal}"
Step ${stepNumber}/${Math.min(steps.length, this.maxSteps)}: ${stepDescription}
Previous steps: ${this.steps.map(s => `Step ${s.number}: ${s.description} -> ${s.output?.substring(0, 100)}...`).join('\n')}

Execute this step and provide the output. Be thorough but focused on just this step.
`;
      
      const stepOutput = await this.callOllama(stepPrompt);
      
      // Record the step
      const step: Step = {
        number: stepNumber,
        description: stepDescription,
        reasoning,
        output: stepOutput
      };
      
      this.steps.push(step);
      
      // Notify via callback if provided
      if (this.onStepComplete) {
        await this.onStepComplete(step);
      }
    }
    
    // Generate final comprehensive output
    const finalPrompt = `
You've been working on: "${this.goal}"

You've completed the following steps:
${this.steps.map(s => `Step ${s.number}: ${s.description}`).join('\n')}

Now, compile all of your work into a comprehensive final output that achieves the original goal. 
Format your response using Markdown for readability. Include headings, bullet points, and other formatting as appropriate.
Ensure your response is complete, well-structured, and directly addresses the original goal.
`;
    
    const finalOutput = await this.callOllama(finalPrompt);
    
    return {
      goal: this.goal,
      steps: this.steps,
      output: finalOutput
    };
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      console.log("Calling Ollama with prompt:", prompt.substring(0, 100) + "...");
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          // Add timeout to avoid long-running requests hanging
          options: {
            num_ctx: 4096
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private extractJSON(text: string): string {
    // Try to extract JSON from the text
    const jsonRegex = /(\[.*\]|\{.*\})/s;
    const match = text.match(jsonRegex);
    return match ? match[0] : '[]';
  }
}
