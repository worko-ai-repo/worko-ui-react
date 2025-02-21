// QuestionDisplay.jsx
import React from 'react';
import { useMockInterview } from '../../context/MockInterview.context';
import { mockInterviewQuestions } from '@Pages/mock-interview/questions';

const QuestionDisplay = () => {
	const { currentQuestionIndex, answerTimer } = useMockInterview();
	const currentQuestion = mockInterviewQuestions[currentQuestionIndex];

	return (
		<div>
			<h2>Question {currentQuestionIndex + 1}</h2>
			<p>{currentQuestion.text}</p>
			<p>Time left to answer: {answerTimer}s</p>
		</div>
	);
};

export default QuestionDisplay;
