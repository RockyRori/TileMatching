// src/components/Tile.tsx
import React from "react";
import "./Tile.css";
import { Tile as TileType } from "../models/Tile";

interface TileProps {
    tile: TileType;
    onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ tile, onClick }) => {
    return (
        <div className={`tile ${!tile.isVisible ? "hidden" : ""}`} onClick={onClick}>
            {tile.isVisible ? tile.value : ""}
        </div>
    );
};

export default Tile;
