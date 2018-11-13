var library = require("module-library")(require)

// I need to row. I need to push. Keep going forward like breathing. Push. Write a little code. Do something that makes life beautiful.

// RULES:

//  - cycles MUST be weekly, daily, or seasonally


// so I am recording
//   events

// i need an event to be a placebo, and I get points just for doing that thing


library.using([
  library.ref(),
  "web-site",
  "browser-bridge",
  "web-element",
  "basic-styles",
  "make-request",
  "bridge-module",
  "./clock-tick.model",
  "a-wild-universe-appeared",
  "./gem.vr",
  "./universe.vr",
  "./song-cycle.vr"],
  function (lib, WebSite, BrowserBridge, element, basicStyles, makeRequest, bridgeModule, clockTick, aWildUniverseAppeared, gem, universeVr, songCycleVr) {
    var site = new WebSite()
    var baseBridge = new BrowserBridge()
    
    basicStyles.addTo(baseBridge)

    var universe = universeVr(site)

    var grabGem = gem.defineGrabOn(baseBridge)

    var nextTick = baseBridge.defineFunction([
      makeRequest.defineOn(baseBridge),
      grabGem.asBinding(),
      bridgeModule(lib, "web-element", baseBridge),
      bridgeModule(lib, "add-html", baseBridge)],
      function nextTick(makeRequest, grabGem, element, addHtml) {

        var tickGem = element(".gem", element(".color"))

        tickGem.onclick(
          grabGem.withArgs(
            tickGem.assignId()).evalable())

        makeRequest({
          method: "post",
          path: "/tick"},
          addGem)

        function addGem(clock) {
          document.querySelector(".clock").innerHTML = "It is "+clock.tick+" o'clock"
          addHtml.after(
            ".playhead",
            tickGem.html())
        }

      })

    site.addRoute(
      "post",
      "/tick",
      function(request, response) {
        var tick = clockTick()
        universe.do("clockTick")
        response.send({
          tick: tick})
      })

    // ---

    var button = element(
      "button",
      "Press me",{
      "onclick": nextTick.evalable()})

    var body = element.style(
      "body",{
      "word-wrap": "break-word",
      "zoom": "1.2"})

    var panel = element.template.container(
      ".panel",
      element.style({
        "position": "fixed",
        "z-index": "1",
        "background": "rgba(255,255,255,0.2)",
        "right": "10px",
        "top": "10px",
        "display": "flex",
        " button": {
          "background": "transparent",
          "color": "#0ad188",
          "border": "2px solid #0ad188"}
      }))

    var zoom2 = element.style(
      "body.zoom-2", {
      "zoom": "0.9",
      "margin-top": "-24px",

      " .column": {
        "width": "300px",
        "max-width": "45%"},

      " .column button, .column .button, .column input[type=submit]": {
        "overflow": "hidden",
        "vertical-align": "middle",
        "color": "transparent",
        "width": "20px",
        "height": "10px",
        "padding": "0",
        "background": "#95e8ca"},

      " p": {
        "margin": "0",
      },

      " .panel button": {
        "display": "block",},

      " .column-title": {
        "font-size": "4em",
        "display": "block",
        "color": "black"},
    })

    var column = element.style(
      ".column", {
        " .column-title": {
          "display": "none"}})

    var zoom1 = element.style(
      "body.zoom-1, body.zoom-2", {
      "zoom": "1",
      "margin-top": "20px",

      " .column": {
        "max-width": "500px"},

      " h1": {
        "margin": "0.5em 0 0 0",
        "font-size": "1em"},

      " .song-cycle p": {
        "color": "transparent",
        "font-size": "6px"},

      " .song-cycle p .song": {
        "color": "transparent",
        "line-height": "1.6",
        "background": "#ccc"},

      " .song-set": {
        "line-height": "0.3"},

      " .song-button": {
        "pointer-events": "none",
        "opacity": "0.5",
        "display": "inline",
        "color": "transparent",
        "font-size": "6px",
        "padding": "0",
        "margin-right": "0.5em"},
    })
    baseBridge.addToHead(
      element.stylesheet([
        zoom1,
        zoom2,
        column,
        panel,
        body,
        gem]))

    gem.prepareSite(site, universe)

    songCycleVr.prepareSite(site, baseBridge, universe, grabGem)

    site.use(
      songCycleVr.middleware.bind(
        null,
        baseBridge))

    var zoom = baseBridge.defineFunction([
      {zoom: 0}],
      function zoom(settings, amount) {
        var newZoom = settings.zoom + amount
        if (newZoom < 0 || newZoom > 2) {
          return }
        document.body.classList.remove("zoom-"+settings.zoom)
        document.body.classList.add("zoom-"+newZoom)
        settings.zoom = newZoom})

    var zoomIn = element(
      "button",{
      "onclick": zoom.withArgs(-1).evalable()},
      "zoom in")

    var zoomOut = element(
      "button",{
      "onclick": zoom.withArgs(1).evalable()},
      "zoom out")

    site.addRoute(
      "get",
      "/",
      function(request, response) {
        var bridge = baseBridge.forResponse(response)

        var column1 = element(
          ".column",[
          element(".column-title", "Universe"),
          universeVr.element(
            bridge,
            universe),
          element(
            ".playhead",
            element.style({
              "position": "absolute",
              "z-index": "0",
              "left": "0px",
              "width": "100%",
              "height": "2px",
              "background-color": "#00a1ff",
              "border-bottom": "5px solid #e6ffff",
              "margin-top": "25px"})),
          element("div",
            element.style({
              "height": "30px"})),
          element(".clock"),
          element("p", button),
          gem.pouch(),
          songCycleVr(
            bridge),
        ])

        var page = [
          panel(
            zoomIn,
            zoomOut),
          column1
        ]

        bridge.send(
          page)})

    site.start(process.env.PORT || 2043)
  })

// e.g. press the button

// then I get points

// press a button to get todays random list

// can remove items, but it costs points

// cycles feed the lists

// if I remove items, they get more remote, but also after a time, I will get offered to break down the item into smaller steps

// body cycle
//   Face
//   Crest
//   Neck
//   Shoulders
//   Back
//   Tail
//   Right wing
//   Right wing shadow
//   Right leg
//   Right leg shin
//   Right claw
//   Right talon
//   Left claw
//   Left talon
//   Left shin
//   Left leg
//   Belly
//   Left wing shadow
//   Left wing
//   Jaw
//   Beak



// water cycle
//   plant seeds & flood/soak
//   animal thirst quenching
//   tree and vegetable floods
//   wash home
//   hydrate myself
//   coffee
//   cooking

// daily cycle
//   water things
//   tidy
//   feed animals
//   make coffee
//   make lunch
//   set up future socializing
//   phone calls or socializing
//   sleep
//   music
//   make a list
//   feel sad

// monthly cycle
//   create budget
//   pick a day to go camping
//   invite people to camping
//   plan camping meals
//   go camping
//   schedule a house meeting
//   hold a house meeting
//   identify a new group purchasing project
//   identify one fun thing the house will do together, work project or whatever

// weekly cycle
//   balance checkbook
//   meal planning
//   grocery shopping


// floors: https://www.youtube.com/watch?v=hIqOgqpNLXw
