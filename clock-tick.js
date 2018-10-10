var library = require("module-library")(require)

module.exports = library.export(
  "clock-tick",
  function(){
    var nextTick = 0

    function clockTick() {
      var tick = nextTick
      nextTick++
      console.log("It is "+tick+" o'clock")
      return tick}

    return clockTick})
