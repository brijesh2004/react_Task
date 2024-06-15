import React, { useState, useEffect, useRef } from 'react';
import questionData from '../question.json';
import './quiz.css';

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(questionData.questions.length).fill(null));
  const [quizStart, setQuizStart] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedQuizStart = localStorage.getItem('quizStart');
    const savedTimeLeft = localStorage.getItem('timeLeft');
    const savedCurrentQuestion = localStorage.getItem('currentQuestion');
    const savedUserAnswers = localStorage.getItem('userAnswers');
    const savedIsFullScreen = localStorage.getItem('isFullScreen');

    if (savedQuizStart) {
      setQuizStart(JSON.parse(savedQuizStart));
    }
    if (savedTimeLeft) {
      setTimeLeft(parseInt(savedTimeLeft, 10));
    }
    if (savedCurrentQuestion) {
      setCurrentQuestion(parseInt(savedCurrentQuestion, 10));
    }
    if (savedUserAnswers) {
      setUserAnswers(JSON.parse(savedUserAnswers));
    }
    if (savedIsFullScreen) {
      setIsFullScreen(JSON.parse(savedIsFullScreen));
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem('timeLeft', timeLeft);
      } else if (!document.fullscreenElement && !showResult) {
        setIsFullScreen(false);
        localStorage.setItem('isFullScreen', false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleVisibilityChange);
    };
  }, [timeLeft, showResult]);

  useEffect(() => {
    if (quizStart && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            calculateScore();
            setShowResult(true);
            return 0;
          }
          localStorage.setItem('timeLeft', prevTime - 1);
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [quizStart, showResult]);

  const handleNext = () => {
    if (currentQuestion < questionData.questions.length - 1) {
      setCurrentQuestion((prev) => {
        const next = prev + 1;
        localStorage.setItem('currentQuestion', next);
        return next;
      });
    } else {
      calculateScore();
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => {
      const next = Math.max(prev - 1, 0);
      localStorage.setItem('currentQuestion', next);
      return next;
    });
  };

  const handleOptionClick = (option) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestion] = option;
    setUserAnswers(updatedAnswers);
    localStorage.setItem('userAnswers', JSON.stringify(updatedAnswers));
  };

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setIsFullScreen(true);
    localStorage.setItem('isFullScreen', true);
  };

  const startQuiz = () => {
    setQuizStart(true);
    localStorage.setItem('quizStart', true);
    localStorage.setItem('timeLeft', 600);
    setTimeLeft(600);
    enterFullScreen();
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questionData.questions[index].answer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    localStorage.removeItem('timeLeft');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('userAnswers');
    localStorage.removeItem('quizStart');
    localStorage.removeItem('isFullScreen');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="quiz-container">
      {!quizStart ? (
        <button className="start-quiz-button" onClick={startQuiz}>
          Start Quiz
        </button>
      ) : showResult ? (
        <div className="result-container">
          <h2>Your Score: {score} / {questionData.questions.length}</h2>
          <div className="activity-summary">
            {questionData.questions.map((question, index) => (
              <div key={index} className="question-summary">
                <h3>Question {index + 1}: {question.question}</h3>
                <p>Your Answer: {userAnswers[index]}</p>
                <p>Correct Answer: {question.answer}</p>
                <p className={userAnswers[index] === question.answer ? 'correct' : 'incorrect'}>
                  {userAnswers[index] === question.answer ? 'Correct' : 'Incorrect'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="question-container">
          <div className="timer">Time Left: {formatTime(timeLeft)}</div>
          <h2>{questionData.questions[currentQuestion].question}</h2>
          <ul className="options-list">
            {questionData.questions[currentQuestion].options.map((option, index) => (
              <li
                key={index}
                className={`option ${userAnswers[currentQuestion] === option ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </li>
            ))}
          </ul>
          <div className="navigation-buttons">
            <button onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </button>
            <button onClick={handleNext}>
              {currentQuestion === questionData.questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {!isFullScreen && !showResult && (
        <div className="fullscreen-prompt">
          <p>Please enter full-screen mode to continue the quiz.</p>
          <button onClick={enterFullScreen}>Enter Full-Screen</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
