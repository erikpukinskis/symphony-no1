var library = require("module-library")(require)

module.exports = library.export(
  "boot-universe",[
  library.ref(),
  "error-if",
  "web-element",
  "bridge-module",
  "a-wild-universe-appeared",
  "./clock-tick.model",
  "./song-cycle.model",
  "creature"],
  function(lib, errorIf, element, bridgeModule, aWildUniverseAppeared, clockTick, songCycle, creature) {

    function bootUniverse(site) {

      var universe = aWildUniverseAppeared(
        "clock",{
        "clockTick": clockTick,
        "songCycle": songCycle,
        "creature": creature})

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
        bridgeModule(
          lib,
          "creature",
          bridge),
        universe.builder()],
        function(aWildUniverseAppeared, clockTick, songCycle, creature, baseLog) {
          var universe = aWildUniverseAppeared(
            "clock-ticks",{
            "clockTick": clockTick,
            "songCycle": songCycle,
            "creature": creature},
            baseLog)

          universe.reset = function() {
            clockTick.reset()
            songCycle.reset()
          }

          universe.buildLinesFromBaseLog()

          universe.playItBack()

          return universe
        })

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
              250)}})

      var el = universeTemplate(bigBang)

      var play = element(
          "button",
          "Play it back",{
          onclick: bigBang.evalable()})

      el.addChild(element(".details", play))

      return el}

    return bootUniverse
  })
