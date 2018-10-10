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
  "./clock-tick",
  "a-wild-universe-appeared",
  "./gem",
  "./boot-universe"],
  function (lib, WebSite, BrowserBridge, element, basicStyles, makeRequest, bridgeModule, clockTick, aWildUniverseAppeared, gem, bootUniverse) {
    var site = new WebSite()
    var baseBridge = new BrowserBridge()
    basicStyles.addTo(baseBridge)

    var universe = bootUniverse(site)

    // ---

    var grabGem = gem.defineGrabOn(baseBridge)

    var nextTick = baseBridge.defineFunction([
      makeRequest.defineOn(baseBridge),
      grabGem.asBinding(),
      bridgeModule(lib, "web-element", baseBridge),
      bridgeModule(lib, "add-html", baseBridge)],
      function(makeRequest, grabGem, element, addHtml) {

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
          addHtml(tickGem.html())
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
      "zoom": "2.2"})

    baseBridge.addToHead(
      element.stylesheet([
        body,
        gem]))

    var page = [
      bootUniverse.element(
        universe,
        baseBridge),
      button,
      element(".clock"),
      gem(grabGem),
      gem.pouch()]

    gem.prepareSite(site)


    site.addRoute(
      "get",
      "/",
      baseBridge.requestHandler(page))

    site.start(process.env.PORT || 2043)
  })

// e.g. press the button

// then I get points

// press a button to get todays random list

// can remove items, but it costs points

// cycles feed the lists

// if I remove items, they get more remote, but also after a time, I will get offered to break down the item into smaller steps



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
