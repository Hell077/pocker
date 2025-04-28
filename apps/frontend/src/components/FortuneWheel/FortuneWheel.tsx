import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./FortuneWheel.module.css";
import tickSound from "../../../public/tick.wav";

type Prize = {
    label: string;
    color: string;
};

const rawPrizes: Prize[] = [
    { label: "5", color: "#00FF7F" },
    { label: "10", color: "#00FFFF" },
    { label: "20", color: "#FF00FF" },
    { label: "50", color: "#FF4500" },
    { label: "5", color: "#00FF7F" },
    { label: "10", color: "#00FFFF" },
    { label: "5", color: "#00FF7F" },
    { label: "20", color: "#FF00FF" },
    { label: "5", color: "#00FF7F" },
    { label: "50", color: "#FF4500" },
    { label: "10", color: "#00FFFF" },
    { label: "5", color: "#00FF7F" },
    { label: "20", color: "#FF00FF" },
    { label: "5", color: "#00FF7F" },
    { label: "10", color: "#00FFFF" },
    { label: "5", color: "#00FF7F" },
    { label: "20", color: "#FF00FF" },
    { label: "5", color: "#00FF7F" },
    { label: "50", color: "#FF4500" },
    { label: "5", color: "#00FF7F" },
];

function shuffleArray<T>(array: T[]): T[] {
    return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

const prizes = shuffleArray(rawPrizes);

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M${x},${y} L${start.x},${start.y} A${radius},${radius} 0 ${largeArcFlag},0 ${end.x},${end.y} Z`;
}

function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export default function WheelOfFortune() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<Prize | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [nextSpinTime, setNextSpinTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [showFireworks, setShowFireworks] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const storedNextSpin = localStorage.getItem("nextSpinTime");
        if (storedNextSpin) {
            setNextSpinTime(parseInt(storedNextSpin));
        }

        const timer = setInterval(() => {
            if (nextSpinTime) {
                const diff = nextSpinTime - Date.now();
                if (diff > 0) {
                    setTimeLeft(formatTime(diff));
                } else {
                    setTimeLeft("");
                    setNextSpinTime(null);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextSpinTime]);

    const spin = () => {
        if (isSpinning || (nextSpinTime && nextSpinTime > Date.now())) return;

        const prizeIndex = Math.floor(Math.random() * prizes.length);
        const randomFullRotations = 6;
        const degreesPerSector = 360 / prizes.length;
        const selectedAngle = prizeIndex * degreesPerSector + degreesPerSector / 2;
        const finalRotation = randomFullRotations * 360 + (360 - selectedAngle);

        setIsSpinning(true);
        setRotation(prev => prev + finalRotation);

        let tickDelay = 80;
        intervalRef.current = setInterval(() => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            tickDelay += 20;
            clearInterval(intervalRef.current!);
            intervalRef.current = setInterval(() => {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
            }, tickDelay);
        }, tickDelay);

        setTimeout(() => {
            clearInterval(intervalRef.current!);
            setIsSpinning(false);
            setResult(prizes[prizeIndex]);
            setOpenModal(true);
            setShowFireworks(true);
            setTimeout(() => setShowFireworks(false), 4000);

            const newNextSpinTime = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem("nextSpinTime", newNextSpinTime.toString());
            setNextSpinTime(newNextSpinTime);
        }, 5000);
    };

    const center = 150;
    const radius = 150;
    const degreesPerSector = 360 / prizes.length;

    const canSpin = !nextSpinTime || nextSpinTime < Date.now();

    return (
        <div className={styles.wrapper}>
            {showFireworks && <div className={styles.fireworks}></div>}

            <div className={styles.neonGlow}></div>
            <div className={styles.fireflies}></div>

            <h1 className={styles.title}>FORTUNE WHEEL</h1>

            <audio ref={audioRef} src={tickSound} preload="auto" />
            <div className={styles.wheelContainer}>
                <motion.svg
                    className={styles.wheel}
                    width="300"
                    height="300"
                    viewBox="0 0 300 300"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 5, ease: "easeOut" }}
                >
                    {prizes.map((prize, index) => {
                        const startAngle = index * degreesPerSector;
                        const endAngle = (index + 1) * degreesPerSector;
                        const midAngle = (startAngle + endAngle) / 2;
                        const textPos = polarToCartesian(center, center, radius * 0.65, midAngle);

                        return (
                            <g key={index}>
                                <path
                                    d={describeArc(center, center, radius, startAngle, endAngle)}
                                    fill={prize.color}
                                    stroke="black"
                                    strokeWidth="2"
                                />
                                <text
                                    x={textPos.x}
                                    y={textPos.y}
                                    fill="black"
                                    fontSize="16"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}
                                >
                                    {prize.label}
                                </text>
                            </g>
                        );
                    })}
                </motion.svg>

                <motion.div
                    className={styles.pointer}
                    animate={isSpinning ? { rotate: [0, -5, 5, 0] } : { rotate: 0 }}
                    transition={isSpinning ? { repeat: Infinity, duration: 0.5 } : {}}
                />

                {canSpin ? (
                    <button
                        onClick={spin}
                        disabled={isSpinning}
                        className={styles.spinButton}
                    >
                        SPIN
                    </button>
                ) : null}
            </div>

            {!canSpin && (
                <div className={styles.comeBack}>
                    🎯 Приходите завтра!<br />
                    ⏳ Осталось: {timeLeft}
                </div>
            )}

            {openModal && result && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>🎉 Congratulations!</h2>
                        <p className={styles.modalText}>You won {result.label} points!</p>
                        <button
                            className={styles.modalButton}
                            onClick={() => setOpenModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
