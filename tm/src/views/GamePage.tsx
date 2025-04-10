// src/views/GamePage.tsx
import React from "react";
import GameBoard from "../components/GameBoard";

const GamePage: React.FC = () => {
    return (
        <div>
            <h1>连连看游戏</h1>
            <GameBoard />
        </div>
    );
};

export default GamePage;
