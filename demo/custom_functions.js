var TAExtension = (function () {

  t = "";

  function hello(n) {
    console.log("Hello " + n +"!");
  }

  return {
    hello: hello
  };
})();
