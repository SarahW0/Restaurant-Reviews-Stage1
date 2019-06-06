(function() {
  let a = 3;
  function test() {
    console.log(a);
  }

  function test1(callback) {
    callback();
  }

  test1(test);
})();
