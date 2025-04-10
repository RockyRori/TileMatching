// src/views/GamePage.tsx
import React from "react";
import GameBoard from "../components/GameBoard";
import { useGame } from "../hooks/useGame";
import "./GamePage.css"; // 可在此文件添加页面整体样式

// 定义一个模式描述映射
const modeDescriptions: Record<string, string> = {
  normal: "匹配成功后不进行重排",
  left: "匹配成功后除最左边卡牌外，其它卡牌向左靠拢",
  right: "匹配成功后除最右边卡牌外，其它卡牌向右靠拢",
  up: "匹配成功后除最上面卡牌外，其它卡牌向上靠拢",
  down: "匹配成功后除最下面卡牌外，其它卡牌向下靠拢",
  inside: "匹配成功后卡牌向中心聚集",
  outside: "匹配成功后卡牌向四周扩散",
};

const GamePage: React.FC = () => {
  const { board, selectedTiles, matchData, handleTileClick, resetGame, changeLevel, level, loading, levelMode } = useGame();

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
      {/* 新增模式信息显示 */}
      <div className="mode-info">
        当前模式： {levelMode} - {modeDescriptions[levelMode] || "未知模式"}
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
