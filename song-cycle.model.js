var library = require("module-library")(require)

module.exports = library.export(
  "song-cycle",
  function() {
    var names = []
    var songs = []
    var indexByName = {}

    function songCycle(name, cycleSongs) {
      var index = names.length
      if (indexByName.hasOwnProperty(name)) {
        throw new Error("already sung cycle "+name)
      }
      indexByName[name] = index

      names.push(name)
      songs.push(cycleSongs)
    }

    songCycle.map = function(callback) {
      debugger
      var values = []
      for(var i=0; i<names.length; i++) {
        var value = callback(
          names[i],
          songs[i])
        values.push(value)}
      return values}

    return songCycle})