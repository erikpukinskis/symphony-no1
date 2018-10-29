var library = require("module-library")(require)

module.exports = library.export(
  "clock-tick",
  function(){
    var nextTick

    clockTick.reset = function () {
      nextTick = 0
    }

    clockTick.reset()

    function clockTick() {
      var tick = nextTick
      nextTick++
      // console.log("It is "+tick+" o'clock")
      return tick}

    return clockTick})
