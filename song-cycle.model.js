var library = require("module-library")(require)

module.exports = library.export(
  "song-cycle",[
  "identifiable"],
  function(identifiable) {
    var names
    var songSets
    var ids
    var indexById

    var cycleDurations
    var iterationExpiresAt

    var iterationIds
    var iterationNames
    var iterationIds
    var iterationCycleIds
    var iterationSongsSung
    var iterationIndexById
    var iterationClosedAt
    var iterationSongsUnelected

    songCycle.reset = function () {
      cycleDurations = {}
      iterationExpiresAt = {}
      iterationClosedAt = {}

      indexById = {}
      names = []
      songSets = []
      ids = []

      iterationIndexById = {}
      iterationIds = []
      iterationNames = []
      iterationCycleIds = []
      iterationSongsSung = []
      iterationSongsUnelected = {}
    }

    songCycle.reset()

    function songCycle(id, name, cycleSongs) {
      id = identifiable.assignId(indexById, id, "cycl")

      console.log("heard cycle", name, id)
      var index = ids.length
      indexById[id] = index

      names.push(name)
      songSets.push(cycleSongs)
      ids.push(id)

      return id
    }

    function trim(string) {
      return string.replace(/\s+/, " ").trim()
    }

    function notEmpty(string) {
      return string.length > 0
    }

    songCycle.updateSongs = function(id, songs) {
      var index = indexById[id]
      songs = songs.map(trim).filter(notEmpty)
      songSets[index] = songs
    }

    songCycle.addSongToCycle = function(id, song) {
      var index = indexById[id]
      songSets[index].push(song)
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

    songCycle.getIterationName = function(iterationId) {
      var index = iterationIndexById[iterationId]
      return iterationNames[index]
    }

    songCycle.mapOpenIterations = function(callback) {
      var values = []

      for(var i=0; i<iterationIds.length; i++) {

        var iterationId = iterationIds[i]
        if (iterationClosedAt[iterationId]) {
          continue }

        var cycleId = iterationCycleIds[i]
        var cycleName = songCycle.getName(cycleId)
        var songs = songCycle.songsFromIteration(iterationId)

        var value = callback(
          iterationIds[i],
          iterationNames[i],
          cycleName,
          songs)

        values.push(value)
      }

      return values}

    songCycle.expiresIn = function(cycleId, seconds) {
      cycleDurations[cycleId] = seconds}

    songCycle.isComplete = function(iterationId) {
      var iterationIndex = iterationIndexById[iterationId]
      var cycleId = iterationCycleIds[iterationIndex]
      var songs = songCycle.songsFromCycle(cycleId)

      var isComplete = !songs.find(
        function(song) {
          return !songCycle.wasSongSungIn(iterationId, song)})

      return isComplete}

    songCycle.getExpiredIteration = function() {
      var expiringIterationIds = Object.keys(iterationExpiresAt)
      var now = new Date()

      var expiredIterationId = expiringIterationIds.find(
        function(iterationId) {
          var expiresAt = iterationExpiresAt[iterationId]
          if (expiresAt && expiresAt < now) {
            return iterationId}})

      return expiredIterationId}


    songCycle.wasSongSungIn = function(iterationId, song) {
      var iterationIndex = iterationIndexById[iterationId]
      var songsSung = iterationSongsSung[iterationIndex]
      return contains(songsSung, song.toLowerCase())}

    songCycle.songsFromCycle = function(cycleId) {
      var i = indexById[cycleId]
      return songSets[i]}


    songCycle.songsFromIteration = function(iterationId) {
      identifiable.valid("iter", iterationId)
      var index = iterationIndexById[iterationId]
      var cycleId = iterationCycleIds[index]
      var cycleSongs = songCycle.songsFromCycle(cycleId)
      var unelected = iterationSongsUnelected[iterationId]
      if (!unelected) {
        return cycleSongs
      } else {
        return without(cycleSongs, unelected)
      }
    }

    songCycle.cycleIdForIteration = function(iterationId) {
      var index = iterationIndexById[iterationId]
      return iterationCycleIds[index]
    }

    songCycle.open = function(iterationId, cycleId, iterationName, firstSongSung, expiresAt) {

      iterationId = identifiable.assignId(iterationIndexById, iterationId, "iter")

      var iterationIndex = iterationNames.length

      iterationIds.push(iterationId)
      iterationNames.push(iterationName)
      iterationCycleIds.push(cycleId)
      iterationSongsSung.push([firstSongSung.toLowerCase()])

      iterationIndexById[iterationId] = iterationIndex

      var cycleDuration = cycleDurations[cycleId]
      if (typeof expiresAt == "string") {
        expiresAt = new Date(expiresAt)
      } else if (!expiresAt && cycleDuration != null) {
        expiresAt = new Date()
        expiresAt.setSeconds(expiresAt.getSeconds() + cycleDuration)
      }

      iterationExpiresAt[iterationId] = expiresAt

      return iterationId}

    songCycle.close = songCycle.complete = function(iterationId, closedAt) {
      delete iterationExpiresAt[iterationId]
      iterationClosedAt[iterationId] = closedAt
    }

    songCycle.getExpiresAt = function(iterationId) {
      return iterationExpiresAt[iterationId]
    }
    
    songCycle.sing = function(iterationId, song) {
      var index = iterationIndexById[iterationId]
      iterationSongsSung[index].push(song.toLowerCase())
    }

    songCycle.unelectSongs = function(iterationId, unelected) {
      iterationSongsUnelected[iterationId] = unelected
    }

    songCycle.isElected = function(iterationId, song) {
      var unelected = iterationSongsUnelected[iterationId]

      if (!unelected) {
        return true
      } else {
        return !contains(unelected, song.toLowerCase())
      }
      return !contains()
    }

    function without(a,b) {
      return a.filter(
        function(item) {
          if (contains(b, item.toLowerCase())) {
            console.log("unelected", item)
            return false
          } else {
            return true}})}

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

    return songCycle})