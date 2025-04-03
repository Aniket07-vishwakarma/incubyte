const readXlsxFile = require("read-excel-file/node");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { RetrievalQAChain } = require("langchain/chains");
const { GROQ_API_KEY } = require("../../environment");
const { ChatGroq } = require("@langchain/groq");
const GroqCustomEmbeddings = require("./groqEmbedding");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const WordExtractor = require("word-extractor");
const pdfParse = require("pdf-parse");

module.exports.compareExcel = async (req, res) => {
  try {
    console.log(req.files.fileA[0].buffer);

    if (!req.files.fileA && !req.files.fileB) {
      return res
        .status(400)
        .json({ error: "Required two excel files to compare." });
    }

    const bufferA = Buffer.from(req.files.fileA[0].buffer);
    const bufferB = Buffer.from(req.files.fileB[0].buffer);

    const [jsonA, jsonB] = await Promise.all([
      await readXlsxFile(bufferA),
      await readXlsxFile(bufferB),
    ]);

    console.log(jsonA);
    console.log(jsonB);

    const chainResponse = await makeChain(
      JSON.stringify(jsonA),
      JSON.stringify(jsonB)
    );

    return chainResponse;

    // console.log(chainResponse);
  } catch (error) {
    throw error;
  }
};

module.exports.compareDocs = async (req, res) => {
  try {
    console.log(req.files.fileA[0].buffer);

    if (!req.files.fileA && !req.files.fileB) {
      return res
        .status(400)
        .json({ error: "Required two word files to compare." });
    }

    const bufferA = Buffer.from(req.files.fileA[0].buffer);
    const bufferB = Buffer.from(req.files.fileB[0].buffer);

    const extractor = new WordExtractor();

    const [contentA, contentB] = await Promise.all([
      await extractor.extract(bufferA),
      await extractor.extract(bufferB),
    ]);

    console.log(contentA);
    console.log(contentB);

    const chainResponse = await makeChain(
      JSON.stringify(contentA),
      JSON.stringify(contentB)
    );

    console.log(chainResponse);

    return chainResponse;
  } catch (error) {
    throw error;
  }
};

module.exports.comparePdf = async (req, res) => {
  try {
    console.log(req.files.fileA[0].buffer);

    if (!req.files.fileA && !req.files.fileB) {
      return res
        .status(400)
        .json({ error: "Required two PDF files to compare." });
    }

    const bufferA = Buffer.from(req.files.fileA[0].buffer);
    const bufferB = Buffer.from(req.files.fileB[0].buffer);

    const [contentA, contentB] = await Promise.all([
      await pdfParse(bufferA),
      await pdfParse(bufferB),
    ]);

    console.log(contentA.text);
    console.log(contentB.text);

    const chainResponse = await makeChain(
      JSON.stringify(contentA.text),
      JSON.stringify(contentB.text)
    );

    console.log(chainResponse);

    return chainResponse;
  } catch (error) {
    throw error;
  }
};

const createVectoreStore = async (docs) => {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    let chunksWithMetadata = [];
    for (const doc of docs) {
      const chunk = await splitter.createDocuments([doc.content]);
      chunksWithMetadata.push(
        ...chunk.map((chunk) => ({
          pageContent: chunk.pageContent,
          metadata: doc.metadata,
        }))
      );
    }

    const embeddings = new GroqCustomEmbeddings({
      apiKey: GROQ_API_KEY,
      modelName: "llama-3.3-70b-versatile",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
      chunksWithMetadata,
      embeddings
    );

    return vectorStore.asRetriever();
  } catch (error) {
    throw error;
  }
};

const makeChain = async (docA, docB) => {
  try {
    console.log("befode openAI");
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const vectorStore = await createVectoreStore([
      {
        content: docA,
        source: "file1",
      },
      {
        content: docB,
        source: "file2",
      },
    ]);

    const chain = RetrievalQAChain.fromLLM(model, vectorStore, {
      returnSourceDocuments: true,
    });

    const prompt =
      "Compare the JSON of file1 and file2. Highlight differences, similarities and share response in JSON format. Please share only differences JSON data.";

    const prompt2 = `You are an expert document comparison analyst. Generate a detailed, well-structured report with the following sections:
    1. DOCUMENT OVERVIEW
    - Compare the overall structure and format of both documents
    - Identify the type of changes (additions, deletions, modifications)

    2. DETAILED CHANGES
    - List all significant changes in bullet points
    - For each change:
        * What was changed
        * Where it was changed (section/location)
        * The impact or significance of the change

    3. STATISTICAL SUMMARY
    - Number of additions
    - Number of deletions
    - Number of modifications
    - Most affected sections/areas

    4. KEY FINDINGS
    - Most important changes
    - Potential implications
    - Critical differences that need attention

    Format the report with clear headers and bullet points. Be specific and concise. Focus on meaningful changes rather than minor formatting differences.`;

    const response = await chain.invoke({ query: prompt2 });
    // const trimmedResponse = JSON.parse(
    //   response.text.replace(/```json\n|```/g, "")
    // );
    console.log(`${response.text}`);

    return { copmparedResponse: `${response.text}` };
  } catch (error) {
    throw error;
  }
};
