import Image from "next/image";
import LinearSpeedometer from './components/speedometer.jsx';

export default function Home() {
  return (
    <main>
      <div className="flex items-center justify-center h-1/2">
        {/* Center content */}
        <h1 className = "mt-64 p text-center text-4xl">123 mbps</h1>
      </div>
      <div className="flex justify-center mt-44">
        <LinearSpeedometer />
      </div>
    </main>
  );
}
