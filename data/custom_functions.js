/* 
  This is an example Extension object which can be passed to the Text Adventure engine. 
  The extension object should contain publically exposed functions which you can call from your game data using triggers.
  See the README document for more information.
*/
var TAExtension = (function () {
  t = "";

  function hello(n) {
    console.log("Hello " + n +"!");
  }

  return {
    hello: hello
  };
})();
