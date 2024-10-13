const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

exports.rewriteContent = async (content) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that rewrites content into a Shopify product format. Your response should be a valid JSON object with the following keys: title, category, description, price, costPerItem, profit, and weight. Ensure all values are appropriate types (strings for text, numbers for numerical values)."
      },
      {
        role: "user",
        content: `Rewrite the following content into a Shopify product format: ${content}`
      }
    ],
  });

  let parsedResponse;
  try {
    // First, try to parse the response as-is
    parsedResponse = JSON.parse(response.choices[0].message.content);
  } catch (error) {
    // If parsing fails, attempt to extract JSON from the response
    const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error("Failed to parse AI response into valid JSON");
      }
    } else {
      throw new Error("AI response does not contain valid JSON");
    }
  }

  // Validate the parsed response
  const requiredKeys = ['title', 'category', 'description', 'price', 'costPerItem', 'profit', 'weight'];
  for (const key of requiredKeys) {
    if (!(key in parsedResponse)) {
      throw new Error(`AI response is missing required key: ${key}`);
    }
  }

  return parsedResponse;
};

exports.generateSEO = async (shopifyData) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates SEO metadata for Shopify products. Your response should be a valid JSON object with 'titleTag' and 'descriptionTag' keys."
      },
      {
        role: "user",
        content: `Generate SEO metadata for the following Shopify product: ${JSON.stringify(shopifyData)}`
      }
    ],
  });

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(response.choices[0].message.content);
  } catch (error) {
    const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error("Failed to parse AI response into valid JSON");
      }
    } else {
      throw new Error("AI response does not contain valid JSON");
    }
  }

  // Validate the parsed response
  if (!parsedResponse.titleTag || !parsedResponse.descriptionTag) {
    throw new Error("AI response is missing required SEO fields");
  }

  return parsedResponse;
};

