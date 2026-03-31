"use strict";
import { pri, propagate } from "./coylean-core.js";

let g; // canvas 2D context

// ── State ──

let feature_active = false;
let SIZE = 65;
let SCALE = 8;
let rightsPos = 1;
let downsPos = 1;

// ── DOM references ──

const elesExplore = document.querySelectorAll(".can-explore");
const eleActive = document.querySelector("#feature-active");
const radioButtons = document.querySelectorAll("input[name='feature']");
const eleSizeToggle = document.querySelector("#size-toggle");
const eleScaleReset = document.querySelector("#scale-reset");
const eleRightsPos = document.querySelector("#rights-pos");
const eleDownsPos = document.querySelector("#downs-pos");

// ── Controls: Map Type ──

function refreshFeatureActive() {
    for (let button of radioButtons) {
        if (feature_active) {
            if (button.id === "exp" && !button.checked) button.checked = true;
        } else {
            if (button.id === "leg" && !button.checked) button.checked = true;
        }
    }
    eleActive.innerHTML = feature_active ? "Explore" : "Legacy";
    for (let ele of elesExplore) {
        ele.style.display = feature_active ? "block" : "none";
    }
}

eleActive.addEventListener("click", function () {
    feature_active = !feature_active;
    refreshFeatureActive();
    coyleanApp();
});

for (let button of radioButtons) {
    button.addEventListener("click", function () {
        feature_active = button.id === "exp";
        refreshFeatureActive();
        coyleanApp();
    });
}

// ── Controls: Size ──

document.querySelector("#size-dec").addEventListener("click", function () {
    if (SIZE > 1) SIZE--;
    eleSizeToggle.innerHTML = SIZE;
    coyleanApp();
});

document.querySelector("#size-inc").addEventListener("click", function () {
    SIZE++;
    eleSizeToggle.innerHTML = SIZE;
    coyleanApp();
});

eleSizeToggle.addEventListener("click", function () {
    SIZE = SIZE < 10 ? 65 : 5;
    eleSizeToggle.innerHTML = SIZE;
    coyleanApp();
});

// ── Controls: Scale ──

document.querySelector("#scale-dec").addEventListener("click", function () {
    if (SCALE > 1) SCALE--;
    eleScaleReset.innerHTML = SCALE;
    coyleanApp();
});

document.querySelector("#scale-inc").addEventListener("click", function () {
    SCALE++;
    eleScaleReset.innerHTML = SCALE;
    coyleanApp();
});

eleScaleReset.addEventListener("click", function () {
    if (SCALE !== 8) SCALE = 8;
    eleScaleReset.innerHTML = SCALE;
    coyleanApp();
});

// ── Controls: Position Offsets ──

document.querySelector("#rights-right").addEventListener("click", function () {
    rightsPos++;
    eleRightsPos.innerHTML = rightsPos;
    coyleanApp();
});

document.querySelector("#rights-left").addEventListener("click", function () {
    rightsPos--;
    eleRightsPos.innerHTML = rightsPos;
    coyleanApp();
});

document.querySelector("#downs-up").addEventListener("click", function () {
    downsPos--;
    eleDownsPos.innerHTML = downsPos;
    coyleanApp();
});

document.querySelector("#downs-down").addEventListener("click", function () {
    downsPos++;
    eleDownsPos.innerHTML = downsPos;
    coyleanApp();
});

// ── Rendering ──

function cell(down, right, i, j) {
    if (!down && !right) return;

    let x = i * SCALE;
    let xp = x + SCALE;
    let y = j * SCALE;
    let yp = y + SCALE;

    if (down && right) {
        g.beginPath();
        g.moveTo(xp, y);
        g.lineTo(xp, yp);
        g.lineTo(x, yp);
        g.stroke();
        return;
    }

    if (down) {
        g.beginPath();
        g.moveTo(xp, y);
        g.lineTo(xp, yp);
        g.stroke();
        return;
    }

    g.beginPath();
    g.moveTo(xp, yp);
    g.lineTo(x, yp);
    g.stroke();
}

function coyleanExploration() {
    let [downMatrix, rightMatrix] = propagate(SIZE, SIZE, rightsPos, downsPos);

    for (let j = 0; j < SIZE; j++) {
        for (let i = 0; i < SIZE; i++) {
            cell(downMatrix[j][i], rightMatrix[i][j], i, j);
        }
    }
}

function coyleanLegacy() {
    const downs = new Array(SIZE).fill(false);
    const rights = new Array(SIZE).fill(false);
    downs[0] = true;

    for (let j = 0; j < SIZE; j++) {
        let y = j * SCALE;
        let yp = y + SCALE;
        for (let i = 0; i < SIZE; i++) {
            let x = i * SCALE;
            let xp = x + SCALE;
            if (downs[i]) {
                if (rights[j]) {
                    g.beginPath();
                    g.moveTo(xp, y);
                    g.lineTo(xp, yp);
                    g.lineTo(x, yp);
                    g.stroke();
                    if (pri(i) >= pri(j)) {
                        downs[i] = true;
                        rights[j] = false;
                    } else {
                        downs[i] = false;
                        rights[j] = true;
                    }
                } else {
                    g.beginPath();
                    g.moveTo(xp, y);
                    g.lineTo(xp, yp);
                    g.stroke();
                    if (pri(i) >= pri(j)) {
                        downs[i] = true;
                        rights[j] = true;
                    } else {
                        downs[i] = true;
                        rights[j] = false;
                    }
                }
            } else {
                if (rights[j]) {
                    g.beginPath();
                    g.moveTo(xp, yp);
                    g.lineTo(x, yp);
                    g.stroke();
                    if (pri(i) >= pri(j)) {
                        downs[i] = false;
                        rights[j] = true;
                    } else {
                        downs[i] = true;
                        rights[j] = true;
                    }
                } else {
                    downs[i] = false;
                    rights[j] = false;
                }
            }
        }
    }
}

// ── App ──

function coyleanApp() {
    const canvas = document.querySelector("#explore-map > canvas");
    g = canvas.getContext("2d");
    g.lineWidth = 1;
    canvas.width = SCALE * (SIZE + 1);
    canvas.height = SCALE * (SIZE + 1);

    const drawScreen = feature_active ? coyleanExploration : coyleanLegacy;
    drawScreen();
}

// ── Init ──

refreshFeatureActive();
eleSizeToggle.innerHTML = SIZE;
eleScaleReset.innerHTML = SCALE;
eleRightsPos.innerHTML = rightsPos;
eleDownsPos.innerHTML = downsPos;
coyleanApp();
