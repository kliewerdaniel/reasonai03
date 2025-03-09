This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



# Building an AI-Powered Next.js Application with Mastra and Ollama

## 1. Introduction

The world of AI is rapidly evolving, with agent-based systems emerging as powerful tools for task automation and complex problem-solving. In this comprehensive tutorial, we'll walk through building a sophisticated Next.js application that integrates **Mastra** (a cutting-edge AI agent framework) with **Ollama** (an open-source local LLM runner) to create an intelligent task automation system.

**What is Mastra?** Mastra is a modern framework for creating autonomous AI agents with advanced reasoning capabilities. It enables developers to build reliable AI agents that can decompose complex tasks into manageable steps and execute them methodically.

> **Note:** It appears the `@mastraai/client` package is not yet publicly available on npm. For this tutorial, we'll build a custom implementation inspired by the Mastra architecture but using only available open-source packages.

**What is Ollama?** Ollama allows you to run large language models (LLMs) locally on your machine rather than relying on cloud APIs. This approach provides privacy benefits, reduces costs, and eliminates API latency issues—making it ideal for development and privacy-sensitive applications.

By the end of this tutorial, you'll have created a web application where users can submit goals like "Create a content calendar for social media" or "Analyze quarterly sales data," and watch as an AI agent systematically works through the problem, documenting its reasoning and producing high-quality results.

## 2. Setting Up the Project

### 2.1 Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed

- Basic knowledge of React and Next.js

