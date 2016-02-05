// this is how the adventure game can respond with custom bits of code to extend interactivity.
var CustomCode = (function () {

  function hello(n) {
    console.log("Hello " + n +"!");
  }

  function hello2() {
    console.log("Hello!");
  }

  // expose the functions you want the text adventure to use in the return object
  return {
    hello: hello,
    hello2: hello2
  };
})();
