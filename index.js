"use strict";

(async () => {
  let a = (undefined || "asd").replace("a", "");
  console.log("Hello Node", a);
})();
