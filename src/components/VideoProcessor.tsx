'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, Scissors, Volume2, VolumeX } from 'lucide-react';

interface VideoProcessorProps {
  file: File;
  onProcessed: (processedFile: File) => void;
  onCancel: () => void;
}

export default function VideoProcessor({ file, onProcessed, onCancel }: VideoProcessorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [clipDuration, setClipDuration] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(Math.min(clipDuration, videoDuration));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentVideoTime = videoRef.current.currentTime;
      setCurrentTime(currentVideoTime);

      if (currentVideoTime >= endTime && isPlaying) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processVideo = useCallback(async () => {
    if (!videoRef.current || !duration) return;

    setIsProcessing(true);

    try {
      // Create a new video element for processing
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.muted = false; // Ensure audio is included

      // Wait for video to be ready
      await new Promise((resolve) => {
        tempVideo.onloadedmetadata = resolve;
      });

      // Create audio context to handle audio portion
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(tempVideo);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      // Create canvas for video processing
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = tempVideo.videoWidth;
      canvas.height = tempVideo.videoHeight;

      // Get video stream from canvas
      const videoStream = canvas.captureStream(30);

      // Combine video and audio streams
      const audioTracks = destination.stream.getAudioTracks();
      const videoTracks = videoStream.getVideoTracks();

      const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);

      // Create MediaRecorder with combined stream
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2000000,
        audioBitsPerSecond: 128000
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const processedBlob = new Blob(chunks, { type: 'video/webm' });
        const processedFile = new File([processedBlob], `cropped_${file.name}`, {
          type: 'video/webm',
          lastModified: Date.now()
        });

        // Clean up
        audioContext.close();
        tempVideo.remove();

        onProcessed(processedFile);
        setIsProcessing(false);
      };

      // Set up video processing
      tempVideo.currentTime = startTime;

      const drawFrame = () => {
        if (tempVideo.currentTime >= endTime) {
          mediaRecorder.stop();
          return;
        }

        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

        if (mediaRecorder.state === 'recording') {
          requestAnimationFrame(drawFrame);
        }
      };

      tempVideo.onseeked = () => {
        mediaRecorder.start();
        drawFrame();
        tempVideo.play();
      };

    } catch (error) {
      console.error('Video processing error:', error);
      alert('Error processing video. Please try again.');
      setIsProcessing(false);
    }
  }, [startTime, endTime, duration, file.name, onProcessed, videoUrl]);

  const selectedDuration = endTime - startTime;
  const isValidSelection = selectedDuration > 0 && selectedDuration <= 30;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Crop Video (Max 30 seconds)</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-auto max-h-[400px]"
                controls={false}
                muted={isMuted}
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-800 flex items-center justify-center">
                <div className="text-gray-400">Loading video...</div>
              </div>
            )}

            {videoUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={handlePlayPause}
                    className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>

                  <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-3 py-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #6b7280 ${(isMuted ? 0 : volume) * 100}%, #6b7280 100%)`
                      }}
                    />
                  </div>
                </div>
                <div className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3">📏 Clip Duration</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={clipDuration}
                  onChange={(e) => {
                    const newDuration = Number(e.target.value);
                    setClipDuration(newDuration);
                    setEndTime(Math.min(startTime + newDuration, duration));
                  }}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-lg font-bold text-blue-700 min-w-[3rem]">
                  {clipDuration}s
                </span>
              </div>
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>5 seconds</span>
                <span>30 seconds</span>
              </div>
            </div>

            <div className="relative mb-4">
              <div className="text-center mb-2">
                <span className="text-lg font-bold text-blue-700">
                  Select {clipDuration}-second clip from your {formatTime(duration)} video
                </span>
              </div>

              <div ref={timelineRef} className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gray-300"></div>

                <div
                  className="absolute top-0 h-full bg-blue-500 border-2 border-blue-600 cursor-move flex items-center justify-between select-none"
                  style={{
                    left: `${(startTime / duration) * 100}%`,
                    width: `${Math.min(clipDuration, duration) / duration * 100}%`
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startPosition = startTime;

                    if (!timelineRef.current) return;

                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const timelineWidth = timelineRef.current!.offsetWidth;
                      const deltaTime = (deltaX / timelineWidth) * duration;

                      const newStartTime = Math.max(0, Math.min(duration - clipDuration, startPosition + deltaTime));
                      setStartTime(newStartTime);
                      setEndTime(Math.min(duration, newStartTime + clipDuration));
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="w-2 h-full bg-blue-700 cursor-ew-resize"></div>
                  <div className="flex-1 text-center text-white text-xs font-bold flex items-center justify-center">
                    {formatTime(selectedDuration)}
                  </div>
                  <div className="w-2 h-full bg-blue-700 cursor-ew-resize"></div>
                </div>

                <div
                  className="absolute top-0 w-0.5 h-full bg-blue-800 z-10"
                  style={{
                    left: `${(currentTime / duration) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0:00</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="text-center mt-2">
                <span className="text-sm text-gray-600">
                  Selected: {formatTime(startTime)} to {formatTime(endTime)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">File Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Original: {file.name}</div>
                <div>Size: {(file.size / 1024 / 1024).toFixed(1)} MB</div>
                <div>Duration: {formatTime(duration)}</div>
                <div>Selected: {formatTime(selectedDuration)} ({Math.round((selectedDuration/duration) * 100)}% of original)</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={processVideo}
              disabled={isProcessing || !isValidSelection}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Scissors className="w-4 h-4 mr-2" />
                  Crop Video
                </div>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}