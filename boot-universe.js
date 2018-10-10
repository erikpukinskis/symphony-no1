var library = require("module-library")(require)

module.exports = library.export(
  "boot-universe",[
  library.ref(),
  "web-element",
  "bridge-module",
  "a-wild-universe-appeared",
  "./clock-tick"],
  function(lib, element, bridgeModule, aWildUniverseAppeared, clockTick) {

    function bootUniverse(site) {

      var universe = aWildUniverseAppeared(
        "clock",{
        "clockTick": clockTick})

      universe.persistToS3({
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET
      })
      universe.load(function() {
        // log has been played back
      })

      site.addRoute(
        "get",
        "/universe",
        function(request, response) {
          response.json({
            "baseLog": universe.source()})
        })

      return universe}

    bootUniverse.element = function(universe, bridge) {
      return element(
        ".universe",
        element.style({
          " .nugget": {
            "background": "black",
            "width": "30px",
            "height": "30px",
          }
        }),
        element(".nugget"))
    }

    bootUniverse.__booty = "yup"
    return bootUniverse
  })
