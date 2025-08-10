import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState(null);
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
      setAnalysis({ explain: "Please paste some code first." });
      return;
    }
    if (!API_KEY) {
      setError("API Key is missing. Cannot make request.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are a code analysis assistant. 
Analyze the following code and respond ONLY in this exact JSON format:

{
  "explanation": "short clear explanation",
  "time_complexity": "O(n)",
  "space_complexity": "O(1)",
  "improvements": "short clear improvements"
}

Here is the code:
\`\`\`
${code}
\`\`\`
`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      // Remove triple backticks if present
      if (text.startsWith("```")) {
        text = text.replace(/```(json)?/g, "").trim();
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Raw text:", text);
        throw new Error("Gemini returned invalid JSON. Try again.");
      }

      setAnalysis({
        explain: parsed.explanation,
        time: parsed.time_complexity,
        space: parsed.space_complexity,
        improve: parsed.improvements
      });
    } catch (err) {
      console.error("Gemini API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl flex flex-col px-6 py-8 bg-gray-800 rounded-lg shadow-xl">
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

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h2 className="font-semibold text-lg mb-2 text-green-300">Explanation:</h2>
              <p className="text-gray-200">{analysis.explain}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h2 className="font-semibold text-lg mb-2 text-yellow-300">Time Complexity:</h2>
              <p className="text-gray-200">{analysis.time}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h2 className="font-semibold text-lg mb-2 text-blue-300">Space Complexity:</h2>
              <p className="text-gray-200">{analysis.space}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h2 className="font-semibold text-lg mb-2 text-purple-300">Improvements:</h2>
              <p className="text-gray-200">{analysis.improve}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
