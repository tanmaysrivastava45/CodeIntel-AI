import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [code, setCode] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    if (!API_KEY) {
      setError("API Key not loaded. Please check your .env file.");
    }
  }, [API_KEY]);

  const handleAnalyze = async () => {
    setError(null);
    if (code.trim() === "") {
      setResponse("Please paste some code first.");
      return;
    }
    if (!API_KEY) {
      setError("API Key is missing. Cannot make request.");
      setResponse("Error: API Key not configured.");
      return;
    }

    setLoading(true);
    setResponse("Analyzing code... 🧠");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a code analysis assistant. Please analyze the following code:
      1. Explain what this code does.
      2. Identify the time and space complexity.
      3. Suggest improvements if possible.

      Here is the code:
      \`\`\`
      ${code}
      \`\`\``;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setResponse(text);
      } catch (err) {
      console.error("Gemini API error:", err);
      if (err.message.includes("API key not valid")) {
        setResponse("Error: Invalid API Key.");
      } else if (err.message.includes("quota exceeded")) {
        setResponse("Error: Quota exceeded.");
      } else {
        setResponse("Something went wrong. Check console for details.");
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col px-6 py-8 bg-gray-800 rounded-lg shadow-xl">
        <div href = "/public"></div>
        
      <img
        src="/image.png" 
        alt="CodeIntel AI Logo"
        className="w-40 h-auto mx-auto mb-6"
      />
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-blue-400">
        Analyse your code with CodeIntel AI
      </h1>
        <textarea
          className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 text-white resize-none"
          rows="10"
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />

        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={loading || code.trim() === ""}
          className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium self-center transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze Code"}
        </button>

        {response && (
          <div className="mt-8 w-full bg-gray-700 p-6 rounded-lg border border-gray-600 whitespace-pre-wrap shadow-inner">
            <h2 className="font-semibold text-lg mb-3 text-green-300">Analysis:</h2>
            <p className="text-gray-200">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
