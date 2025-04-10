// src/components/Tile.tsx
import React, { useState } from "react";
import "./Tile.css";
import { Tile as TileType } from "../models/Tile";

interface TileProps {
  tile: TileType;
  onClick: () => void;
  selected: boolean;
}

const Tile: React.FC<TileProps> = ({ tile, onClick, selected }) => {
  // 将数字转换为大写字母（1 -> A, 2 -> B, …）
  const letter = String.fromCharCode(64 + tile.value);
  // 构造图片地址，假定放在 public/images 目录下
  const imgSrc = `${import.meta.env.BASE_URL}images/${letter}.webp`;
  // 使用 state 来判断图片是否加载失败
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`tile ${!tile.isVisible ? "hidden" : ""} ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {tile.isVisible && (
        !imgError ? (
          <img
            src={imgSrc}
            alt={letter}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="tile-text">{letter}</span>
        )
      )}
    </div>
  );
};

export default Tile;
