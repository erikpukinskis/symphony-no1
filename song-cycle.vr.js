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
          calls.addSongForInstance))

      return [button].concat(instances, cycles)}



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
    
    var songSetTemplate = element.template(
      ".song-set",
      function(singSong, iterationId, songs) {

        function button(song) {
          var wasSung = songCycle.wasSongSungIn(iterationId, song)

          var check = element(
            ".check-mark",
            "&#10004;")

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
      function(singSong,addSongForInstance, iterationId, name, cycleName, songs) {
        
        this.addChild(
          element(
            "h1",
            "Singing "+name+" from songs of "+cycleName))

        this.addChild(
          songSetTemplate(singSong, iterationId, songs))
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
            songs.join(
              ", ")),
          element(
            "p",
            element(
              "a.button",{
              "href": "/cycles/"+id+"/start"},
              "Start "+name+" cycle"),
            addSongButton),
          addSongForm])
      })

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
              "&#10004;"),
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
        "a.button, button",{
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

    songCycleVr.prepareSite = function(site, bridge, universe) {

      var singSong = bridge.defineFunction([
        bridgeModule(
          lib,
          "make-request",
          bridge)],
        function singSong(makeRequest, iterationId, song, event){
          event.target.classList.add("checked")
          makeRequest({
            "method": "post",
            "path": "/iterations/"+iterationId+"/songs",
            "data": {
              "song": song}
          })
        })

      var addSongForInstance = bridge.defineFunction(
        function addSongForInstance(){})

      var addSongToCycle = bridge.defineFunction(
        function addSongToCycle(cycleId){
          document.querySelector(".add-song-to-cycle-"+cycleId+" .song-field").value = ""
          document.querySelector(".add-song-to-cycle-"+cycleId).style.display = "block"
        })

      bridge.addToHead(stylesheet)

      bridge.see(
        "song-cycle.vr/calls",{
        singSong: singSong,
        addSongToCycle: addSongToCycle,
        addSongForInstance: addSongForInstance})

      var iteration = bridge.defineSingleton(
        "iteration",
        function() {
          return {
            "opened": {}}})

      var openIteration = bridge.defineFunction([
        iteration],
        function openIteration(iteration, id, event) {
          event.preventDefault()
          if (iteration.opened[id]) {
            return }
          document.querySelector("#start-cycle-form-"+id+" .open-iteration-button .check-mark").style.display = "inline-block"

          document.querySelector("#start-cycle-form-"+id+" .open-iteration-instruction").style.display = "none"

          iteration.opened[id] = true})

      var ensureIterationOpened = bridge.defineFunction([
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
        bridge.requestHandler(newCycleForm))

      site.addRoute(
        "get",
        "/cycles/:id/start",
        function(request, response) {
          var id = request.params.id
          var name = songCycle.getName(id)
          var songs = songCycle.songsFromCycle(id)

          bridge.forResponse(
            response)
          .send(
            startCycleForm(
              openIteration,
              ensureIterationOpened,
              id,
              name,
              songs))
        })

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
