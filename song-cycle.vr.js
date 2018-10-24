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
  "bridge-module"],
  function(lib, element, songCycle, iterationTemplate, bridgeModule) {

    function songCycleVr(bridge) {

      var button = element(
        "a.button",{
        "href": "/cycles/new"},
        "Type out new cycle")

      var calls = bridge.remember("song-cycle.vr/calls")

      var cycles = songCycle.mapCycles(
        cycleTemplate.bind(
          null,
          calls.startCycle))

      var instances = songCycle.mapOpenInstances(
        iterationTemplate.bind(
          null,
          calls.singSong,
          calls.addSongForInstance))

      return [button].concat(instances, cycles)}

    var form = element(
      "form",{
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

    var cycleTemplate = element.template(
      ".song-cycle",
      element.style({
        "background": "#cffeff"}),
      function(startCycle, id, name, songs) {
        this.addChildren([
          element(
            "h1",
            name+" cycle"),
          element(
            "p",
            songs.join(
              ", ")),
          element(
            "button",{
            "onclick": startCycle.withArgs(id, name).evalable()},
            "Start "+name+" cycle"),
        ])
      })

    var page = element(".lil-page", form)

    songCycleVr.prepareSite = function(site, bridge, universe) {

      var singSong = bridge.defineFunction(
        function singSong(){})

      var addSongForInstance = bridge.defineFunction(
        function addSongForInstance(){})

      var startCycle = bridge.defineFunction([
        bridgeModule(
          lib,
          "add-html",
          bridge),
        bridgeModule(
          lib,
          "song-cycle.vr/iterationTemplate",
          bridge),
        bridgeModule(
          lib,
          "song-cycle",
          bridge),
        singSong.asCall(),
        addSongForInstance.asCall()],
        function startCycle(addHtml, iterationTemplate, songCycle, singSong, addSongForInstance, cycleId, cycleName) {

          var id = null
          var name = null
          var songs = songCycle.songsFromCycle(cycleId)

          addHtml(
            iterationTemplate(
              singSong,
              addSongForInstance,
              id,
              name,
              cycleName,
              songs)
            .html())
        })

      bridge.see(
        "song-cycle.vr/calls",{
        startCycle: startCycle,
        singSong: singSong,
        addSongForInstance: addSongForInstance})

      site.addRoute(
        "get",
        "/cycles/new",
        bridge.requestHandler(page))

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
