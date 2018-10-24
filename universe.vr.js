var library = require("module-library")(require)

module.exports = library.export(
  "boot-universe",[
  library.ref(),
  "web-element",
  "bridge-module",
  "a-wild-universe-appeared",
  "./clock-tick.model",
  "./song-cycle.model"],
  function(lib, element, bridgeModule, aWildUniverseAppeared, clockTick, songCycle) {

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

      site.addRoute(
        "get",
        "/universe",
        function(request, response) {
          response.send(universe.source())
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

    bootUniverse.element = function(universe, bridge) {
      var bigBang = bridge.remember("universe/bigBang")

      if (!bigBang) {
        bridge.addToHead(
          element.stylesheet(
            statement,
            universeTemplate))

        bigBang = bridge.defineFunction([
          bridgeModule(lib, "make-request", bridge),
          bridgeModule(lib, "clock-tick", bridge),
          bridgeModule(lib, "a-wild-universe-appeared", bridge),
          bridgeModule(lib, "web-element", bridge),
          bridgeModule(lib, "add-html", bridge),
          bridgeModule(lib, "song-cycle", bridge)],
          function(makeRequest, clockTick, aWildUniverseAppeared, element, addHtml, songCycle) {
            makeRequest({
              method: "get",
              path: "/universe"},
              bigBang)

            function bigBang(baseLog) {
              var universe = aWildUniverseAppeared(
                "clock-ticks",{
                "clockTick": clockTick,
                "songCycle": songCycle},
                baseLog)
              universe.buildLinesFromBaseLog()
              universe.playItBack({
                callback: addToTimeline})}

            var timeline = document.querySelector(".timeline")

            function addToTimeline(functionCall, args, done) {
              var statement = element(
                ".statement", element.raw(functionCall))
              addHtml(statement.html())
              setTimeout(done,
                200)}
          })

        bridge.see(
          "universe/bigBang",
          bigBang)}

      var el = universeTemplate(bigBang)

      var play = element(
          "button",
          "Play it back",{
          onclick: bigBang.evalable()})

      el.addChild(element(".details", play))

      return el}

    return bootUniverse
  })
