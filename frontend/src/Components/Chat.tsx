import { useState } from "react";
import { askGemini } from "../services/LLMService";
import { speechService } from "../services/SpeechService";
import { useStore } from "zustand";
import { ChatStore } from "../contexts/Store";
import "./Chat.css";

export default function Chat() {
  const [Loading, setLoading] = useState(false);
  const [reply, setreply] = useState("Olá! eu sou a sua assistente virtual, como posso ajudar a vossa excelência hoje?")
  const [question, setQuestion] = useState("");
  const setHistory = useStore(ChatStore, (s) => s.setHistory);


  async function askAssistant(userQuestion: string) {
    if (!userQuestion.trim() || Loading) return;

    setLoading(true);

    let response: string;

    response = await askGemini(userQuestion);

    setHistory("user", userQuestion);
    setHistory("assistant", response);

    // setQuestion(userQuestion);
    setreply(response);
    setLoading(false);

    speechService.speak(response);
  }

  function SpeechtoText() {
    if (!speechService.supported()) {
      const unsupportedMessage =
        "Reconhecimento de voz não suportado neste navegador.";

      setreply(unsupportedMessage);
      speechService.speak(unsupportedMessage);
      return;
    }

    setLoading(true);
    setreply("Ouvindo pergunta...");

    speechService.startListening(
      async (text) => {
        setLoading(false);
        await askAssistant(text);
      },
      () => {
        const errorMessage = "Erro ao reconhecer a fala.";

        setLoading(false);
        setreply(errorMessage);
        speechService.speak(errorMessage);
      }
    );
  }

  return (
    <div className="chat">
      <h3 className="chat-title">Assistente</h3>

      <div className="chat-box">
        <textarea
          className="chat-box-output"
          value={reply}
          // onChange={(e) => setQuestion(e.target.value)}
          placeholder="Resposta"
          readOnly={true}
        />

        <textarea
          className="chat-box-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAssistant(question);
            }
          }}
          placeholder="Digite uma pergunta ou comando"
        />

        <div className="chat-box-options">
          <div className="chat-box-icon enviar" onClick={() => { askAssistant(question) }}>
            { Loading?
              <svg xmlns="http://www.w3.org/2000/svg" fill="#05a864" viewBox="0 0 256 256"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path></svg>
            : 
              <svg xmlns="http://www.w3.org/2000/svg" fill="#05a864" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208ZM80,128a8,8,0,0,1,8-8h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88A8,8,0,0,1,80,128Z"></path></svg> }
          </div>

          <div className="chat-box-icon microfone" onClick={() => { if(!Loading){SpeechtoText()} }}>
            { Loading?
              <svg xmlns="http://www.w3.org/2000/svg" fill="#05a864" viewBox="0 0 256 256"><path d="M213.92,218.62l-160-176A8,8,0,0,0,42.08,53.38L80,95.09V128a48,48,0,0,0,69.11,43.12l11.1,12.2A63.41,63.41,0,0,1,128,192a64.07,64.07,0,0,1-64-64,8,8,0,0,0-16,0,80.11,80.11,0,0,0,72,79.6V240a8,8,0,0,0,16,0V207.59a78.83,78.83,0,0,0,35.16-12.22l30.92,34a8,8,0,1,0,11.84-10.76ZM128,160a32,32,0,0,1-32-32V112.69l41.66,45.82A32,32,0,0,1,128,160Zm57.52-3.91A63.32,63.32,0,0,0,192,128a8,8,0,0,1,16,0,79.16,79.16,0,0,1-8.11,35.12,8,8,0,0,1-7.19,4.49,7.88,7.88,0,0,1-3.51-.82A8,8,0,0,1,185.52,156.09ZM84,44.87A48,48,0,0,1,176,64v64a49.19,49.19,0,0,1-.26,5,8,8,0,0,1-8,7.17,8.13,8.13,0,0,1-.84,0,8,8,0,0,1-7.12-8.79c.11-1.1.17-2.24.17-3.36V64A32,32,0,0,0,98.64,51.25,8,8,0,1,1,84,44.87Z"></path></svg>
            :
              <svg xmlns="http://www.w3.org/2000/svg" fill="#05a864" viewBox="0 0 256 256"><path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V240a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path></svg> }
          </div>
        </div>
      </div>

    </div>
  );
}