import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { match } from "ts-pattern";

export const runtime = "edge";

interface ChatCompletionMessageParam {
  role: string;
  content: string;
}

async function checkRateLimit(req: Request, config: { RPM?: number; RPD?: number }) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");

  if (config.RPM) {
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(config.RPM, "1 m"),
    });
    const result = await ratelimit.limit(`wapp_ratelimit_${ip}`);
    if (!result.success) {
      return new Response(JSON.stringify({
        error: "You have reached your request limit for the minute.",
        nextAllowedTime: new Date(result.reset).toISOString()
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      });
    }
  }

  if (config.RPD) {
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(config.RPD, "1 d"),
    });
    const result = await ratelimit.limit(`wapp_ratelimit_${ip}`);
    if (!result.success) {
      return new Response(JSON.stringify({
        error: "You have reached your request limit for the day.",
        nextAllowedTime: new Date(result.reset).toISOString()
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      });
    }
  }

  return null;
}

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY - make sure to add it to your .env file.", { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });

    const { prompt, command, model, config } = await req.json();

    const rateLimitResponse = await checkRateLimit(req, config);
    if (rateLimitResponse) return rateLimitResponse;
    const messages = match(command)
    .with("rewrite", () => [
      {
        role: "system",
        content:
          "You are a helpful assistant that rewrites content into a Shopify product format. " +
          "Your response should be a valid JSON array containing one or more product objects. Each object should have the following keys: title, category, description, image, price, costPerItem, profit, and weight. Ensure all values are appropriate types (strings for text, numbers for numerical values). " +
          "IMPORTANT: Your entire response must be a single, valid JSON array that can be parsed directly. Even if there's only one product, it should still be wrapped in an array. Do not include any explanatory text outside the JSON structure."
      },
      {
        role: "user",
        content: `Rewrite the following content into a Shopify product format: ${prompt}`
      },
    ])
    .with("seo", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that helps Shopify owners write SEO-optimized product information to provide the best content for their products. " +
          "Your response should be a valid JSON array containing one or more objects. Each object should have the following keys: title, description, metaTitle, metaDescription, and keywords. Ensure all values are strings. " +
          "IMPORTANT: Your entire response must be a single, valid JSON array that can be parsed directly. Even if there's only one product, it should still be wrapped in an array. Do not include any explanatory text outside the JSON structure."
      },
      {
        role: "user",
        content: `Optimize the following content for SEO in a Shopify product format: ${prompt}`
      },
    ])
    .run() as ChatCompletionMessageParam[];
    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages: messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
      max_tokens: config.max_tokens || 4096,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {  
    let status = 500;
    let errorMessage = "An unexpected error occurred";
    let errorCode = "unknown_error";
    let errorType = "internal_server_error";

    if (error.response) {
      status = error.response.status;
      if (error.error && error.error.type) {
        errorType = error.error.type;
      }
      if (error.error && error.error.code) {
        errorCode = error.error.code;
      }
      if (status === 429) {
        errorMessage = "Rate limit exceeded";
        errorCode = "rate_limit_exceeded";
      } else if (status === 403 && error.error && error.error.code === 'unsupported_country_region_territory') {
        errorMessage = "Unsupported region";
        errorCode = "unsupported_country_region_territory";
        errorType = "request_forbidden";
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage, 
      status,
      code: errorCode,
      type: errorType
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}