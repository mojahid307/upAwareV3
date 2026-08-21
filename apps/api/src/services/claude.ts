import Anthropic from "@anthropic-ai/sdk";

export interface PostDetailsForAI {
  title: string;
  body: string;
  category: string;
  ward?: number | null;
  address?: string | null;
}

/**
 * Fallback suggestion generator when CLAUDE_API_KEY is not set or Anthropic is unavailable.
 * Returns 3 realistic, actionable Dhaka-specific civic resolution steps.
 */
function getFallbackSuggestions(post: PostDetailsForAI): string[] {
  const wardText = post.ward ? `Ward ${post.ward}` : "your local ward";
  const cat = post.category.toUpperCase();

  switch (cat) {
    case "INFRASTRUCTURE":
      return [
        `File an urgent complaint with the City Corporation (DSCC/DNCC) Engineering Department attaching photo evidence and mentioning ${wardText}.`,
        `Submit a formal request to the local Ward Councillor's office to include this road/drainage section in the upcoming road maintenance tender.`,
        `Mobilize neighborhood community groups or resident welfare associations to co-sign an online petition for faster municipal escalation.`
      ];
    case "TRAFFIC":
      return [
        `Report signal failure or illegal blockage to Dhaka Metropolitan Police (DMP) Traffic Division control room or via the DMP Citizen Help app.`,
        `Contact the local BRTA enforcement wing if illegal parking or unauthorized vehicle stands are causing persistent gridlock.`,
        `Coordinate with local community volunteers to assist traffic sergeants during morning and evening rush hours at the bottleneck.`
      ];
    case "HEALTH":
    case "ENVIRONMENT":
      return [
        `Alert the City Corporation Waste Management (Conservancy) inspector for ${wardText} to dispatch waste clearing and bleaching powder teams.`,
        `For open drains, sewage, or water contamination, lodge a ticket with Dhaka WASA Helpline (16162) citing the exact street location.`,
        `Organize a neighborhood clean-up awareness drive with local youth and request the ward council to place dedicated garbage bins.`
      ];
    case "CRIME":
    case "SAFETY":
      return [
        `Report incidents or request increased evening police patrols at the nearest Thana (Police Station) and inform the local community beat officer.`,
        `In case of immediate danger or ongoing criminal activity, call National Emergency Services 999 immediately.`,
        `Petition the Ward Councillor's office and local shop owners' association to install functional streetlights and CCTV monitoring coverage.`
      ];
    default:
      return [
        `Notify the local ${wardText} Councillor office to inspect the issue and forward it to the relevant municipal department.`,
        `Document the problem with clear photos and timestamps to create a collective petition signed by affected residents.`,
        `Escalate through the official City Corporation hotline and citizen portal for tracked municipal grievance redressal.`
      ];
  }
}

/**
 * Call Anthropic Claude API to generate 3 actionable Dhaka civic problem-solving recommendations.
 */
export async function getPostSuggestions(post: PostDetailsForAI): Promise<string[]> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey || apiKey.startsWith("replace-") || apiKey.startsWith("sk-ant-xxx")) {
    console.log("[claude.ts] CLAUDE_API_KEY not configured — using contextual Dhaka civic fallback suggestions");
    return getFallbackSuggestions(post);
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      system: `You are a civic problem-solving assistant for Dhaka, Bangladesh.
Given a community issue report, return exactly 3 practical, actionable suggestions
a citizen or local community group can take to address or escalate the problem.
Be specific to Dhaka: mention relevant bodies (DSCC, DNCC, WASA, BRTA, DMP, Rapid Action Battalion,
999 emergency, local ward commissioner/councillor office) where appropriate.
Format: Return a JSON array of 3 strings. Each string under 80 words.
Respond in the same language as the post (Bengali or English).`,
      messages: [
        {
          role: "user",
          content: `Title: ${post.title}\nDescription: ${post.body}\nCategory: ${post.category}${post.ward ? `\nWard: ${post.ward}` : ""}${post.address ? `\nAddress: ${post.address}` : ""}`,
        },
      ],
    });

    const firstBlock = response.content[0];
    const text = firstBlock.type === "text" ? firstBlock.text : "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map(String);
    }
    return getFallbackSuggestions(post);
  } catch (error) {
    console.error("[claude.ts] Claude API call failed, falling back to heuristics:", error);
    return getFallbackSuggestions(post);
  }
}
