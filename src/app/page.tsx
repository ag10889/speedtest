'use client'

import Image from "next/image";
import { useState, useRef } from 'react';
import LinearSpeedometer from './components/speedometer.jsx';

// A simple utility function to convert bytes per second to Mbps
function bytesToMbps(bytesPerSecond: number): number {
  return (bytesPerSecond * 8) / (1024 * 1024);
}

export default function Home() {
  const [averageSpeedMbps, setAverageSpeedMbps] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [completedRuns, setCompletedRuns] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const totalBytesRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);

  const testDownloadSpeed = async () => {
    const testFileUrl = "/api/proxy"; // The proxy route

    const startTime = performance.now();
    try {
      const response = await fetch(testFileUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      if (!response.body) {
        // If no streaming, fallback to arrayBuffer (final measurement only)
        const arrayBuffer = await response.arrayBuffer();
        const endTime = performance.now();
        const elapsedTimeSec = (endTime - startTime) / 1000;
        const downloadedBytes = arrayBuffer.byteLength;

        totalBytesRef.current += downloadedBytes;
        totalTimeRef.current += elapsedTimeSec;

        const runs = completedRuns + 1;
        setCompletedRuns(runs);

        const avgSpeedBps = totalBytesRef.current / totalTimeRef.current;
        const avgSpeedMbps = bytesToMbps(avgSpeedBps);
        setAverageSpeedMbps(avgSpeedMbps);
        return;
      }

      const reader = response.body.getReader();
      let downloadedBytes = 0;
      let done = false;

      while (!done) {
        const chunkStartTime = performance.now();
        const { done: readerDone, value } = await reader.read();
        const chunkEndTime = performance.now();

        if (value) {
          const chunkSize = value.length;
          downloadedBytes += chunkSize;
          totalBytesRef.current += chunkSize;

          // Update total time (approximate) after each chunk
          // We're measuring elapsed time as how long since start, rather than per chunk, because 
          // that's more accurate for an ongoing average.
          const currentTime = chunkEndTime;
          totalTimeRef.current = (currentTime - startTime) / 1000;

          // Calculate current average speed
          const avgSpeedBps = totalBytesRef.current / totalTimeRef.current;
          const avgSpeedMbps = bytesToMbps(avgSpeedBps);
          setAverageSpeedMbps(avgSpeedMbps);
        }

        done = readerDone;
      }

      const runs = completedRuns + 1;
      setCompletedRuns(runs);

    } catch (err: any) {
      setError(err.message ?? "Unknown error during speed test.");
    }
  };

  const handleStartTest = async () => {
    setIsTesting(true);
    setError(null);
    setAverageSpeedMbps(null);
    setCompletedRuns(0);
    totalBytesRef.current = 0;
    totalTimeRef.current = 0;

    const numberOfRuns = 1; // Adjust as needed
    for (let i = 0; i < numberOfRuns; i++) {
      await testDownloadSpeed();
    }

    setIsTesting(false);
  };

  return (
    <main>
      {/* Speed text & start button */}
      <div className="flex items-center justify-center h-1/2">
       
        <div className="flex justify-center">
          <h1 className = "mt-64 text-center text-8xl mr-8">{averageSpeedMbps !== null ? (averageSpeedMbps.toFixed(2)) : (0)} mbps</h1>
          <button onClick={handleStartTest} disabled={isTesting} className="bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded  mt-64">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor" 
              className="w-6 h-6"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

      </div>

      {/* Speedometer */}
      <div className="flex justify-center mt-24">
        <LinearSpeedometer speed={averageSpeedMbps !== null ? averageSpeedMbps : 0} />
      </div>

      {/* Test Code */}
      {/* <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
        {averageSpeedMbps !== null && (
          <div>
            <p>Current Average Download Speed: {averageSpeedMbps.toFixed(2)} Mbps</p>
            <p>Completed Runs: {completedRuns}</p>
          </div>
        )}
      </div> */}
    </main>
  );
}
