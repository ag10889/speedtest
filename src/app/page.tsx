'use client'

import { Advent_Pro } from "next/font/google";
import { useState, useRef } from 'react';
import LinearSpeedometer from './components/speedometer.jsx';

// A simple utility function to convert bytes per second to Mbps

function bytesToMbps(bytesPerSecond: number): number {
  return (bytesPerSecond * 8) / (1024 * 1024);
}

const adventPro = Advent_Pro({
  subsets: ['latin'],
});

export default function Home() {
  const [averageSpeedMbps, setAverageSpeedMbps] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [completedRuns, setCompletedRuns] = useState<number>(0);
  // const [error, setError] = useState<string | null>(null);

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
      // let downloadedBytes = 0;
      let done = false;

      while (!done) {
        // const chunkStartTime = performance.now();
        const { done: readerDone, value } = await reader.read();
        const chunkEndTime = performance.now();

        if (value) {
          const chunkSize = value.length;
          // downloadedBytes += chunkSize;
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

    } catch (err) {
      // setError("Unknown error during speed test: " + err.message);
      console.error(err);
    }
  };

  const handleStartTest = async () => {
    setIsTesting(true);
    // setError(null);
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

      <div className="flex justify-center mt-64">
        <h1 className={`${adventPro.className} text-center text-8xl mr-8`}>{averageSpeedMbps !== null ? (averageSpeedMbps.toFixed(2)) : (0)} mbps</h1>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={handleStartTest} disabled={isTesting} className={`{${adventPro.className} relative h-fit m-auto inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-tr from-[#770000] to-[#dd0000] group-hover:from-[#770000] group-hover:to-[#dd0000] hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800`}>
          <span className={`{${adventPro.className} relative px-8 py-3 transition-all ease-in duration-75 bg-white dark:bg-[#0a0a0a] rounded-md group-hover:bg-opacity-0 text-xl`}>
            Start
          </span>
        </button>
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
