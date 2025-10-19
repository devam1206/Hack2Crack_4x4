import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import React Router for navigation
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const ChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // React Router navigation hook

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Fetch AI response from Google Gemini API
  const fetchChatbotResponse = async (userInput) => {
    try {
      const result = await model.generateContent(userInput);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  // Handle sending message
  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    // Check if input contains navigation keywords
    handleVoiceNavigation(userInput);

    try {
      const botResponse = await fetchChatbotResponse(userInput);
      setMessages([...newMessages, { sender: "bot", text: botResponse }]);
    } catch (error) {
      setMessages([...newMessages, { sender: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🗣️ Start Voice Recognition
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false; // Stop after one phrase
    recognition.lang = "en-US"; // Auto-detect language (can be set to `navigator.language`)
    recognition.interimResults = false; // Do not return partial results

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase(); // Convert to lowercase for easy comparison
      console.log(`Recognized text: ${transcript}`);
      setUserInput(transcript);

      // Check for navigation commands
      handleVoiceNavigation(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Stopped listening.");
    };

    recognition.start();
  };

  const handleVoiceNavigation = (text) => {
    if (text.includes("home")) {
      navigate("/welcome");
    } else if (text.includes("crop prediction") || text.includes("predict yield") || text.includes("fasal ki upaj") || text.includes("fasal ka anuman")) {
      navigate("/Croppred");
    } else if (text.includes("disease detection") || text.includes("crop disease") || text.includes("rog pehchan") || text.includes("fasal rog") || text.includes("bimari") || text.includes("beemari")) {
      navigate("/Disease");
    } else if (text.includes("weather forecast") || text.includes("weather") || text.includes("mausam")) {
      navigate("/Weather");
    } else {
      console.log("No matching command found.");
    }
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-4 right-4 bg-[#73974e] text-white p-4 rounded-full shadow-lg hover:bg-[#5d7d3c] z-50"
      >
        💬
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-91.5 h-100 bg-white shadow-lg rounded-lg flex flex-col z-50">
          <div className="flex items-center justify-between bg-[#73974e] text-white p-2 rounded-t-lg">
            <span className="font-bold">Chatbot</span>
            <button onClick={toggleChatbot} className="text-white font-bold">
              ✕
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-green-100 self-end text-right"
                    : "bg-gray-200 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="mb-2 p-2 rounded-lg bg-gray-200 self-start">Typing...</div>}
          </div>

          {/* Input Area */}
          <div className="p-2 flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Type a message..."
              disabled={isLoading}
            />

            {/* Voice Input Button */}
            <button
              onClick={startListening}
              className={`p-2 rounded-full ${
                isListening ? "bg-red-500" : "bg-blue-500"
              } text-white hover:bg-blue-600`}
              title="Click to speak"
            >
              🎤
            </button>

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
              className={`px-4 py-2 rounded-lg text-white ${
                userInput.trim() && !isLoading
                  ? "bg-[#73974e] hover:bg-[#5d7d3c]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPopup;
