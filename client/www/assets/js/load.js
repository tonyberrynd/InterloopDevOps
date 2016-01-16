var loading_messages = [
      "Hey you. Welcome back!",
      "You look nice today",
      "Amazing things come to those who wait",
      "Coffee is for closers",
      "Don't wait for opportunity. Create it.",
      "Glorious things are waiting for you.",
      "Enjoy Interloop responsibly.",
      "Hakuna matata"
    ]

var loading_message = loading_messages[Math.floor(Math.random()*loading_messages.length)];

window.loading_screen = window.pleaseWait({
    logo: "assets/img/interloop-white.png",
    backgroundColor: '#fff',
    loadingHtml: '<p class="loading-message">' + loading_message + '</p> <div class="loop-loader"> <div class="loader-inner ball-triangle-path"> <div></div><div></div><div></div></div></div>',
     // loadingHtml: 
});