var library = require("module-library")(require)

module.exports = library.export(
  "song-cycle",[
  "identifiable"],
  function(identifiable) {
    var names
    var songSets
    var ids
    var indexById
    var iterationIndexById
    var iterationNames
    var iterationCycleIds
    var iterationSongsSung

    songCycle.reset = function () {
      names = []
      songSets = []
      ids = []
      indexById = {}
      iterationIndexById = {}
      iterationNames = []
      iterationCycleIds = []
      iterationSongsSung = []
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

    songCycle.getName = function(id) {
      return names[
        indexById[
          id]]}

    songCycle.getSongs = function(id) {
      return songSets[
        indexById[
        id]]}

    songCycle.mapOpenInstances = function(callback) {
      console.log("warning: implement mapOpenInstances")
      return []}

    songCycle.songsFromCycle = function(cycleId) {
      var i = indexById[cycleId]
      return songSets[i]}

    songCycle.open = function(iterationId, cycleId, iterationName, firstSongSung) {
      iterationId = identifiable.assignId(iterationIndexById, iterationId)
      var iterationIndex = iterationNames.length
      iterationNames.push(iterationName)
      iterationCycleIds.push(cycleId)
      iterationSongsSung.push([firstSongSung])
      iterationIndexById[iterationId] = iterationIndex
      return iterationId
    }

    return songCycle})