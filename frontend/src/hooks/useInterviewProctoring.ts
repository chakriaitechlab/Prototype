'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Violation } from '@/types/interviews';

const VISION_WASM_URL = '/mediapipe/wasm';
const FACE_MODEL_URL = '/mediapipe/models/blaze_face_short_range.tflite';
const OBJECT_MODEL_URL = '/mediapipe/models/efficientdet_lite0.tflite';
const SAMPLE_INTERVAL_MS = 1_000;
const FACE_SAMPLES_TO_WARN = 3;
const PHONE_SAMPLES_TO_WARN = 2;
const BLUR_CHECK_DELAY_MS = 250;
const MEDIAPIPE_LOG_MARKERS = [
  'Created TensorFlow Lite XNNPACK',
  'OpenGL error checking is disabled',
  'inference_feedback_manager',
  'gl_context.cc',
  'vision_wasm_internal',
];

function isMediaPipeLog(value: unknown) {
  return typeof value === 'string' && MEDIAPIPE_LOG_MARKERS.some((marker) => value.includes(marker));
}

function silenceMediaPipeLogs() {
  const { error, warn } = console;
  console.error = (...args: unknown[]) => (isMediaPipeLog(args[0]) ? console.debug(...args) : error.apply(console, args));
  console.warn = (...args: unknown[]) => (isMediaPipeLog(args[0]) ? console.debug(...args) : warn.apply(console, args));
  return () => {
    console.error = error;
    console.warn = warn;
  };
}

type Detector = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => { detections?: unknown[] };
  close: () => void;
};

interface ProctoringOptions {
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onViolation: (violation: Violation) => void;
}

export function useInterviewProctoring({ enabled, videoRef, onViolation }: ProctoringOptions) {
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    if (!enabled) return;
    const report = (violation: Violation) => onViolationRef.current(violation);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') report({ type: 'tab_hidden', message: 'Do not switch tabs during the interview.' });
    };
    const onBlur = () => {
      window.setTimeout(() => {
        if (document.visibilityState === 'visible' && !document.hasFocus()) {
          report({ type: 'window_blur', message: 'Keep the interview window active.' });
        }
      }, BLUR_CHECK_DELAY_MS);
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) report({ type: 'fullscreen_exit', message: 'Stay in fullscreen during the interview.' });
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const report = (violation: Violation) => onViolationRef.current(violation);

    let cancelled = false;
    let faceDetector: Detector | null = null;
    let objectDetector: Detector | null = null;
    let intervalId: number | null = null;
    let missingFace = 0;
    let multipleFaces = 0;
    let phoneSeen = 0;
    let sample = 0;
    let lastTimestamp = -1;
    const restoreConsole = silenceMediaPipeLogs();

    void (async () => {
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const fileset = await vision.FilesetResolver.forVisionTasks(VISION_WASM_URL);
        if (cancelled) return;

        faceDetector = await vision.FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_URL },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.6,
        }).catch(() => null);
        objectDetector = await vision.ObjectDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: OBJECT_MODEL_URL },
          runningMode: 'VIDEO',
          scoreThreshold: 0.45,
          categoryAllowlist: ['cell phone'],
          maxResults: 2,
        }).catch(() => null);
        if (cancelled) return;

        intervalId = window.setInterval(() => {
          const video = videoRef.current;
          if (!video || video.paused || video.videoWidth === 0 || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

          const timestamp = performance.now();
          if (timestamp <= lastTimestamp) return;
          lastTimestamp = timestamp;

          const faces = faceDetector?.detectForVideo(video, timestamp).detections?.length;
          if (faces !== undefined) {
            missingFace = faces === 0 ? missingFace + 1 : 0;
            multipleFaces = faces > 1 ? multipleFaces + 1 : 0;
            if (missingFace >= FACE_SAMPLES_TO_WARN) {
              missingFace = 0;
              report({ type: 'face_missing', message: 'Keep your face clearly visible in the camera.' });
            } else if (multipleFaces >= FACE_SAMPLES_TO_WARN) {
              multipleFaces = 0;
              report({ type: 'multiple_faces', message: 'Only one person may be visible during the interview.' });
            }
          }

          sample += 1;
          if (objectDetector && sample % 2 === 0) {
            phoneSeen = objectDetector.detectForVideo(video, timestamp).detections?.length ? phoneSeen + 1 : 0;
            if (phoneSeen >= PHONE_SAMPLES_TO_WARN) {
              phoneSeen = 0;
              report({ type: 'mobile_phone', message: 'Mobile phones are not allowed in the camera frame.' });
            }
          }
        }, SAMPLE_INTERVAL_MS);
      } catch {
        void 0;
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId !== null) window.clearInterval(intervalId);
      faceDetector?.close();
      objectDetector?.close();
      restoreConsole();
    };
  }, [enabled, videoRef]);
}
