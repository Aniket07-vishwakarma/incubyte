const Groq = require("groq-sdk");
const { GROQ_API_KEY } = require("../../environment");
const { Embeddings } = require("@langchain/core/embeddings");

// Custom embeddings class that uses Groq
class GroqCustomEmbeddings extends Embeddings {
  constructor(config) {
    super();
    this.client = new Groq({
      apiKey: config.apiKey || GROQ_API_KEY,
    });
    this.modelName = config.modelName || "llama-3.3-70b-versatile";
    this.dimensions = config.dimensions || 1536;
    this.batchSize = config.batchSize || 20;
  }

  // Generate embeddings for multiple documents
  async embedDocuments(texts) {
    const batches = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      batches.push(texts.slice(i, i + this.batchSize));
    }

    const embeddings = [];
    for (const batch of batches) {
      const batchEmbeddings = await Promise.all(
        batch.map((text) => this.embedQuery(text))
      );
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }

  // Generate embedding for a single text
  async embedQuery(text) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content:
              "You are a semantic encoder. Extract key concepts from the input text and represent them as a comma-separated list of 10 key terms or phrases. Focus on the most important concepts.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0,
        max_tokens: 100,
      });

      const conceptText = response.choices[0]?.message?.content || "";
      return this.hashTextToEmbedding(conceptText, this.dimensions);
    } catch (error) {
      console.error("Error generating embedding:", error);
      return new Array(this.dimensions).fill(0);
    }
  }

  // Convert text to a deterministic vector representation
  hashTextToEmbedding(text, dimensions) {
    const embedding = new Array(dimensions).fill(0);

    // Normalize and tokenize the text
    const normalizedText = text.toLowerCase().replace(/[^\w\s,]/g, "");
    const tokens = normalizedText.split(/[\s,]+/).filter((t) => t.length > 0);

    // Generate embedding based on tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Calculate hash value for each token
      let hash = 0;
      for (let j = 0; j < token.length; j++) {
        hash = (hash << 5) - hash + token.charCodeAt(j);
        hash = hash & hash; // Convert to 32bit integer
      }

      // Spread the token influence across multiple dimensions
      for (let k = 0; k < 10; k++) {
        const position = Math.abs((hash + k * 127) % dimensions);
        const value = (hash % 1000) / 1000; // Normalized value between 0 and 1
        embedding[position] = (embedding[position] + value) / 2;
      }
    }

    // Normalize the embedding vector
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map((val) => (magnitude > 0 ? val / magnitude : 0));
  }
}

module.exports = GroqCustomEmbeddings;
