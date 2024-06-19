import WebSocketManager from "./socket.js";
const socket = new WebSocketManager("127.0.0.1:24050");

let state = 0;
let ur = 0;
const elements = {
    tick: document.querySelectorAll("[id^=t]"),
    arrow: document.querySelector(".arrow"),
    allDivs: document.querySelector("div"),
    marvelous: document.querySelector(".marvelous"),
    perfect: document.querySelector(".perfect"),
    great: document.querySelector(".great"),
    good: document.querySelector(".good"),
    bad: document.querySelector(".bad"),
    miss: document.querySelector(".miss"),
};
let timing_300g = 16;
let timing_300 = 64;
let timing_200 = 97;
let timing_100 = 127;
let timing_50 = 151;
let timing_0 = 188;

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const updateTimingWindows = (od) => {timing_300 = 64 - (3 * od);timing_200 = 97 - (3 * od);timing_100 = 127 - (3 * od);timing_50 = 151 - (3 * od);timing_0 = 188 - (3 * od);}
const updateHrTimingWindows = (od) => {timing_300g = 11.43;timing_300 = (64 - (3 * od)) / 1.4;timing_200 = (97 - (3 * od)) / 1.4;timing_100 = (127 - (3 * od)) / 1.4;timing_50 = (151 - (3 * od)) / 1.4;timing_0 = (188 - (3 * od)) / 1.4;}

socket.api_v2((data) => {
    if (state !== data.state.number) {
        state = data.state.number;
        if (state !== 2) {
            elements.allDivs.style.opacity = 0;
            elements.arrow.style.transform = "translateX(0)";
            for (let n = 0; n < 25; n++) {
                elements.tick[n].style.transform = "translateX(0)";
                elements.tick[n].style.opacity = 0;
            }
        } else {
            elements.allDivs.style.opacity = 1;
        }
        data.play.mods.name.includes("HR") ? updateHrTimingWindows(data.beatmap.stats.od.converted) : updateTimingWindows(data.beatmap.stats.od.converted);
        elements.marvelous.style.width = `${(timing_300g * 5)}px`;
        elements.perfect.style.width = `${(timing_300 * 5)}px`;
        elements.great.style.width = `${(timing_200 * 5)}px`;
        elements.good.style.width = `${(timing_100 * 5)}px`;
        elements.bad.style.width = `${(timing_50 * 5)}px`;
    }
    // reset arrow and tick positions on map restart
    if (ur !== data.play.unstableRate){
        ur = data.play.unstableRate;
        if (ur === 0) {
            for (let n = 0; n < 25; n++) {
                elements.tick[n].style.opacity = 0;
            }
            elements.arrow.style.transform = "translateX(0px)"
        }
    }
})
socket.api_v2_precise((data) => {
    try {
        const hitErrors = data.hitErrors.slice(-25);
        const avg = average(hitErrors);
        elements.arrow.style.transform = `translateX(${avg * 2.5}px)`;
        if (avg >= timing_300g / 2) {
            elements.arrow.style.borderTopColor = "#FF0000";
        } else if (avg <= -timing_300g / 2) {
            elements.arrow.style.borderTopColor = "#00AAFF";
        } else {
            elements.arrow.style.borderTopColor = "#FFF";
        }
        for (let n = 0; n < 25; n++) {
            elements.tick[n].style.transform = `translateX(${hitErrors[n] * 2.5}px)`;
            elements.tick[n].style.opacity = 1;
            if (hitErrors[n] >= -(timing_300g) && hitErrors[n] <= timing_300g) {
                elements.tick[n].style.backgroundColor = "#ffffff";
            } else if (hitErrors[n] >= -(timing_300) && hitErrors[n] <= timing_300) {
                elements.tick[n].style.backgroundColor = "#ffff00";
            } else if (hitErrors[n] >= -(timing_200) && hitErrors[n] <= timing_200) {
                elements.tick[n].style.backgroundColor = "#00ff00";
            } else if (hitErrors[n] >= -(timing_100) && hitErrors[n] <= timing_100) {
                elements.tick[n].style.backgroundColor = "#00bfff";
            } else if (hitErrors[n] >= -(timing_50) && hitErrors[n] <= timing_50) {
                elements.tick[n].style.backgroundColor = "#8a2ce2";
            } else if (hitErrors[n] >= -(timing_0) && hitErrors[n] <= timing_0) {
                elements.tick[n].style.backgroundColor = "#ff0000";
            }
        }
    } catch (error) {
        console.error(error);
    }
})