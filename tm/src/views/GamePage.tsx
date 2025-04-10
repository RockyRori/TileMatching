// src/views/GamePage.tsx
import React from "react";
import GameBoard from "../components/GameBoard";
import { useGame } from "../hooks/useGame";
import "./GamePage.css"; // 可在此文件添加页面整体样式

const GamePage: React.FC = () => {
  const { board, selectedTiles, matchData, handleTileClick, resetGame, changeLevel, level, loading } = useGame();

  return (
    <div className="game-page">
      <h2>TileMatching</h2>
      <div className="level-buttons">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => changeLevel(i + 1)}
            className={level === i + 1 ? "active" : ""}
          >
            关卡 {i + 1}
          </button>
        ))}
      </div>
      <GameBoard
        board={board}
        selectedTiles={selectedTiles}
        matchData={matchData}
        handleTileClick={handleTileClick}
        resetGame={resetGame}
        loading={loading}
      />
    </div>
  );
};

export default GamePage;
