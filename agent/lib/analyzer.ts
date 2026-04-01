import Anthropic from "@anthropic-ai/sdk";
import { isImageType, isTextType } from "./evidence.js";

export interface CriterionMatch {
  criterion: string;
  met: boolean;
  notes: string;
}

export interface VerificationResult {
  approved: boolean;
  confidence: number;
  reasoning: string;
  evidenceType: string;
  criteriaMatch: CriterionMatch[];
}

interface AnalysisInput {
  milestoneDescription: string;
  evidence: Buffer;
  mimeType: string;
  projectName: string;
  projectCategory: string;
  milestoneIndex: number;
}

const SYSTEM_PROMPT = `You are an Impact Accountability Agent that verifies milestone evidence for impact-funded projects. Your role is to analyze evidence submitted for project milestones and determine whether the evidence credibly demonstrates milestone completion.

You must be fair but rigorous. Consider:
- Does the evidence directly relate to the stated milestone?
- Is the evidence credible and verifiable?
- Does it demonstrate meaningful progress or completion?
- Are there signs of fabrication or irrelevance?

Respond with a JSON object matching this schema:
{
  "approved": boolean,
  "confidence": number (0-100),
  "reasoning": string (2-4 sentences explaining your decision),
  "evidenceType": string ("image" | "document" | "data" | "report" | "other"),
  "criteriaMatch": [
    { "criterion": string, "met": boolean, "notes": string }
  ]
}

Break down the milestone description into individual criteria and evaluate each one against the evidence. Be specific in your notes.`;

export async function analyzeEvidence(input: AnalysisInput): Promise<VerificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY must be set");
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Project: ${input.projectName} (${input.projectCategory})
Milestone #${input.milestoneIndex}: ${input.milestoneDescription}

Please analyze the attached evidence and determine whether this milestone has been met.`;

  const content: Anthropic.Messages.ContentBlockParam[] = [
    { type: "text", text: userPrompt },
  ];

  if (isImageType(input.mimeType)) {
    const mediaType = input.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: input.evidence.toString("base64"),
      },
    });
  } else if (isTextType(input.mimeType)) {
    const text = input.evidence.toString("utf-8");
    content.push({
      type: "text",
      text: `--- Evidence Content ---\n${text.slice(0, 50_000)}`,
    });
  } else if (input.mimeType === "application/pdf") {
    content.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: input.evidence.toString("base64"),
      },
    });
  } else {
    content.push({
      type: "text",
      text: `[Binary file of type ${input.mimeType}, ${input.evidence.length} bytes. Unable to analyze content directly.]`,
    });
  }

  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = textBlock.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  return JSON.parse(jsonStr.trim()) as VerificationResult;
}
