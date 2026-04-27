import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";

export interface VinylPlayerProps {
    scale?: number;
    coverUrl?: string;
    songTitle?: string;
    artistName?: string;
    durationInSeconds?: number;
    backgroundColor?: string;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
    coverUrl = "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=400&auto=format&fit=crop",
    songTitle = "You've Got The Love (Jamie xx Rework feat. The xx)",
    artistName = "Florence + The Machine, The xx, Jamie xx",
    durationInSeconds = 10,
    backgroundColor = "#0b1011",
    scale = 1.5
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const totalFrames = durationInSeconds * fps;
    const progress = Math.min(1, frame / totalFrames);

    const rotateAngle = (frame / (fps * 2)) * 360;

    const marqueeLoopFrames = fps * 6;
    const marqueeProgress = (frame % marqueeLoopFrames) / marqueeLoopFrames;
    const marqueeX = marqueeProgress * -50; 

    const trackWidth = progress * 100;

    return (
        <AbsoluteFill style={{ backgroundColor, justifyContent: "center", alignItems: "center" }}>
            <div style={vinylContainer}>
                <div style={{...vinylPlayerWrapper, transform: `scale(${scale})`}}>
                    <div style={vinylDiscContainer}>
                        <div style={{ ...vinylDisc, transform: `rotate(${rotateAngle}deg)` }}>
                            <div style={vinylLabel}>
                                <Img src={coverUrl} style={vinylImage} />
                                <div style={vinylCenterHole} />
                            </div>
                        </div>
                    </div>

                    <div style={vinylInfoContainer}>
                        <div style={vinylMarqueeWrapper}>
                            <div style={{ ...vinylMarqueeTrack, transform: `translateX(${marqueeX}%)` }}>
                                <h2 style={vinylSongTitle}>{songTitle} &nbsp;&nbsp;&nbsp;&nbsp;</h2>
                                <h2 style={vinylSongTitle}>{songTitle} &nbsp;&nbsp;&nbsp;&nbsp;</h2>
                            </div>
                        </div>
                        <p style={vinylArtistName}>{artistName}</p>
                    </div>

                    <div style={vinylProgressBarContainer}>
                        <div style={vinylProgressTrack}>
                            <div style={{ ...vinylProgressFill, width: `${trackWidth}%` }}>
                                <div style={vinylProgressKnob} />
                            </div>
                        </div>
                    </div>

                    <div style={vinylControlsContainer}>
                        <button style={{...vinylBtn, color: "#1db954"}}><VinylShuffleIcon /></button>
                        <button style={vinylBtn}><VinylPrevIcon /></button>
                        <button style={vinylPlayBtn}><VinylPauseIcon /></button>
                        <button style={vinylBtn}><VinylNextIcon /></button>
                        <button style={vinylBtn}><VinylRepeatIcon /></button>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

// Styles
const vinylContainer: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "650px", width: "100%" };
const vinylPlayerWrapper: React.CSSProperties = {
    position: "relative", width: "360px", backgroundColor: "#121212",
    backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
    borderRadius: "32px", padding: "40px 32px 32px 32px", display: "flex", flexDirection: "column", alignItems: "center",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05)"
};
const vinylDiscContainer: React.CSSProperties = { position: "relative", width: "280px", height: "280px", marginBottom: "40px", borderRadius: "50%", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" };
const vinylDisc: React.CSSProperties = {
    width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#111",
    backgroundImage: "repeating-radial-gradient(#111, #111 2px, #1a1a1a 3px, #1a1a1a 4px)",
    display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 20px rgba(0,0,0,1)"
};
const vinylLabel: React.CSSProperties = { position: "relative", width: "110px", height: "110px", borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 10px rgba(0,0,0,0.8)" };
const vinylImage: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 };
const vinylCenterHole: React.CSSProperties = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "12px", height: "12px", backgroundColor: "#121212", borderRadius: "50%", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)" };
const vinylInfoContainer: React.CSSProperties = { width: "100%", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px", overflow: "hidden" };
const vinylMarqueeWrapper: React.CSSProperties = { position: "relative", width: "100%", overflow: "hidden", WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" };
const vinylMarqueeTrack: React.CSSProperties = { display: "flex", whiteSpace: "nowrap", width: "max-content", willChange: "transform" };
const vinylSongTitle: React.CSSProperties = { margin: 0, color: "#fff", fontSize: "22px", fontWeight: "700", fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.5px" };
const vinylArtistName: React.CSSProperties = { margin: 0, color: "#888", fontSize: "14px", fontFamily: "system-ui, -apple-system, sans-serif" };
const vinylProgressBarContainer: React.CSSProperties = { width: "100%", marginBottom: "32px" };
const vinylProgressTrack: React.CSSProperties = { position: "relative", width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "2px" };
const vinylProgressFill: React.CSSProperties = { position: "absolute", top: 0, left: 0, height: "100%", backgroundColor: "#fff", borderRadius: "2px" };
const vinylProgressKnob: React.CSSProperties = { position: "absolute", right: "-6px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", backgroundColor: "#fff", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" };
const vinylControlsContainer: React.CSSProperties = { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" };
const vinylBtn: React.CSSProperties = { background: "none", border: "none", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", outline: "none" };
const vinylPlayBtn: React.CSSProperties = { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", border: "none", outline: "none", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" };

// Icons
function VinylShuffleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg> }
function VinylPrevIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg> }
function VinylNextIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg> }

function VinylPauseIcon() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> }
function VinylRepeatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> }
