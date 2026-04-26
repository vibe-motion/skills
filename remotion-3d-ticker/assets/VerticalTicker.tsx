import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Img } from "remotion";

export interface TickerColumnData {
    /** Array of image URLs or string contents to scroll */
    items: string[];
    /** How many seconds it takes to complete one full loop */
    durationInSeconds: number;
    /** 1 for scrolling Down, -1 for scrolling Up */
    direction: -1 | 1;
}

export interface VerticalTickerProps {
    columns: TickerColumnData[];
    /** Background color and the color of the top/bottom fade gradients */
    backgroundColor?: string;
}

/**
 * A generalized 3D Infinite Scrolling Gallery for Remotion.
 */
export const VerticalTicker: React.FC<VerticalTickerProps> = ({
    columns = [],
    backgroundColor = "#000"
}) => {
    return (
        <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
            {/* Top Fade Mask */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 200,
                background: `linear-gradient(to bottom, ${backgroundColor} 0%, transparent 100%)`, zIndex: 10
            }} />
            
            {/* 3D Perspective Wrapper */}
            <div style={{
                width: "100%", height: "100%", display: "flex", justifyContent: "center", gap: 30,
                transform: "perspective(1000px) rotateX(20deg) scale(1.2)", transformOrigin: "center center",
            }}>
                {columns.map((col, idx) => (
                    <TickerColumn key={idx} {...col} />
                ))}
            </div>
            
            {/* Bottom Fade Mask */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
                background: `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`, zIndex: 10
            }} />
        </AbsoluteFill>
    );
};

const TickerColumn: React.FC<TickerColumnData> = ({ items, durationInSeconds, direction }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const totalFramesForLoop = durationInSeconds * fps;
    const progress = (frame % totalFramesForLoop) / totalFramesForLoop;
    
    let translateY = 0;
    if (direction === -1) {
        // Scrolls Up: from 0% to -50%
        translateY = progress * -50; 
    } else {
        // Scrolls Down: from -50% to 0%
        translateY = -50 + (progress * 50); 
    }

    return (
        <div style={{ width: 400, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{
                display: "flex", flexDirection: "column", gap: 30,
                transform: `translateY(${translateY}%)`,
                willChange: "transform"
            }}>
                {/* 
                  * The core of infinite scroll: 
                  * Duplicate the array. When the first half completely scrolls out of view (-50%),
                  * the progress resets to 0%, and because the second half looks identical, 
                  * the transition is completely invisible to the eye. 
                  */}
                {[...items, ...items].map((src, i) => (
                    <Img
                        key={i}
                        src={src}
                        style={{ width: "100%", height: 500, objectFit: "cover", borderRadius: 20 }}
                    />
                ))}
            </div>
        </div>
    );
};
