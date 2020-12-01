// ==UserScript==
// @name         saltMCBBS
// @namespace    http://salt.is.lovely/
// @description  salt's MCBBS 拓展
// @author       salt
// @match        https://www.mcbbs.net/*
// @grant        none
// @license      CC BY-NC-SA 4.0
// ==/UserScript==
(function () {
    let s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/gh/Salt-lovely/saltMCBBS/saltMCBBS.js'
    document.head.appendChild(s)
})()