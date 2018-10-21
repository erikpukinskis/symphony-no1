var library = require("module-library")(require)

module.exports = library.export(
  "cycles",[
  "web-element", "./song-cycle.model"],
  function(element, songCycle) {

    function cycles() {

      var button = element(
        "a.button",{
        "href": "/cycles/new"},
        "Type out new cycle")

      debugger
      var names = songCycle.map(
        function(name, songs) {
          debugger
          var el =  element(
            ".cycle",
            element.style({
              "background": "#cffeff"}),
            element(
              "h1",
              name),
            element(
              "p",
              songs.join(
                ", ")))
          return el})

      debugger
      return [button].concat(names)}

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

    var page = element(".lil-page", form)

    var store = []
    var universe

    function addCycle(name, songs) {
      debugger
      songCycle(name, songs)
      universe.do("songCycle", name, songs)
    }

    cycles.prepareSite = function(site, bridge, defaultUniverse) {
      universe = defaultUniverse

      site.addRoute(
        "get",
        "/cycles/new",
        bridge.requestHandler(page))

      site.addRoute(
        "post",
        "/cycles",
        function(request, response) {
          debugger
          var name = request.body.name
          var songs = []

          request.body.songs.split("\n").forEach(
            function(text) {
              text = text.trim()
              if (text.length > 0) {
                songs.push(text)}})

          addCycle(name, songs)

          response.redirect("/")
        })
    }

    function strip(text) {
      return text.trim()
    }

    return cycles})
