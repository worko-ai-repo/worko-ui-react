import { useCallback, useEffect, useState } from 'react'; // Importing necessary hooks and functions from React
import { Recording } from '@Interfaces/Inteview.dto'; // Importing the Recording type from the interfaces
import { useSpeechSynthesis } from '@Hooks/useSpeechSynthesis.hook'; // Importing custom hook for speech synthesis (text-to-speech)
import { useMediaRecorder } from '@Hooks/useMediaRecorder.hook'; // Importing custom hook for media recording functionality
import { mockInterviewQuestions } from './questions'; // Importing mock interview questions
import { VideoPreview } from '@Components/Video-Preview/VideoPreview'; // Importing video preview component to show video stream
import { Camera, Mic, Play, SkipForward, Square } from 'lucide-react'; // Importing icons from lucide-react
import styles from './mock-interview.module.scss'; // Importing styles for the component

const MockInterview = () => {
	// Defining the MockInterview functional component

	// State hooks to manage different aspects of the interview
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks the index of the current question
	const [recordings, setRecordings] = useState<Recording[]>([]); // Array to store the recordings
	const [stream, setStream] = useState<MediaStream | null>(null); // MediaStream for handling the video/audio stream
	const [timer, setTimer] = useState(0); // Timer to track the recording duration

	// Custom hooks for media recording and speech synthesis
	const { isRecording, error, startRecording, stopRecording } = useMediaRecorder(); // Media recorder states and functions
	const { speak } = useSpeechSynthesis(); // Speech synthesis function to read the question aloud

	// Get the current question based on the currentQuestionIndex
	const currentQuestion = mockInterviewQuestions[currentQuestionIndex];

	// useEffect hook to manage the timer while recording is active
	useEffect(() => {
		let interval: number; // Variable to store the interval ID
		if (isRecording) {
			// If recording is active
			interval = window.setInterval(() => {
				// Start a timer that runs every 1000ms (1 second)
				setTimer(prev => prev + 1); // Increment the timer by 1 second
			}, 1000);
		}
		return () => clearInterval(interval); // Clear the interval when the effect is cleaned up (when isRecording is false or component unmounts)
	}, [isRecording]); // Dependency array, re-run this effect if isRecording changes

	// Function to start recording, triggered when the "Start Recording" button is clicked
	const handleStartRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Request access to the camera and microphone
			setStream(stream); // Set the stream (audio + video) in state
			await startRecording(currentQuestion.id); // Start recording with the current question ID
			await speak(currentQuestion.text); // Use speech synthesis to read the current question aloud
		} catch (err) {
			// If any error occurs (e.g., user denies access to media)
			console.error('Failed to start recording:', err); // Log the error to the console
		}
	}, [currentQuestion, startRecording, speak]); // Dependencies: re-run this function if currentQuestion, startRecording, or speak changes

	// Function to stop the recording, triggered when the "Stop Recording" button is clicked
	const handleStopRecording = useCallback(async () => {
		try {
			const recording = await stopRecording(); // Stop the recording and get the recording data
			setRecordings(prev => [...prev, { ...recording, questionId: currentQuestion.id }]); // Add the current recording to the recordings array, including the current question ID
			setTimer(0); // Reset the timer to 0 after the recording stops
			setStream(null); // Set stream to null after recording is done (stop the video/audio stream)
		} catch (err) {
			// If any error occurs while stopping the recording
			console.error('Failed to stop recording:', err); // Log the error to the console
		}
	}, [currentQuestion.id, stopRecording]); // Dependencies: re-run this function if currentQuestion.id or stopRecording changes

	// Function to move to the next question
	const handleNext = useCallback(() => {
		if (currentQuestionIndex < mockInterviewQuestions.length - 1) {
			// If there are more questions left
			setCurrentQuestionIndex(prev => prev + 1); // Move to the next question
		}
	}, [currentQuestionIndex]); // Dependency: re-run this function if currentQuestionIndex changes

	// Function to format the timer value (in seconds) to "minutes:seconds"
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60); // Calculate minutes from seconds
		const secs = seconds % 60; // Get the remaining seconds
		return `${mins}:${secs.toString().padStart(2, '0')}`; // Return formatted time as a string (e.g., "1:05")
	};

	// The JSX for the MockInterview component
	return (
		<section className="section-wrapper">
			{' '}
			{/* Wrapper for the section */}
			<div className={styles.container}>
				{' '}
				{/* Main container for the mock interview */}
				<div className={styles.questionSection}>
					{' '}
					{/* Section that displays the current question */}
					<h2 className={styles.questionNumber}>
						{' '}
						{/* Display question number */}
						Question {currentQuestionIndex + 1} of {mockInterviewQuestions.length} {/* Current question number and total questions */}
					</h2>
					<div className={styles.question}>
						{' '}
						{/* Display the current question text */}
						{currentQuestion.text}
					</div>
					<div className={styles.timer}>
						{' '}
						{/* Display the timer while recording */}
						{isRecording && <span>Recording: {formatTime(timer)}</span>} {/* Show the timer if recording */}
					</div>
				</div>
				<div className={styles.videoSection}>
					{' '}
					{/* Section for video preview and recording controls */}
					<VideoPreview stream={stream} /> {/* Video preview component to show the live video stream */}
					<div className={styles.controls}>
						{' '}
						{/* Section for controlling the recording */}
						{!isRecording ? ( // If not recording
							<button
								onClick={handleStartRecording} // Start recording on click
								className={styles.startButton} // Apply start button styles
								disabled={error !== null} // Disable button if there is an error
							>
								<Play className="w-6 h-6" /> {/* Play icon */}
								Start Recording {/* Button text */}
							</button>
						) : (
							// If recording
							<button
								onClick={handleStopRecording} // Stop recording on click
								className={styles.stopButton} // Apply stop button styles
							>
								<Square className="w-6 h-6" /> {/* Stop icon */}
								Stop Recording {/* Button text */}
							</button>
						)}
						<button
							onClick={handleNext} // Move to the next question
							className={styles.nextButton} // Apply next button styles
							disabled={isRecording || currentQuestionIndex >= mockInterviewQuestions.length - 1} // Disable button if recording or at last question
						>
							<SkipForward className="w-6 h-6" /> {/* Skip forward icon */}
							Next Question {/* Button text */}
						</button>
					</div>
					{error && ( // If there is an error, display it
						<div className={styles.error}>
							{error} {/* Show error message */}
						</div>
					)}
					<div className={styles.status}>
						{' '}
						{/* Display the status of camera and microphone connection */}
						<div className={styles.statusItem}>
							{' '}
							{/* Camera status */}
							<Camera className="w-4 h-4" /> {/* Camera icon */}
							Camera: {stream ? 'Connected' : 'Not connected'} {/* Show if camera is connected or not */}
						</div>
						<div className={styles.statusItem}>
							{' '}
							{/* Microphone status */}
							<Mic className="w-4 h-4" /> {/* Microphone icon */}
							Microphone: {stream ? 'Connected' : 'Not connected'} {/* Show if microphone is connected or not */}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default MockInterview; // Exporting the MockInterview component
