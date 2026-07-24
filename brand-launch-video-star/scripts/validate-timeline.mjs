#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const timelinePath = process.argv[2];

if (!timelinePath) {
  console.error("Usage: node validate-timeline.mjs <timeline.json>");
  process.exit(2);
}

let timeline;
try {
  timeline = JSON.parse(readFileSync(resolve(timelinePath), "utf8"));
} catch (error) {
  console.error(`Cannot read timeline: ${error.message}`);
  process.exit(2);
}

const fps = Number(timeline.fps);
const durationSeconds = Number(timeline.durationSeconds);
const exactFrames = fps * durationSeconds;
const totalFrames = Number.isFinite(exactFrames) ? exactFrames : 0;
const maxOverlapFrames =
  timeline.maxOverlapFrames === undefined
    ? 12
    : Number(timeline.maxOverlapFrames);
const shots = Array.isArray(timeline.shots)
  ? [...timeline.shots].sort((a, b) => a.startFrame - b.startFrame)
  : [];
const errors = [];

if (!Number.isInteger(fps) || fps <= 0) {
  errors.push("fps must be a positive integer");
}
if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
  errors.push("durationSeconds must be positive");
}
if (
  timeline.allowCustomDuration !== undefined &&
  typeof timeline.allowCustomDuration !== "boolean"
) {
  errors.push("allowCustomDuration must be a boolean when provided");
}
if (
  timeline.allowCustomDuration !== true &&
  (durationSeconds < 15 || durationSeconds > 30)
) {
  errors.push(
    "durationSeconds must be 15-30 unless allowCustomDuration is true"
  );
}
if (!Number.isInteger(exactFrames) || exactFrames <= 0) {
  errors.push("fps * durationSeconds must resolve to a positive integer frame count");
}
if (!Number.isInteger(maxOverlapFrames) || maxOverlapFrames < 0) {
  errors.push("maxOverlapFrames must be a non-negative integer");
}
if (shots.length === 0) errors.push("shots must be a non-empty array");

let coverageEnd = 0;
for (const [index, shot] of shots.entries()) {
  const label = shot?.id || `shot[${index}]`;
  const start = Number(shot?.startFrame);
  const end = Number(shot?.endFrame);

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    errors.push(`${label}: startFrame and endFrame must be integers`);
    continue;
  }
  if (start < 0 || end > totalFrames || end <= start) {
    errors.push(
      `${label}: invalid range ${start}-${end} for ${totalFrames} frames`
    );
  }
  if (typeof shot?.visualOwner !== "string" || shot.visualOwner.trim() === "") {
    errors.push(`${label}: visualOwner is required`);
  }
  if (index === 0 && start !== 0) {
    errors.push(`${label}: first shot must start at frame 0`);
  }
  if (start > coverageEnd) {
    errors.push(`${label}: uncovered gap of ${start - coverageEnd} frame(s)`);
  }
  const overlap = Math.max(0, coverageEnd - start);
  if (index > 0 && overlap > maxOverlapFrames) {
    errors.push(
      `${label}: overlap ${overlap} exceeds maxOverlapFrames ${maxOverlapFrames}`
    );
  }
  coverageEnd = Math.max(coverageEnd, end);
}

if (coverageEnd !== totalFrames) {
  errors.push(
    `timeline covers through frame ${coverageEnd}, expected ${totalFrames}`
  );
}

if (errors.length > 0) {
  console.error(`Timeline validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Timeline validation passed: ${shots.length} shots, ${totalFrames} frames, ${durationSeconds.toFixed(2)} seconds at ${fps}fps.`
);