- Ollama installed (we'll cover this in detail)

### 2.2 Creating a Next.js Application

Let's begin by creating a fresh Next.js project:

```bash

npx create-next-app@latest next-ollama-app

cd next-ollama-app

```

During the setup, select the following options:

- Would you like to use TypeScript? → Yes (for type safety)

- Would you like to use ESLint? → Yes

- Would you like to use Tailwind CSS? → Yes (for styling)

- Would you like to use the src/ directory? → Yes (for organization)

- Would you like to use App Router? → Yes (for modern routing)

- Would you like to customize the default import alias? → No

### 2.3 Installing Dependencies

Install the necessary packages:

```bash

npm install dotenv react-markdown

```

### 2.4 Setting Up Ollama

1. Visit [Ollama's official website](https://ollama.com/) and download the installer for your operating system.

2. Install Ollama following the on-screen instructions.

3. Open a terminal and pull the Mistral model (a powerful open-source LLM):

```bash

ollama pull mistral

```

This will download the model, which may take several minutes depending on your internet connection.

### 2.5 Creating a Custom Agent Framework

Let's create our own lightweight agent framework:

Create a file at `src/lib/agent.ts`:

```typescript

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

private steps: Step[] = [];

constructor(options: {

goal: string;

maxSteps?: number;

onStepComplete?: StepCallback;

}) {

this.goal = options.goal;

this.maxSteps = options.maxSteps || 5;

this.onStepComplete = options.onStepComplete;

}

async execute(): Promise<AgentResult> {

// Step 1: Task analysis

const taskAnalysis = await this.callOllama(

`Analyze this task: "${this.goal}". Break it down into ${this.maxSteps} clear steps that would lead to a high-quality result. Return a JSON array of step descriptions only, no additional text.`

);

let steps: string[] = [];

try {

const parsed = JSON.parse(this.extractJSON(taskAnalysis));

steps = Array.isArray(parsed) ? parsed : [];

} catch (e) {

// If parsing fails, try to extract steps using regex

const stepRegex = /\d+\.\s*(.*?)(?=\d+\.|$)/gs;

const matches = [...taskAnalysis.matchAll(stepRegex)];

steps = matches.map(match => match[1].trim());

}

// Ensure we have steps

if (steps.length === 0) {

steps = ["Analyze the problem", "Generate solution", "Refine the output"];

}

// Execute each step

for (let i = 0; i < Math.min(steps.length, this.maxSteps); i++) {

const stepNumber = i + 1;

const stepDescription = steps[i];

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

const response = await fetch('http://localhost:11434/api/generate', {

method: 'POST',

headers: {

'Content-Type': 'application/json',

},

body: JSON.stringify({

model: 'mistral',

prompt: prompt,

stream: false,

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

```

This custom agent implementation provides similar functionality to what we'd expect from Mastra:

- Breaking down a task into logical steps

- Reasoning about each step before execution

- Executing steps sequentially

- Providing step-by-step progress updates

- Generating a comprehensive final output

## 3. Understanding the Frontend (React + Next.js)

Now, let's build a responsive, user-friendly interface for our agent application.

### 3.1 Creating the Home Page Component

Create or replace the file at `src/app/page.tsx` with:

```tsx

"use client";

import { useState, useRef, useEffect } from "react";

import ReactMarkdown from "react-markdown";

export default function Home() {

const [goal, setGoal] = useState<string>("");

const [logs, setLogs] = useState<string[]>([]);

const [isRunning, setIsRunning] = useState<boolean>(false);

const [result, setResult] = useState<string>("");

const logsEndRef = useRef<HTMLDivElement>(null);

// Auto-scroll to the bottom of logs

useEffect(() => {

if (logsEndRef.current) {

logsEndRef.current.scrollIntoView({ behavior: "smooth" });

}

}, [logs]);

const handleRunAgent = async () => {

if (!goal.trim() || isRunning) return;

setIsRunning(true);

setLogs(["🤖 Initializing Mastra-inspired agent powered by Ollama..."]);

setResult("");

try {

const response = await fetch("/api/run-agent", {

method: "POST",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({ goal }),

});

if (!response.ok) {

const errorData = await response.json();

throw new Error(errorData.error || "Failed to run agent");

}

// Use streaming for real-time updates

const reader = response.body?.getReader();

const decoder = new TextDecoder();

if (reader) {

while (true) {

const { done, value } = await reader.read();

if (done) break;

const text = decoder.decode(value);

try {

// Handle multiple JSON objects in the same chunk

const jsonObjects = text.split('\n').filter(line => line.trim());

for (const jsonStr of jsonObjects) {

if (!jsonStr.trim()) continue;

const data = JSON.parse(jsonStr);

if (data.type === "log") {

setLogs(logs => [...logs, data.message]);

} else if (data.type === "result") {

setResult(data.content);

}

}

} catch (error) {

console.error("Error parsing stream data:", error);

}

}

}

} catch (error: any) {

setLogs(logs => [...logs, `❌ Error: ${error.message}`]);

} finally {

setIsRunning(false);

setLogs(logs => [...logs, "✅ Agent execution completed"]);

}

};

return (

<main className="flex min-h-screen flex-col items-center p-8 max-w-5xl mx-auto">

<h1 className="text-4xl font-bold mb-3">AI Agent Workspace</h1>

<h2 className="text-xl text-gray-600 mb-8">Powered by Mastra-inspired Architecture + Ollama</h2>

<div className="w-full space-y-8">

{/* Goal Input Section */}

<div className="bg-white p-6 rounded-lg shadow-md">

<h3 className="text-lg font-semibold mb-3">What would you like the agent to accomplish?</h3>

<div className="flex gap-3">

<input

type="text"

placeholder="e.g., Create a marketing plan for a new product launch"

value={goal}

onChange={(e) => setGoal(e.target.value)}

className="flex-1 p-3 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500"

disabled={isRunning}

/>

<button

onClick={handleRunAgent}

disabled={isRunning || !goal.trim()}

className={`px-6 py-3 rounded-md font-medium transition ${

isRunning ?

"bg-gray-300 text-gray-600" :

"bg-blue-600 text-white hover:bg-blue-700"

}`}

>

{isRunning ? "Working..." : "Run Agent"}

</button>

</div>

</div>

{/* Agent Logs Section */}

<div className="bg-gray-50 rounded-lg shadow-md">

<div className="bg-gray-100 p-4 rounded-t-lg border-b">

<h3 className="text-lg font-semibold">Agent Thinking Process</h3>

</div>

<div className="p-4 max-h-80 overflow-y-auto">

{logs.length === 0 ? (

<p className="text-gray-500 italic">Agent logs will appear here...</p>

) : (

<div className="space-y-2">

{logs.map((log, index) => (

<div key={index} className="p-3 bg-white rounded border">

{log}

</div>

))}

<div ref={logsEndRef} />

</div>

)}

</div>

</div>

{/* Result Section */}

{result && (

<div className="bg-white rounded-lg shadow-md">

<div className="bg-green-100 p-4 rounded-t-lg border-b">

<h3 className="text-lg font-semibold text-green-800">Agent Result</h3>

</div>

<div className="p-6 prose max-w-none">

<ReactMarkdown>{result}</ReactMarkdown>

</div>

</div>

)}

</div>

</main>

);

}

```

### 3.2 Understanding the Frontend Components

The frontend is built with several key features:

1. **State Management**:

- `goal`: Stores the user's input task

- `logs`: Maintains an array of execution logs

- `isRunning`: Tracks the agent's execution state

- `result`: Stores the final output from the agent

2. **Streaming Response Handling**:

- Uses the Fetch API with a reader/decoder to process streamed updates

- Separates log updates from final results

3. **UI Components**:

- A clean input section for submitting tasks

- A scrollable log window showing the agent's reasoning process

- A formatted result section using React Markdown for rich text display

4. **User Experience Enhancements**:

- Auto-scrolling logs to keep the latest updates visible

- Disabled inputs during processing

- Visual feedback for running state

## 4. Building the Backend (API Route with Custom Agent + Ollama)

Now, let's create the serverless API endpoint that will run our custom agent with Ollama.

### 4.1 Creating the API Route

Create a file at `src/app/api/run-agent/route.ts`:

```typescript

import { NextResponse } from 'next/server';

import { Agent, Step } from '@/lib/agent';

export const runtime = 'nodejs';

export async function POST(request: Request) {

// Initialize the response encoder for streaming

const encoder = new TextEncoder();

const stream = new TransformStream();

const writer = stream.writable.getWriter();

// Function to send updates to the client

const sendUpdate = async (data: any) => {

await writer.write(encoder.encode(JSON.stringify(data) + '\n'));

};

// Process the request in the background while streaming updates

const processRequest = async () => {

try {

// Parse the request body

const { goal } = await request.json();

if (!goal || typeof goal !== 'string') {

await sendUpdate({

type: 'log',

message: '❌ Error: Please provide a valid goal'

});

writer.close();

return;

}

// Initialize the custom agent

const agent = new Agent({

goal: goal,

maxSteps: 5,

onStepComplete: async (step: Step) => {

await sendUpdate({

type: 'log',

message: `📝 Step ${step.number}: ${step.description}`

});

if (step.reasoning) {

await sendUpdate({

type: 'log',

message: `🤔 Reasoning: ${step.reasoning}`

});

}

}

});

// Log initialization

await sendUpdate({

type: 'log',

message: `🧠 Analyzing task: "${goal}"`

});

// Execute the agent

const result = await agent.execute();

// Send the final result

await sendUpdate({

type: 'result',

content: result.output

});

// Close the stream

writer.close();

} catch (error: any) {

console.error('Agent execution error:', error);

await sendUpdate({

type: 'log',

message: `❌ Error: ${error.message || 'Unknown error occurred'}`

});

writer.close();

}

};

// Start processing in the background

processRequest();

// Return the stream response immediately

return new NextResponse(stream.readable, {

headers: {

'Content-Type': 'application/json',

'Transfer-Encoding': 'chunked',

},

});

}

```

### 4.2 Understanding the Backend Architecture

Our API route implements several advanced features:

1. **Streaming Response**:

- Uses the Web Streams API to send real-time updates to the frontend

- Maintains a single connection instead of polling

2. **Custom Agent Integration**:

- Initializes our custom Agent class with the user's goal

- Configures step limits and callback functions

- Streams progress updates in real-time

3. **Progress Tracking**:

- Uses the `onStepComplete` callback to report each step's progress

- Separates reasoning logs from final results

4. **Error Handling**:

- Robust error catching and reporting

- Ensures the stream is properly closed even on errors

## 5. Running and Testing the Application

Now let's run our application and test its capabilities:

### 5.1 Starting the Development Server

Ensure Ollama is running, then start your Next.js application:

```bash

npm run dev

```

Open your browser to `http://localhost:3000`.

### 5.2 Testing with Different Goals

Try entering various goals to test the agent's capabilities:

**Business Planning Examples:**

- "Create a marketing strategy for a new fitness app"

- "Develop a 30-day content calendar for a tech startup"

- "Draft a project plan for website redesign"

**Creative Tasks:**

- "Write a short story about time travel with a twist ending"

- "Create a detailed character profile for a fantasy novel"

- "Develop three unique logo concepts for a sustainable fashion brand"

**Analytical Problems:**

- "Analyze the pros and cons of remote work for a small business"

- "Compare three different pricing strategies for a SaaS product"

- "Create a SWOT analysis for entering the electric vehicle market"

### 5.3 Sample Interaction

Here's an example of how the agent might process a goal to "Create a 7-day social media plan for a coffee shop":

**Agent Logs:**

```

🤖 Initializing Mastra-inspired agent powered by Ollama...

🧠 Analyzing task: "Create a 7-day social media plan for a coffee shop"

📝 Step 1: Define the target audience and social media platforms

🤔 Reasoning: Before creating content, I need to understand who we're targeting and which platforms would be most effective for a coffee shop. Typically, Instagram and Facebook work well for food/beverage businesses.

📝 Step 2: Establish content themes and post types

🤔 Reasoning: Coffee shops can benefit from diverse content including product highlights, behind-the-scenes, customer features, and educational content about coffee.

📝 Step 3: Create a content calendar for Monday through Wednesday

🤔 Reasoning: I'll start with the first half of the week, focusing on driving early-week traffic when coffee shops might be slower.

📝 Step 4: Create a content calendar for Thursday through Sunday

🤔 Reasoning: For the latter half of the week, I'll focus on weekend promotions and creating content that encourages longer visits and higher purchases.

📝 Step 5: Add engagement strategies and hashtag recommendations

🤔 Reasoning: Social media success requires engagement beyond just posting. I'll add strategies for responding to comments and effective hashtags.

✅ Agent execution completed

```

**Agent Result:**

The final output would be a comprehensive, day-by-day social media plan formatted in Markdown, including specific post ideas, optimal posting times, hashtag recommendations, and engagement strategies.

## 6. Expanding the Project

Once you have the basic application working, consider these enhancements to create a more powerful agent system:

### 6.1 Adding Specialized Agent Tools

Extend your custom agent with specialized tools for different tasks:

```typescript

// src/lib/tools.ts

export interface Tool {

name: string;

description: string;

execute: (input: string) => Promise<string>;

}

// Sample search tool

export const searchTool: Tool = {

name: 'search',

description: 'Search the web for information',

async execute(query: string): Promise<string> {

// This is a mock implementation - in a real app, you'd integrate with a search API

return `Simulated search results for: ${query}\n\n1. First relevant result\n2. Second relevant result\n3. Third relevant result`;

}

};

// Then enhance your Agent class to use tools

// In src/lib/agent.ts, modify the execute method:

async execute(): Promise<AgentResult> {

// ... existing code

// Add tool usage where appropriate

if (this.tools && this.tools.length > 0) {

const toolDescriptions = this.tools.map(t => `${t.name}: ${t.description}`).join('\n');

// Let the agent decide whether to use a tool

const toolUsage = await this.callOllama(`

For the task: "${this.goal}", I'm on step ${currentStep.number}: "${currentStep.description}".

I have these tools available:

${toolDescriptions}

Should I use a tool for this step? If yes, specify which tool and the exact input to provide to the tool.

Return your answer in JSON format: { "useTool": boolean, "toolName": string, "toolInput": string }

`);

try {

const toolDecision = JSON.parse(this.extractJSON(toolUsage));

if (toolDecision.useTool) {

const tool = this.tools.find(t => t.name === toolDecision.toolName);

if (tool) {

const toolResult = await tool.execute(toolDecision.toolInput);

// Use the tool result in further processing

currentStep.output = `Used ${tool.name} with input: ${toolDecision.toolInput}\n\nResult: ${toolResult}`;

}

}

} catch (e) {

// If JSON parsing fails, continue without tool usage

}

}

// ... rest of execute method

}

```

### 6.2 Implementing a Database for Conversation History

Add persistence to your application with a database:

```typescript

// Using Prisma with SQLite for simplicity

// 1. Install Prisma: npm install prisma @prisma/client

// 2. Initialize Prisma: npx prisma init --datasource-provider sqlite

// 3. Create schema.prisma:

// prisma/schema.prisma

/*

generator client {

provider = "prisma-client-js"

}

datasource db {

provider = "sqlite"

url = "file:./dev.db"

}

model Session {

id String @id @default(uuid())

goal String

output String @default("")

logs String @default("[]") // JSON string of logs

createdAt DateTime @default(now())

}

*/

// 4. Run migration: npx prisma migrate dev --name init

// 5. Generate client: npx prisma generate

// 6. Create a database service

// src/lib/db.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveSession(goal: string, output: string, logs: string[]) {

return await prisma.session.create({

data: {

goal,

output,

logs: JSON.stringify(logs),

},

});

}

export async function getSessions() {

return await prisma.session.findMany({

orderBy: {

createdAt: 'desc',

},

});

}

export async function getSession(id: string) {

return await prisma.session.findUnique({

where: { id },

});

}

```

### 6.3 Implementing Multi-Agent Workflows

Create complex workflows with multiple specialized agents:

```typescript

// src/lib/workflow.ts

import { Agent, AgentResult } from './agent';

export async function runResearchAndSynthesisWorkflow(topic: string, updateCallback: (message: string) => Promise<void>) {

await updateCallback(`Starting research workflow on: ${topic}`);

// Research agent gathers information

const researchAgent = new Agent({

goal: `Research key facts about: ${topic}`,

maxSteps: 3,

onStepComplete: async (step) => {

await updateCallback(`Research step ${step.number}: ${step.description}`);

}

});

await updateCallback("Starting research phase...");

const researchResult = await researchAgent.execute();

// Analysis agent evaluates the research

const analysisAgent = new Agent({

goal: `Analyze these research findings and identify key insights: ${researchResult.output}`,

maxSteps: 2,

onStepComplete: async (step) => {

await updateCallback(`Analysis step ${step.number}: ${step.description}`);

}

});

await updateCallback("Starting analysis phase...");

const analysisResult = await analysisAgent.execute();

// Synthesis agent creates final output

const synthesisAgent = new Agent({

goal: `Create a comprehensive report on ${topic} using this research and analysis:

Research: ${researchResult.output}

Analysis: ${analysisResult.output}`,

maxSteps: 3,

onStepComplete: async (step) => {

await updateCallback(`Synthesis step ${step.number}: ${step.description}`);

}

});

await updateCallback("Starting synthesis phase...");

const finalResult = await synthesisAgent.execute();

await updateCallback("Workflow complete!");

return {

topic,

research: researchResult.output,

analysis: analysisResult.output,

synthesis: finalResult.output

};

}

```

### 6.4 Optimizing Model Selection and Configuration

Allow users to customize the LLM parameters:

```typescript

// src/lib/modelConfig.ts

export interface ModelConfig {

modelName: string;

temperature: number;

maxTokens: number;

}

export const availableModels = [

{ name: 'mistral', label: 'Mistral (Balanced)' },

{ name: 'llama3', label: 'Llama 3 (Creative)' },

{ name: 'codellama', label: 'CodeLlama (Technical)' },

];

// Then update your Agent class to use these configurations:

private async callOllama(prompt: string): Promise<string> {

try {

const response = await fetch('http://localhost:11434/api/generate', {

method: 'POST',

headers: {

'Content-Type': 'application/json',

},

body: JSON.stringify({

model: this.modelConfig.modelName || 'mistral',

prompt: prompt,

temperature: this.modelConfig.temperature || 0.7,

max_tokens: this.modelConfig.maxTokens || 2048,

stream: false,

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

```

## 7. Conclusion

In this comprehensive tutorial, we've built a sophisticated Next.js application that leverages a custom agent framework and Ollama to create an AI-powered task automation system. This combination offers several key advantages:

1. **Local Privacy**: By running models through Ollama, you maintain control of your data without sending it to external API services.

2. **Cost Efficiency**: Eliminate per-token or per-request charges by running inference locally.

3. **Architectural Flexibility**: Our custom agent implementation provides a structured framework that can be extended as needed.

4. **Realtime Feedback**: The streaming architecture keeps users informed of progress throughout the execution.

While we couldn't use the actual Mastra package due to availability issues, our custom implementation follows similar architectural principles, delivering a comparable experience. In a production environment, you might choose to use a commercially available agent framework like Mastra when it becomes publicly available, or continue to evolve your custom solution to meet your specific needs.

The agent-based approach we've implemented demonstrates how complex goals can be broken down into manageable steps with explicit reasoning at each stage. This not only produces better results but also creates transparency that builds user trust in the AI system.

### Additional Resources

- [Ollama GitHub Repository](https://github.com/ollama/ollama)

- [Next.js Documentation](https://nextjs.org/docs)

- [LangChain.js (complementary framework)](https://js.langchain.com)

- [Prompt Engineering Guide](https://www.promptingguide.ai/)

By mastering these technologies, you're well-positioned to build the next generation of intelligent applications that blend the best of human creativity with AI capabilities.