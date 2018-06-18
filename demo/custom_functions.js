// this is how the adventure game can respond with custom bits of code to extend interactivity.
var TAExtension = (function () {

  t = "";

  function hello(n) {
    console.log("Hello " + n +"!");
  }

  // expose the functions you want the text adventure to use in the return object
  return {
    hello: hello
  };
})();