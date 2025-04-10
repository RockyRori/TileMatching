// src/components/Tile.tsx
import React from "react";
import "./Tile.css";
import { Tile as TileType } from "../models/Tile";

interface TileProps {
  tile: TileType;
  onClick: () => void;
  selected: boolean;
}

const Tile: React.FC<TileProps> = ({ tile, onClick, selected }) => {
  return (
    <div
      className={`tile ${!tile.isVisible ? "hidden" : ""} ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {tile.isVisible ? tile.value : ""}
    </div>
  );
};

export default Tile;
