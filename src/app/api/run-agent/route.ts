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
      const { goal, model } = await request.json();
      
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
        model: model,
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
