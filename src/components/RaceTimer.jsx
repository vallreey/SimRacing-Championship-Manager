import { useEffect, useState } from "react";
import { formatClock } from "../utils/helpers";

function RaceTimer({ startTime }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = Math.max(0, now - new Date(startTime).getTime());

  return <div className="timer">{formatClock(elapsed)}</div>;
}

export default RaceTimer;
