import React, { useState, useEffect } from "react";
import quiz from "./quiz.json"; // Import local JSON file
import correctSound from './sounds/correct_sound.wav';  
import incorrectSound from './sounds/incorrect_sound.wav';  
import './App.css'; // Custom CSS file for animations and extra styles
import backgroundVideo from './sounds/3191572-uhd_3840_2160_25fps.mp4';

function QuizApp() {
  // State for quiz data and tracking quiz progress
  const [quizDataParsed, setQuizDataParsed] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for answer feedback and button selection
  const [answerResult, setAnswerResult] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer
  
  // New state for the per-question timer (15 seconds per question)
  const [timeLeft, setTimeLeft] = useState(15);

  // Audio objects for sound effects
  const correctAudio = new Audio(correctSound);
  const incorrectAudio = new Audio(incorrectSound);

  // Load quiz data on mount
  useEffect(() => {
    setQuizDataParsed(quiz.questions);
    setLoading(false);
  }, []);

  // Timer effect: counts down every second for the current question
  useEffect(() => {
    if (loading || quizComplete) return;

    // If an answer is already selected, pause the timer
    if (selectedAnswer !== null) return;

    // Decrement timeLeft every 1 second
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // When time runs out, automatically treat as an incorrect answer.
      handleAnswer(false, -1); // Index -1 indicates no option was selected.
    }
  }, [timeLeft, selectedAnswer, loading, quizComplete]);

  // Handle answer selection (or time-out)
  const handleAnswer = (isCorrect, index) => {
    setSelectedAnswer(index);  // Store the index of the selected answer

    if (isCorrect) {
      setScore(score + 1);
      correctAudio.play();
      setAnswerResult("Correct! 🎉");
    } else {
      incorrectAudio.play();
      setAnswerResult("Oops! Incorrect. 😔");
    }

    // Wait briefly to show feedback, then move to the next question
    setTimeout(() => {
      if (currentQuestionIndex < quizDataParsed.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null); // Reset the selection state
        setAnswerResult(null);
        setTimeLeft(15); // Reset timer for the next question
      } else {
        setQuizComplete(true);
      }
    }, 1000);
  };

  // Restart quiz by resetting all state variables
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setAnswerResult(null);
    setSelectedAnswer(null);
    setTimeLeft(15);
  };

  // Show a loading message while the quiz data is being processed
  if (loading) return <p className="text-center mt-5">Loading quiz...</p>;

  // When the quiz is complete, show the final score and a restart button
  if (quizComplete) {
    return (
      <div className="result-container">
  <h2>🎉 Quiz Completed!</h2>
  <p className="score-text">
    Your Score: <strong>{score}/{quizDataParsed.length}</strong>
  </p>
  <button className="restart-btn" onClick={restartQuiz}>
    Restart Quiz
  </button>
</div>

    );
  }

  // Current question and progress percentage calculation
  const currentQuestion = quizDataParsed[currentQuestionIndex];
  const progressPercentage = (currentQuestionIndex / quizDataParsed.length) * 100;

  return (
    <div className="quiz-container">
      {/* Background Video */}
      <video autoPlay playsInline loop muted className="background-video">
  <source src={backgroundVideo} type="video/mp4" />
</video>

      <div className="container text-center">
        <h1 className="my-4">Genetics and Evolution Quiz</h1>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        {/* Timer Display */}
        <div className="timer mb-3">
          <span>Time Left: {timeLeft} sec</span>
        </div>

        {/* Question Box */}
        <div className="que">{currentQuestion?.description}</div>

        {/* Feedback Message with Animation */}
        {answerResult && <div className="feedback animate__animated animate__fadeIn">{answerResult}</div>}

        {/* Options */}
        <div className="options-container">
          {currentQuestion?.options?.map((option, index) => (
            <button
              key={index}
              className={`btn btn-lg option-btn ${
                selectedAnswer !== null
                  ? option.is_correct
                    ? "correct"
                    : index === selectedAnswer
                    ? "incorrect"
                    : ""
                  : "btn-outline-primary"
              }`}
              onClick={() => handleAnswer(option.is_correct, index)}
              disabled={selectedAnswer !== null}  // Disable buttons after an answer is selected
            >
              {option.description}
            </button>
          ))}
        </div>

        {/* Question Tracker */}
        <div className="question-tracker">
          Question {currentQuestionIndex + 1} / {quizDataParsed.length}
        </div>
      </div>
    </div>
  );
}

export default QuizApp;

