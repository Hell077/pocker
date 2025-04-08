import React, { useEffect, useState } from 'react';
import styles from './MainContent.module.css';

const cardNames = [
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD',
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC'
];

const getRandomCard = () => {
    return `/cards/${cardNames[Math.floor(Math.random() * cardNames.length)]}.png`;
};

const MainContent: React.FC = () => {
    const [cards, setCards] = useState<
        { id: number; front: string; left: string; rotate: string; duration: string }[]
    >([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCards(prev => {
                if (prev.length > 6) return prev.slice(1);

                const newCard = {
                    id: Date.now(),
                    front: getRandomCard(),
                    left: `${Math.random() * 90}%`,
                    rotate: `
            rotateX(${Math.random() * 20 - 10}deg)
            rotateY(${Math.random() * 20 - 10}deg)
            rotateZ(${Math.random() * 30 - 15}deg)
          `,
                    duration: `${8 + Math.random() * 4}s`
                };

                return [...prev, newCard];
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles["home-page"]}>
            <div className={styles.backgroundBlur} />
            <div className={styles.cardsContainer}>
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={styles.card3D}
                        style={{
                            left: card.left,
                            animationDuration: card.duration,
                            transform: card.rotate
                        }}
                    >
                        <div className={styles.cardInner}>
                            <div className={styles.cardFront}>
                                <div className={styles.cardFace}>
                                    <img src={card.front} alt="front" />
                                </div>
                            </div>
                            <div className={styles.cardBack}>
                                <img src="/cards/back.png" alt="back" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.overlay}>
                <h1 className={styles.title}>Welcome to Poker</h1>
                <button className={styles["play-button"]}>PLAY</button>
            </div>
        </div>
    );
};

export default MainContent;
