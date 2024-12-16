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
    const testFileUrl = "./api/proxy"; // Use the proxy route

    const startTime = performance.now();
    try {
      const response = await fetch(testFileUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      if (!response.body) {
        // If streaming not supported, fallback to arrayBuffer
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
        const { done: readerDone, value } = await reader.read();
        if (value) {
          downloadedBytes += value.length;
        }
        done = readerDone;
      }

      const endTime = performance.now();
      const elapsedTimeSec = (endTime - startTime) / 1000;

      totalBytesRef.current += downloadedBytes;
      totalTimeRef.current += elapsedTimeSec;

      const runs = completedRuns + 1;
      setCompletedRuns(runs);

      const avgSpeedBps = totalBytesRef.current / totalTimeRef.current;
      const avgSpeedMbps = bytesToMbps(avgSpeedBps);
      setAverageSpeedMbps(avgSpeedMbps);
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
      <div className="flex items-center justify-center h-1/2">
        {/* Center content */}
        <h1 className = "mt-64 p text-center text-4xl">123 mbps</h1>
      </div>
      <div className="flex justify-center mt-44">
        <LinearSpeedometer />
      </div>
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Download Speed Test</h1>
        <button onClick={handleStartTest} disabled={isTesting}>
          {isTesting ? "Testing..." : "Start Test"}
        </button>
        {error && <div style={{ color: "red" }}>Error: {error}</div>}
        {averageSpeedMbps !== null && (
          <div>
            <p>Average Download Speed: {averageSpeedMbps.toFixed(2)} Mbps</p>
            <p>Completed Runs: {completedRuns}</p>
          </div>
        )}
      </div>
    </main>
  );
}
