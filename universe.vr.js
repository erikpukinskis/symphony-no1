var library = require("module-library")(require)

library.define(
  "assert",
  function() {

    return {
      match: assertMatch,
      matchCount: assertMatchCount,
    }

    function assertMatchCount(string, search, minimum) {
      var count = 0
      string.split("/n").forEach(function(line) {
        if (line.match(search)) {
          count++
        }
      })
      if (count < minimum) {
        throw new Error("Expected string "+summarize(string)+" to match "+search+" at least "+minimum+" times")
      }
    }

    function replaceAll(string, search, replacement) {
        return string.replace(new RegExp(search, 'g'), replacement);
    }

    function summarize(string) {
      var summary = string.trim().slice(0,500)

      summary = replaceAll(summary, /\n/,"\\n")

      summary = replaceAll(summary, /\s+/, " ")

      if (string.length > 100) {
        return "<<<\n"+summary+"....\n>>>"
      } else {
        return "<<<"+summary+">>>"
      }
    }

    function assertMatch(string, search) {
      if (!string.match(search)) {
        throw new Error("Expected string "+summarize(string)+" to match "+search)
      }
    }
  })

module.exports = library.export(
  "boot-universe",[
  library.ref(),
  "assert",
  "web-element",
  "bridge-module",
  "a-wild-universe-appeared",
  "./clock-tick.model",
  "./song-cycle.model"],
  function(lib, assert, element, bridgeModule, aWildUniverseAppeared, clockTick, songCycle) {

    function bootUniverse(site) {

      var universe = aWildUniverseAppeared(
        "clock",{
        "clockTick": clockTick,
        "songCycle": songCycle})

      universe.persistToS3({
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET})

      universe.load(function() {
        // log has been played back
      })

      return universe}

    var universeTemplate = element.template(
      ".universe",
      element.style({
        " .nugget": {
          "background": "black",
          "width": "20px",
          "height": "20px",
          "margin": "8px",
          "display": "inline-block",
          "vertical-align": "middle",
        },

        " .details": {
          "display": "inline-block",
          "vertical-align": "middle",
        },

      }),
      element(
        ".nugget"))

    var statement = element.style(
      ".statement",{
      "display": "inline-block",
      "margin-left": "0.25em",
      "background": "black",
      "color": "white"})

    function prepareBridge(bridge, universe) {

      debugger

      var singleton = bridge.defineSingleton(
        "universe",[
        bridgeModule(
          lib,
          "a-wild-universe-appeared",
          bridge),
        bridgeModule(
          lib,
          "clock-tick",
          bridge),
        bridgeModule(
          lib,
          "song-cycle",
          bridge),
        universe.builder()],
        function(aWildUniverseAppeared, clockTick, songCycle, baseLog) {
          var universe = aWildUniverseAppeared(
            "clock-ticks",{
            "clockTick": clockTick,
            "songCycle": songCycle},
            baseLog)

          universe.reset = function() {
            clockTick.reset()
            songCycle.reset()
          }

          universe.buildLinesFromBaseLog()

          universe.playItBack()

          return universe
        })


      assert.matchCount(bridge.script(), /a-wild-universe/, 3)

      debugger
      return singleton
    }

    bootUniverse.element = function(bridge, universe) {

      var universeBinding = prepareBridge(bridge, universe)

      bridge.addToHead(
        element.stylesheet(
          statement,
          universeTemplate))


      var bigBang = bridge.defineFunction([
        bridgeModule(
          lib,
          "web-element",
          bridge),
        bridgeModule(
          lib,
          "add-html",
          bridge),
        universeBinding],
        function(element, addHtml, universe) {

          universe.reset()

          universe.markAsUnplayed()

          universe.playItBack({
            callback: addToTimeline})

          var timeline = document.querySelector(".timeline")

          function addToTimeline(functionCall, args, done) {
            var statement = element(
              ".statement",
              element.raw(
                functionCall))
            addHtml.after(
              ".playhead",
              statement.html())
            setTimeout(
              done,
              200)}})

      var el = universeTemplate(bigBang)

      var play = element(
          "button",
          "Play it back",{
          onclick: bigBang.evalable()})

      el.addChild(element(".details", play))

      return el}

    return bootUniverse
  })
