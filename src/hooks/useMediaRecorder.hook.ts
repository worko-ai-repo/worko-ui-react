import { useState, useRef, useCallback } from 'react'; // Importing React hooks
import type { Recording } from '@Interfaces/Inteview.dto'; // Importing the Recording type for type safety

export const useMediaRecorder = () => {
	// State to track if recording is in progress
	const [isRecording, setIsRecording] = useState(false);

	// State to store error messages if any issue occurs
	const [error, setError] = useState<string | null>(null);

	// Reference to the MediaRecorder instance
	const mediaRecorder = useRef<MediaRecorder | null>(null);

	// Reference to the MediaStream (video + audio) used for recording
	const streamRef = useRef<MediaStream | null>(null);

	// Reference to store recorded chunks of data
	const chunksRef = useRef<Blob[]>([]);

	// Reference to track the start time of the recording
	const startTimeRef = useRef<number>(0);

	// Function to start recording
	const startRecording = useCallback(async (questionId: string) => {
		try {
			// Request access to the user's camera and microphone
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true, // Request video stream
				audio: true, // Request audio stream
			});

			// Save the stream to the reference
			streamRef.current = stream;

			// Create a new MediaRecorder instance using the stream
			mediaRecorder.current = new MediaRecorder(stream);

			// Clear any existing chunks to start fresh
			chunksRef.current = [];

			// Event handler for when data is available
			mediaRecorder.current.ondataavailable = event => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data); // Save the recorded data chunks
				}
			};

			// Save the start time of the recording
			startTimeRef.current = Date.now();

			// Start recording
			mediaRecorder.current.start();

			// Set the recording state to true
			setIsRecording(true);

			// Reset any previous errors
			setError(null);
		} catch (err) {
			// Set error message if any error occurs
			setError('Failed to access camera or microphone. Please ensure permissions are granted.');
			console.error('Media recorder error:', err); // Log the error for debugging
		}
	}, []); // Empty dependency array ensures this function is memoized

	// Function to stop recording
	const stopRecording = useCallback((): Promise<Recording> => {
		return new Promise((resolve, reject) => {
			// Ensure there's an active MediaRecorder instance and stream
			if (!mediaRecorder.current || !streamRef.current) {
				reject(new Error('No active recording')); // Reject the promise if no recording is active
				return;
			}

			// Event handler for when the MediaRecorder stops
			mediaRecorder.current.onstop = () => {
				// Calculate the duration of the recording
				const duration = Date.now() - startTimeRef.current;

				// Combine recorded chunks into a single Blob
				const blob = new Blob(chunksRef.current, { type: 'video/webm' });

				// Stop all tracks of the stream (releases the camera/microphone)
				streamRef.current?.getTracks().forEach(track => track.stop());

				// Set the recording state to false
				setIsRecording(false);

				// Resolve the promise with the recording details
				resolve({
					blob, // Recorded video/audio blob
					duration, // Total duration of the recording
					timestamp: Date.now(), // Timestamp when the recording stopped
					questionId: '', // Placeholder for the question ID (should be passed or managed elsewhere)
				});
			};

			// Stop the MediaRecorder instance
			mediaRecorder.current.stop();
		});
	}, []); // Empty dependency array ensures this function is memoized

	// Return the hook's state and functions
	return {
		isRecording, // Whether recording is active
		error, // Error message (if any)
		startRecording, // Function to start recording
		stopRecording, // Function to stop recording
	};
};
