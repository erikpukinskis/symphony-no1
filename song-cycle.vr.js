var library = require("module-library")(require)

module.exports = library.export(
  "song-cycle.vr",[
  library.ref(),
  "web-element",
  "./song-cycle.model",
  "bridge-module",
  "browser-bridge"],
  function(lib, element, songCycle, bridgeModule, BrowserBridge) {

    songCycleVr.middleware = function(baseBridge, request, response, next) {
      var expiredIterationId = songCycle.getExpiredIteration()

      if (!expiredIterationId) {
        return next()
      }

      var songs = songCycle.songsFromIteration(expiredIterationId)

      var iterationName = songCycle.getIterationName(expiredIterationId)

      var bridge = baseBridge.forResponse(response)

      var calls = bridge.remember(
        "song-cycle.vr/calls")

      var page = closeIterationForm(
        calls.singSong,
        expiredIterationId,
        songs,
        iterationName)

      bridge.send(page)
    }

    function songCycleVr(bridge) {

      var button = element(
        "a.button",{
        "href": "/cycles/new"},
        "Type out new cycle")

      var calls = bridge.remember("song-cycle.vr/calls")

      var cycles = songCycle.mapCycles(
        cycleTemplate.bind(null, calls.addSongToCycle))

      var instances = songCycle.mapOpenIterations(
        iterationTemplate.bind(
          null,
          calls.singSong,
          calls.addSongForInstance,
          calls.celebrateIteration))

      var elements = [button]

      if (instances.length > 0) {
        elements.push(element("h1", "OPEN INSTANCES OF CYCLES"))
        elements.push(instances)
      }

      if (cycles.length > 0) {
        elements.push(element("h1", "ARCHIVED CYCLES"))
        elements.push(cycles)
      }

      return elements}


    // Iteration templates

    var closeIterationForm = element.template(
      "form.lil-page",{
      "method": "post"},
      function(singSong, iterationId, songs, cycleName){

        this.addAttribute("action", "/iterations/"+iterationId+"/close")

        this.addChildren([
          element("h1", cycleName+" has expired"),
          element("p", "Ready to close it?"),
          songSetTemplate(singSong, iterationId, songs),
          element("p",element(
            "input",{
            "type": "submit",
            "value": "Close iteration"}))
        ])
      })

    var SYMBOLS = {
      "CHECK": "&#10004;&#xFE0E;",
      "X": "&#10008;&#xFE0E;"}
    
    var songSetTemplate = element.template(
      ".song-set",
      function(singSong, iterationId, songs) {

        function button(song) {
          var wasSung = songCycle.wasSongSungIn(iterationId, song)

          var check = element(
            ".check-mark",
            SYMBOLS.CHECK)

          var el = element(
            "button.song-button",
            check,
            "Sing "+song,{
            "onclick": singSong.withArgs(iterationId, song, BrowserBridge.event).evalable()})

          if (wasSung) {
            el.addSelector(".checked")}

          return el}

        this.addChildren(
          songs.map(
            button))
      })

    var iterationTemplate = element.template(
      ".song-cycle-iteration",
      function(singSong,addSongForInstance, celebrateIteration, iterationId, name, cycleName, songs) {
        
        this.addSelector(
          ".iteration-"+iterationId)

        var abortButton = element(
          "form",{
          "method": "post",
          "action": "/iterations/"+iterationId+"/close"},
          element.style({
            "display": "inline"}),
          element(
            "input",{
            "type": "submit",
            "value": "Abort iteration"}))

        var unelectButton = element(
          "a.button",{
          "href": "/iterations/"+iterationId+"/unelect"},
          "Unelect songs")

        var celebrateButton = element(
          "button",{
          "onclick": celebrateIteration.withArgs(iterationId).evalable()},
          "Celebrate iteration")

        var isComplete = songCycle.isComplete(iterationId)

        this.addChildren([
          element(
            "h1",
            "Singing "+name+" from songs of "+cycleName),

          songSetTemplate(
            singSong,
            iterationId,
            songs),

          element(
            "p.actions",
            isComplete ? celebrateButton : abortButton,
            unelectButton),
        ])
      })  


    // Cycle templates

    var cycleTemplate = element.template(
      ".song-cycle",
      element.style({
        "background": "#cffeff"}),
      function(addSongToCycle, id, name, songs) {
        var addSongButton = element(
          "button",{
          "onclick": addSongToCycle.withArgs(id).evalable()},
          "Add song to cycle")

        var startCycleButton = element(
          "a.button",{
          "href": "/cycles/"+id+"/start"},
          "Start "+name+" cycle")

        var bulkEditButton =           element(
            "a.button",{
            "href": "/cycles/"+id+"/bulk-edit"},
            "Bulk edit songs")

        var addSongForm = element(
          "form.add-song-to-cycle-"+id,{
          "method": "post",
          "action": "/cycles/"+id+"/songs"},
          element.style({
            "display": "none"}),
          element("p", element(
            "input.song-field",{
            "type": "text",
            "name": "song",
            "placeholder": "type your song here"})),
          element(
            "input.song-submit",{
            "type": "submit",
            "value": "It is sung in "+name}))

        this.addChildren([
          element(
            "h1",
            name+" cycle"),
          element(
            "p",
            songs.map(songHtml).join(
              ", ")),
          element(
            "p",
            startCycleButton,
            addSongButton,
            bulkEditButton),
          addSongForm])
      })

    function songHtml(song) {
      return element("span.song", song).html()
    }

    var newCycleForm = element(
      "form.lil-page",{
      "method": "post",
      "action": "/cycles"},[
        element(
          "p",
          "What shall we call this cycle?"),
        element(
          "input",{
          "type": "text",
          "name": "name",
          "placeholder": "name"}),
        element(
          "p",
          "And what are its songs?"),
        element(
          "textarea",{
          "name": "songs",
          "placeholder": "one song\ntwo\nred song\nblue"},
          element.style({
            "height": "12em"})),
        element(
          "p",
          "How many seconds til it's over, complete or not?"),
        element(
          "input",{
          "type": "text",
          "name": "expiresIn",
          "placeholder": "seconds",
          "size": "4"}),
        element("p", element(
          "input",{
          "type": "submit",
          "value": "Create cycle"})),
      ])

    var unelectForm = element.template(
      "form.lil-page",{
      "method": "post"},
      function(iterationId, songs, iterationName, cycleName) {

        this.addAttribute("action", "/iterations/"+iterationId+"/unelected-songs")

        this.addChildren([
          element(
            "h1",
            "Unelect songs from "+iterationName),
          element(
            "p",
            "An iteration of "+cycleName)
        ])

        
        var form = this

        songs.forEach(function(song) {
          var button = element(
            "input",{
            "type": "checkbox",
            "name": "unelectedSongs",
            "value": song.toLowerCase()},
            element.style({
              "display": "none"}))

          if (!songCycle.isElected(iterationId, song)) {
            button.addAttribute("checked", "true")
          }
          var label = element(
            "label.button.song-button",{
            "for": button.assignId()},
            element(
              ".check-box",
              element.style({
                "display": "none"}),
              SYMBOLS.X),
            song)

          form.addChild(button)
          form.addChild(label)
        })

        this.addChild(
          element("p", element(
            "input",{
            "type": "submit",
            "value": "Save"})))
      })

    var bulkEditSongsForm = element.template(
      "form.lil-page",{
      "method": "post"},
      function(cycleId, songs, name) {
        this.addAttribute("action", "/cycles/"+cycleId+"/songs")
        this.addChildren([
          element("h1", "Edit songs for "+name),
          element(
            "textarea",{
            "name": "songs"},
            songs.join("\n"),
            element.style({
              "height": "10em"})),
          element("p",
            element(
              "input",{
              "type": "submit",
              "value": "Update songs"})),
        ])
      })

    var songButton = element.template(
      "input.song-button",{
      "type": "submit",
      "name": "firstSongSung"},
      function(songText) {
        this.addAttribute(
          "value",
          songText)})

    var startCycleStyle = element.style(
      ".start-cycle-form",{
      " .warning": {
        "background": "yellow",
        "padding": "10px",
      },
      " .open-iteration-instruction": {
        "display": "none"},
    })

    var startCycleForm = element.template(
      "form.lil-page.start-cycle-form",{
      "method": "post",
      "action": "/iterations"},
      function(openIteration, ensureIterationOpened, id, name, songs) {

        this.addAttributes({
          "onsubmit": ensureIterationOpened.withArgs(id, BrowserBridge.event).evalable(),
          "id": "start-cycle-form-"+id})

        this.addChildren([
          element("h1", "Starting "+name),
          element("p", "What is this iteration of the cycle called?"),
          element(
            "input",{
            "type": "text",
            "name": "iterationName",
            "placeholder": "name"}),
          element("p", "When you are ready, open the cycle with something ceremonial"),
          element(".open-iteration-instruction.warning", "You needa do this"),
          element(
            "button.song-button.open-iteration-button",{
            "onclick": openIteration.withArgs(id, BrowserBridge.event).evalable()},
            element(
              ".check-mark.open-iteration-check",
              element.style({
                "display": "none"}),
              SYMBOLS.CHECK),
            "Opening ceremony performed"),
          element("p", "And then choose an easy task to get some momentum:"),
          songs.map(songButton),
          element(
            "input",{
            "type": "hidden",
            "name": "cycleId",
            "value": id})])
      })

    var stylesheet = element.stylesheet([
      startCycleStyle,

      element.style(
        ".song-cycle, .song-cycle-iteration",{
        "border-left": "3px solid blue",
        "padding-left": "10px"}),

      element.style(
        ".button, button, input[type=submit]",{
          "margin-right": "0.25em"}),

      element.style(
        ":checked + label.song-button",{
          "background": "#accec1",
        }),

      element.style(
        ":checked + label.song-button .check-box",{
        "display": "inline-block !important",
        "margin-right": "0.25em"}),

      element.style(
        ".song-button",{
        ".checked": {
          "background": "blue",
        },
        " .check-mark": {
          "display": "none",
          "margin-right": "0.25em",
        },
        ".checked .check-mark": {
          "display": "inline-block",
        },
      }),
    ])

    songCycleVr.prepareSite = function(site, baseBridge, universe, grabGem) {

      var singSong = baseBridge.defineFunction([
        bridgeModule(
          lib,
          "make-request",
          baseBridge)],
        function singSong(makeRequest, iterationId, song, event){
          event.target.classList.add("checked")
          makeRequest({
            "method": "post",
            "path": "/iterations/"+iterationId+"/songs",
            "data": {
              "song": song}
          })
        })

      var addSongForInstance = baseBridge.defineFunction(
        function addSongForInstance(){})

      var addSongToCycle = baseBridge.defineFunction(
        function addSongToCycle(cycleId){
          document.querySelector(".add-song-to-cycle-"+cycleId+" .song-field").value = ""
          document.querySelector(".add-song-to-cycle-"+cycleId).style.display = "block"
        })

      var celebrateIteration = baseBridge.defineFunction([
        bridgeModule(
          lib,
          "make-request",
          baseBridge),
        bridgeModule(
          lib,
          "web-element",
          baseBridge),
        bridgeModule(
          lib,
          "add-html",
          baseBridge)],
        function celebrateIteration(makeRequest, element, addHtml, grabGem, iterationId) {

          makeRequest({
            "method": "post",
            "path": "/iterations/"+iterationId+"/celebrate"})

          var iteration = document.querySelector(".iteration-"+iterationId)

          var h1 = iteration.querySelector("h1")
          h1.innerText = h1.innerText.replace(/^Singing/, "Sang")
          iteration.removeChild(
            iteration.querySelector(
              ".actions"))

          iteration.querySelectorAll(".song-button").forEach(
            function(button) {
              var newGem = element(
                ".gem",
                element(".color"))
              var id = newGem.assignId()
              newGem.addAttribute(
                "onclick",
                grabGem.withArgs(id).evalable())
              addHtml.inPlaceOf(button, newGem.html())
            })
        })

      baseBridge.see(
        "song-cycle.vr/calls",{
        singSong: singSong,
        addSongToCycle: addSongToCycle,
        addSongForInstance: addSongForInstance,
        celebrateIteration: celebrateIteration.withArgs(grabGem.asCall()) })

      baseBridge.addToHead(stylesheet)

      var iteration = baseBridge.defineSingleton(
        "iteration",
        function() {
          return {
            "opened": {}}})

      var openIteration = baseBridge.defineFunction([
        iteration],
        function openIteration(iteration, id, event) {
          event.preventDefault()
          if (iteration.opened[id]) {
            return }
          document.querySelector("#start-cycle-form-"+id+" .open-iteration-button .check-mark").style.display = "inline-block"

          document.querySelector("#start-cycle-form-"+id+" .open-iteration-instruction").style.display = "none"

          iteration.opened[id] = true})

      var ensureIterationOpened = baseBridge.defineFunction([
        iteration],
        function ensureIterationOpened(iteration, id, event) {
          if (iteration.opened[id]) {
            return }
          else {
            event.preventDefault()
            var warning = document.querySelector("#start-cycle-form-"+id+" .open-iteration-instruction")
            warning.style.display = "block"
            warning.scrollIntoView()}
        })

      site.addRoute(
        "get",
        "/cycles/new",
        baseBridge.requestHandler(newCycleForm))

      site.addRoute(
        "get",
        "/cycles/:id/start",
        function(request, response) {
          var id = request.params.id
          var name = songCycle.getName(id)
          var songs = songCycle.songsFromCycle(id)

          var bridge = baseBridge.forResponse(response)

          bridge.send(
            startCycleForm(
              openIteration,
              ensureIterationOpened,
              id,
              name,
              songs))
        })

      site.addRoute(
        "post",
        "/cycles/:id/songs",
        function(request, response) {
          var id = request.params.id
          var song = request.body.song
          var songs = request.body.songs

          if (song) {
            songCycle.addSongToCycle(id, song)
            universe.do("songCycle.addSongToCycle", id, song)
          } else if (songs) {
            songs = songs.split(/[\n\r]+/)
            songCycle.updateSongs(id, songs)
            universe.do("songCycle.updateSongs", id, songs)
          }

          response.redirect("/")
        })

      site.addRoute(
        "get",
        "/iterations/:iterationId/unelect",
        function(request, response) {
          var iterationId = request.params.iterationId
          var bridge = baseBridge.forResponse(response)
          var cycleId = songCycle.cycleIdForIteration(iterationId)
          var songs = songCycle.songsFromCycle(cycleId)
          var iterationName = songCycle.getIterationName(iterationId)
          var cycleName = songCycle.getName(cycleId)

          bridge.send(
            unelectForm(
              iterationId,
              songs,
              iterationName,
              cycleName))})
  
      site.addRoute(
        "post",
        "/iterations/:iterationId/unelected-songs",
        function(request, response) {
          var iterationId = request.params.iterationId
          var unelected = request.body.unelectedSongs
          songCycle.unelectSongs(iterationId, unelected)
          universe.do("songCycle.unelectSongs", iterationId, unelected)

          response.redirect("/")
        })

      site.addRoute(
        "get",
        "/cycles/:id/bulk-edit",
        function(request, response) {
          var cycleId = request.params.id
          var songs = songCycle.songsFromCycle(cycleId)
          var name = songCycle.getName(cycleId)

          var bridge = baseBridge.forResponse(response)

          bridge.send(
            bulkEditSongsForm(
              cycleId,
              songs,
              name))})

      site.addRoute(
        "post",
        "/iterations",
        function(request, response) {
          var cycleId = request.body.cycleId
          var cycleName = songCycle.getName(cycleId)
          var iterationName = request.body.iterationName
          var firstSongSung = request.body.firstSongSung

          var iterationId = songCycle.open(null, cycleId, iterationName, firstSongSung)

          var expiresAt = songCycle.getExpiresAt(iterationId)

          universe.do("songCycle.open", iterationId, cycleId, iterationName, firstSongSung, expiresAt || null)

          response.redirect("/")
        })

      site.addRoute(
        "post",
        "/iterations/:iterationId/songs",
        function(request, response) {
          var iterationId = request.params.iterationId
          var song = request.body.song

          songCycle.sing(iterationId, song)
          universe.do("songCycle.sing", iterationId, song)

          response.json({ok: true})
        })

      site.addRoute(
        "post",
        "/iterations/:iterationId/close",
        function(request, response) {
          var iterationId = request.params.iterationId
          var now = new Date()
          songCycle.close(iterationId, now)
          universe.do("songCycle.close", iterationId, now)

          response.redirect("/")})

      site.addRoute(
        "post",
        "/iterations/:iterationId/celebrate",
        function(request, response) {
          var iterationId = request.params.iterationId
          var now = new Date()
          songCycle.complete(iterationId, now)
          universe.do("songCycle.complete", iterationId, now)
          response.json({ok: true})
        })

      site.addRoute(
        "post",
        "/cycles",
        function(request, response) {
          var name = request.body.name
          var songs = []
          var expiresIn = parseInt(request.body.expiresIn)

          if (Number.isNaN(expiresIn)) {
            expiresIn = null}

          request.body.songs.split("\n").forEach(
            function(text) {
              text = text.trim()
              if (text.length > 0) {
                songs.push(text)}})

          var cycleId = songCycle(null, name, songs)
          universe.do("songCycle", cycleId, name, songs)

          if (expiresIn) {
            songCycle.expiresIn(cycleId, expiresIn)
            universe.do("songCycle.expiresIn", cycleId, expiresIn)}

          response.redirect("/")
        })
    }

    function strip(text) {
      return text.trim()
    }

    return songCycleVr})
