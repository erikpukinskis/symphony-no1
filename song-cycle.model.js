var library = require("module-library")(require)

module.exports = library.export(
  "song-cycle",[
  "identifiable"],
  function(identifiable) {
    var names
    var songSets
    var ids
    var indexById

    var iterationIds
    var iterationNames
    var iterationIds
    var iterationCycleIds
    var iterationSongsSung
    var iterationIndexById

    songCycle.reset = function () {
      names = []
      songSets = []
      ids = []
      indexById = {}
      iterationIds = []
      iterationNames = []
      iterationCycleIds = []
      iterationIndexById = {}
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

    songCycle.mapOpenIterations = function(callback) {
      var values = []

      for(var i=0; i<iterationIds.length; i++) {
        var cycleId = iterationCycleIds[i]
        var cycleName = songCycle.getName(cycleId)
        var songs = songCycle.songsFromCycle(cycleId)

        debugger

        var value = callback(
          iterationIds[i],
          iterationNames[i],
          cycleName,
          songs)

        values.push(value)
      }

      return values}

    songCycle.wasSongSungIn = function(iterationId, song) {
      var iterationIndex = iterationIndexById[iterationId]
      var songsSung = iterationSongsSung[iterationIndex]
      return contains(songsSung, song)
    }

    function contains(array, value) {
      if (!Array.isArray(array)) {
        throw new Error("looking for "+JSON.stringify(value)+" in "+JSON.stringify(array)+", which is supposed to be an array. But it's not.")
      }
      var index = -1;
      var length = array.length;
      while (++index < length) {
        if (array[index] == value) {
          return true;
        }
      }
      return false;
    }

    songCycle.songsFromCycle = function(cycleId) {
      var i = indexById[cycleId]
      return songSets[i]}

    songCycle.open = function(iterationId, cycleId, iterationName, firstSongSung) {

      iterationId = identifiable.assignId(iterationIndexById, iterationId)

      var iterationIndex = iterationNames.length

      iterationIds.push(iterationId)
      iterationNames.push(iterationName)
      iterationCycleIds.push(cycleId)
      iterationSongsSung.push([firstSongSung])

      iterationIndexById[iterationId] = iterationIndex

      return iterationId}

    return songCycle})