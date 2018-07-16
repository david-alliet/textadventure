var TAExtension = (function () {

  function hello(n, ta) {
    ta.printLine("Hello " + n +"!");
  }

  return {
    hello: hello
  };
})();
