var library = require("module-library")(require)

library.define(
  "song-cycle.vr/iterationTemplate",[
  "web-element"],
  function(element) {

    var iterationTemplate = element.template(
      ".song-cycle-iteration",
      function(singSong,addSongForInstance, iterationId, name, cycleName, songs) {
        
        function button(song) {
          return element(
            "button",
            "Sing "+song)}

        this.addChild(
          element(
            "h1",
            "Singing "+name+" from songs of "+cycleName))

        this.addChildren(
          songs.map(button))
      })

    return iterationTemplate})

module.exports = library.export(
  "song-cycle.vr",[
  library.ref(),
  "web-element",
  "./song-cycle.model",
  "song-cycle.vr/iterationTemplate",
  "bridge-module",
  "browser-bridge"],
  function(lib, element, songCycle, iterationTemplate, bridgeModule, BrowserBridge) {

    function songCycleVr(bridge) {

      var button = element(
        "a.button",{
        "href": "/cycles/new"},
        "Type out new cycle")

      var calls = bridge.remember("song-cycle.vr/calls")

      var cycles = songCycle.mapCycles(
        cycleTemplate)

      var instances = songCycle.mapOpenInstances(
        iterationTemplate.bind(
          null,
          calls.singSong,
          calls.addSongForInstance))

      return [button].concat(instances, cycles)}

    var cycleTemplate = element.template(
      ".song-cycle",
      element.style({
        "background": "#cffeff"}),
      function(id, name, songs) {
        this.addChildren([
          element(
            "h1",
            name+" cycle"),
          element(
            "p",
            songs.join(
              ", ")),
          element(
            "a.button",{
            "href": "/cycles/"+id+"/start"},
            "Start "+name+" cycle"),
        ])
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
        element("p", element(
          "input",{
          "type": "submit",
          "value": "Create cycle"})),
      ])

    var songButton = element.template(
      "input",{
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
      " .open-iteration-check": {
        "display": "none",
        "margin-right": "0.25em",
      },
      " .open-iteration-instruction": {
        "display": "none"},
      ".opened .open-iteration-check": {
        "display": "inline-block"}})

    var startCycleForm = element.template(
      "form.lil-page.start-cycle-form",{
      "method": "post",
      "action": "/cycles/iterations"},
      function(openIteration, ensureIterationOpened, id, name, songs) {

        this.addAttributes({
          "onsubmit": ensureIterationOpened.withArgs(id, BrowserBridge.event).evalable(),
          "id": "start-cycle-form-"+id})

        this.addChildren([
          element("h1", "Starting "+name),
          element("p", "Which instance of this cycle is starting?"),
          element(
            "input",{
            "type": "text",
            "name": "instanceName",
            "placeholder": "name"}),
          element("p", "When you are ready, open the cycle with something ceremonial"),
          element(".open-iteration-instruction.warning", "You needa do this"),
          element(
            "button.open-iteration-button",{
            "onclick": openIteration.withArgs(id, BrowserBridge.event).evalable()},
            element(".open-iteration-check", "&#10004;"),
            "Opening ceremony performed"),
          element("p", "And then choose an easy task to get some momentum:"),
          songs.map(songButton),
          element(
            "input",{
            "type": "hidden",
            "name": "cycleId"})])
      })

    songCycleVr.prepareSite = function(site, bridge, universe) {

      var singSong = bridge.defineFunction(
        function singSong(){})

      var addSongForInstance = bridge.defineFunction(
        function addSongForInstance(){})

      bridge.addToHead(
        element.stylesheet(
          startCycleStyle))

      bridge.see(
        "song-cycle.vr/calls",{
        singSong: singSong,
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
          document.getElementById("start-cycle-form-"+id).classList.add("opened")

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
          var songs = songCycle.getSongs(id)

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
          var firstSongSung = request.body.firstSongSung
        })
      site.addRoute(
        "post",
        "/cycles",
        function(request, response) {
          var name = request.body.name
          var songs = []

          request.body.songs.split("\n").forEach(
            function(text) {
              text = text.trim()
              if (text.length > 0) {
                songs.push(text)}})

          var id = songCycle(null, name, songs)
          universe.do("songCycle", id, name, songs)

          response.redirect("/")
        })
    }

    function strip(text) {
      return text.trim()
    }

    return songCycleVr})
