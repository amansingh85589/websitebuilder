import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Request, Response } from "express";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import Together from "together-ai";
import { getSystemPrompt, BASE_PROMPT } from "./prompts.js";

// Check for API key in environment variables
const API_KEY = process.env.LLM_KEY;
if (!API_KEY) {
  console.error("ERROR: Missing LLM_KEY in environment variables!");
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Together client
const client = new Together({
  apiKey: API_KEY,
});

// Type definitions
interface TemplateRequestBody {
  prompt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MessagesRequestBody {
  messages: ChatMessage[];
}

// Route to handle project type determination
app.post("/template", async (req: Request<{}, {}, TemplateRequestBody>, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    const response = await client.chat.completions.create({
      messages: [
        { role: "user", content: prompt },
        {
          role: "system",
          content:
            "Return either 'node' or 'react' based on the project requirements. Only return a single word: 'node' or 'react'. Do not return anything extra.",
        },
      ],
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    });

    const content = response.choices?.[0]?.message?.content?.trim().toLowerCase();

    if (content === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Visible files:\n${reactBasePrompt}\n\nHidden files:\n- .gitignore\n- package-lock.json`,
        ],
        uiPrompt: [reactBasePrompt],
      });
      return;
    }

    if (content === "node") {
      res.json({
        prompts: [
          `Visible files:\n${nodeBasePrompt}\n\nHidden files:\n- .gitignore\n- package-lock.json`,
        ],
        uiPrompt: [nodeBasePrompt],
      });
      return;
    }

    res.status(403).json({ message: "Invalid project type determination." });
  } catch (error) {
    console.error("Template Error:", error);
    res.status(500).json({ message: "Project type determination failed." });
  }
});

// Route to handle chat interactions
app.post("/chat", async (req: Request<{}, {}, MessagesRequestBody>, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;

    if (!messages?.length) {
      res.status(400).json({ error: "No messages provided in request." });
      return;
    }

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...messages,
      ],
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    });

    const result = response.choices?.[0]?.message?.content?.trim();

    if (!result) {
      res.status(500).json({ error: "Empty response from AI model." });
      return;
    }

    res.json({ response: result });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Chat processing failed." });
  }
});

// Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
