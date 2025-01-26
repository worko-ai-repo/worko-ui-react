import React, { useEffect, useRef } from 'react';
import styles from './videopreview.module.scss';

interface VideoPreviewProps {
  stream: MediaStream | null;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={styles.video}
      />
    </div>
  );
};