var library = require("module-library")(require)

module.exports = library.export(
  "gem",[
  library.ref(),
  "web-element",
  "bridge-module",
  "creature"],
  function (lib, element, bridgeModule, creature) {

    var gem = element.template(
      ".gem",
      element.style({
        "display": "inline-block",
        "width": "18px",
        "height": "14px",
        "overflow": "hidden",
        "margin-left": "10px",

        " .color": {
          "margin-top": "-2px",
          "background": "#f47",
          "width": "12px",
          "height": "12px",
          "margin-left": "3px",
          "transform": "rotate(45deg)",
        },

        ":hover": {
          "cursor": "grab",
        },

        ":hover .color": {
          "background-color": "pink",
        },
      }),
      element(".color"),
      function(grabBinding) {
        this.onclick(grabBinding.withArgs(this.assignId()).evalable())
      })

    gem.prepareSite = function(site, universe) {
      if (site.remember("gem")) {
        return }

      site.addRoute(
        "post",
        "/gems/grabbed",
        function(request, response) {

          var meId = creature.ensureOn(request, response, universe)

          var gemCount = creature.remember(meId, "gemCount") || 0

          gemCount++

          creature.see(meId, "gemCount", gemCount)
          universe.do("creature.see", meId, "gemCount", gemCount)

          response.json({
            meId: meId,
            gemCount: gemCount})

        })

      site.see("gem", true)
    }

    gem.defineGrabOn = function(bridge) {

      var functionDefinition = bridge.remember("gem")

      if (!functionDefinition) {
        functionDefinition = bridge.defineFunction([
          bridgeModule(lib, "make-request", bridge)],
          function grabGem(makeRequest, id) {
            makeRequest({
              method: "post",
              path: "gems/grabbed",
            },function(data) {
              var gem = document.getElementById(id)
              gem.remove()

              document.querySelector(".pouch").innerText = "You are called "+data.meId+" and you have "+data.gemCount+" points"
            })

          })

        bridge.see("gem", functionDefinition)
      }

      return functionDefinition

    }

    gem.pouch = element.template(".pouch")

    return gem
  })