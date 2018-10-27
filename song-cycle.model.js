var library = require("module-library")(require)

module.exports = library.export(
  "song-cycle",[
  "identifiable"],
  function(identifiable) {
    var names
    var songSets
    var ids
    var indexById

    songCycle.reset = function () {
      names = []
      songSets = []
      ids = []
      indexById = {}
    }

    songCycle.reset()

    function songCycle(id, name, cycleSongs) {
      id = identifiable.assignId(indexById, id)

      console.log("heard song", name, id)
      var index = ids.length
      indexById[id] = index

      names.push(name)
      songSets.push(cycleSongs)
      ids.push(id)

      return id
    }

    songCycle.mapCycles = function(callback) {
      var values = []
      for(var i=0; i<names.length; i++) {
        var value = callback(
          ids[i],
          names[i],
          songSets[i])
        values.push(value)}
      return values}

    songCycle.mapOpenInstances = function(callback) {
      console.log("warning: implement mapOpenInstances")
      return []}

    songCycle.songsFromCycle = function(cycleId) {
      var i = indexById[cycleId]
      return songSets[i]}

    return songCycle})