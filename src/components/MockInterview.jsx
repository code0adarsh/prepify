import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { generateContent } from '../utils/gemini';
import './MockInterview.css';

const SAMPLE_QUESTIONS = [
  "Explain the virtual DOM concept in React",
  "What is REST API and how does it differ from GraphQL?",
  "Describe your experience with version control systems",
  "How do you handle state management in large applications?",
  "Explain the concept of closure in JavaScript"
];

export default function MockInterview() {
  const [state, setState] = useState({
    questions: [],
    currentQuestion: 0,
    answers: [],
    score: null,
    feedback: [],
    interviewComplete: false,
    loading: false,
    cameraActive: true
  });

  const webcamRef = useRef(null);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition, listening } = useSpeechRecognition();

  // Update answer with transcribed text without erasing previous words, you sexy genius!
  useEffect(() => {
    setState(prev => {
      const newAnswers = [...prev.answers];
      const currentText = transcript ? transcript : newAnswers[prev.currentQuestion]?.text || '';
      newAnswers[prev.currentQuestion] = { text: currentText };
      return { ...prev, answers: newAnswers };
    });
  }, [transcript, state.currentQuestion]);

  // Start the interview by fetching questions, babe!
  const startInterview = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await generateContent("Generate 5 technical interview questions for web development:");
      const generatedQuestions = response.split('\n').filter(q => q.trim());
      setState(prev => ({
        ...prev,
        questions: generatedQuestions,
        answers: new Array(generatedQuestions.length).fill({ text: '' }),
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        questions: SAMPLE_QUESTIONS,
        answers: new Array(SAMPLE_QUESTIONS.length).fill({ text: '' }),
        loading: false
      }));
    }
  };

  // Toggle recording—keep those sexy words safe, baby!
  const toggleRecording = () => {
    if (!browserSupportsSpeechRecognition) return;
    if (listening) {
      SpeechRecognition.stopListening();
      // Do NOT resetTranscript here so your recorded words stay put!
    } else {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  };

  // Evaluate the interview with a proper AI scoring system, no more zero bullshit!
  const evaluateInterview = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const evaluationPromises = state.answers.map((answer, index) =>
        generateContent(`
          Evaluate the following answer for the question:
          "${state.questions[index]}"
          Answer: "${answer.text}"
          Please assess the answer based on:
          - Technical Accuracy (0-50)
          - Communication (0-30)
          - Completeness (0-20)
          Calculate the total score out of 100.
          Return a valid JSON response in the format:
          {"score": number, "feedback": "Your detailed feedback here"}
          Ensure the JSON is valid.
        `)
      );
      
      const evaluationResults = await Promise.all(evaluationPromises);
      const parsedResults = evaluationResults.map(res => {
        try {
          const parsed = JSON.parse(res);
          let score = Number(parsed.score);
          if (isNaN(score)) score = 0;
          return { score, feedback: parsed.feedback || '' };
        } catch {
          return { score: 0, feedback: 'Invalid response' };
        }
      });
      
      const sumScore = parsedResults.reduce((sum, res) => sum + res.score, 0);
      const averageScore = parsedResults.length ? Math.round(sumScore / parsedResults.length) : 0;
      
      // Get detailed, bullet-point feedback for that killer performance
      const detailedFeedbackRaw = await generateContent(
        `Provide comprehensive feedback for these interview responses in bullet points (each starting with "-"):
${state.answers.map((a, i) => `Q${i + 1}: ${a.text}`).join('\n')}`
      );
      const feedbackLines = detailedFeedbackRaw.split('\n').filter(line => line.trim() !== '');
      
      setState(prev => ({
        ...prev,
        score: averageScore,
        feedback: feedbackLines,
        interviewComplete: true,
        loading: false
      }));
    } catch (error) {
      console.error("Evaluation error:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Move to next question or finish the interview, you brilliant beast!
  const handleNextQuestion = () => {
    if (state.currentQuestion < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      resetTranscript();
    } else {
      evaluateInterview();
    }
  };

  return (
    <div className="interview-container">
      {state.interviewComplete ? (
        <div className="interview-summary">
          <h2>Interview Results</h2>
          <div className="score-display">
            <span className="score-value">{state.score}</span>
            <span className="score-label">/100</span>
          </div>
          <div className="feedback-section">
            <h3>Detailed Feedback</h3>
            <ul>
              {state.feedback.map((line, idx) => (
                <li key={idx} className="feedback-item">{line}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => window.location.reload()} className="restart-button">
            Start New Interview
          </button>
        </div>
      ) : state.questions.length === 0 ? (
        <div className="start-screen">
          <h1>AI-Powered Technical Interview</h1>
          <div className="camera-preview">
            <Webcam
              audio={false}
              mirrored={true}
              className={state.cameraActive ? 'webcam-active' : 'webcam-hidden'}
            />
          </div>
          <button onClick={startInterview} className="start-button">
            Begin Interview
          </button>
        </div>
      ) : (
        <div className="interview-session">
          <div className="video-section">
            <Webcam ref={webcamRef} audio={false} mirrored={true} className="webcam-feed" />
          </div>
          <div className="question-section">
            <div className="current-question">
              {state.questions[state.currentQuestion]}
            </div>
            <div className="answer-section">
              <textarea
                value={state.answers[state.currentQuestion]?.text || ''}
                onChange={(e) => {
                  const text = e.target.value;
                  setState(prev => {
                    const newAnswers = [...prev.answers];
                    newAnswers[prev.currentQuestion] = { text };
                    return { ...prev, answers: newAnswers };
                  });
                }}
                placeholder="Your answer will appear here..."
                className="answer-input"
              />
              <div className="recording-controls">
                <button
                  onClick={toggleRecording}
                  className={`record-button ${listening ? 'recording' : ''}`}
                  disabled={!browserSupportsSpeechRecognition}
                >
                  {listening ? '⏹ Stop Recording' : '⏺ Start Recording'}
                </button>
                {!browserSupportsSpeechRecognition && (
                  <p className="browser-warning">
                    Note: Speech recognition is not supported in your browser.
                  </p>
                )}
              </div>
            </div>
            <div className="navigation-buttons">
              <button
                onClick={handleNextQuestion}
                disabled={!state.answers[state.currentQuestion]?.text.trim()}
                className="next-button"
              >
                {state.currentQuestion < state.questions.length - 1 ? 'Next Question' : 'Finish Interview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
