/* =====================================================================
   THEME, EASIER READING AND INSTRUCTOR MODE — before the first paint

   A plain script in the head, not a module: a module is deferred, and a
   deferred theme is a white flash in a dark room for somebody whose eyes
   are already damaged.

   The keys are the programme's shared ones, so a student who turns easier
   reading on at another Cyber Warrior site finds it on here:

     cwp:theme       light | dark
     cwp:dyslexia    on | off
     cwp:instructor  1 | 0
   ===================================================================== */
(function () {
  "use strict";
  function read(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* not fatal */ } }
  var el = document.documentElement;

  function preferredTheme() {
    var saved = read("cwp:theme");
    if (saved === "light" || saved === "dark") return saved;
    try { if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light"; } catch (e) { /* older browser */ }
    return "dark";   /* a SOC floor is dark */
  }
  el.setAttribute("data-theme", preferredTheme());
  el.setAttribute("data-dyslexia", read("cwp:dyslexia") === "on" ? "on" : "off");
  el.setAttribute("data-instructor", read("cwp:instructor") === "1" ? "on" : "off");

  window.CWP = {
    theme: function () { return el.getAttribute("data-theme"); },
    toggleTheme: function () { var v = el.getAttribute("data-theme") === "light" ? "dark" : "light"; el.setAttribute("data-theme", v); write("cwp:theme", v); return v; },
    dyslexia: function () { return el.getAttribute("data-dyslexia") === "on"; },
    toggleDyslexia: function () { var v = el.getAttribute("data-dyslexia") === "on" ? "off" : "on"; el.setAttribute("data-dyslexia", v); write("cwp:dyslexia", v); return v; },
    instructor: function () { return el.getAttribute("data-instructor") === "on"; },
    setInstructor: function (on) { el.setAttribute("data-instructor", on ? "on" : "off"); write("cwp:instructor", on ? "1" : "0"); }
  };
})();
