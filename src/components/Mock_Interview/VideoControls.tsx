// VideoControls.jsx
import { useMockInterview } from '../../context/MockInterview.context';

const VideoControls = () => {
	const { stream, isRecording, startRecording, stopRecording, nextQuestion, endInterview, answerTimer } = useMockInterview();

	return (
		<div>
			<video autoPlay muted playsInline ref={ref => ref && stream && (ref.srcObject = stream)} />
			<button onClick={() => startRecording('questionId')} disabled={isRecording}>
				Start Recording
			</button>
			<button onClick={stopRecording} disabled={!isRecording}>
				Stop Recording
			</button>
			<button onClick={nextQuestion} disabled={answerTimer > 0}>
				Next Question ({answerTimer}s)
			</button>
			<button onClick={endInterview}>End Interview</button>
		</div>
	);
};

export default VideoControls;
