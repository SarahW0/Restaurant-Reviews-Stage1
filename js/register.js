/**
 * Service worker registration file
 */
let newWorker;

//if browser supports service worker
if ("serviceWorker" in navigator) {
  //once document is fully loaded, register service worker
  window.addEventListener("load", () => {
    //add click event listener to
    document
      .getElementById("sw-reload")
      .addEventListener("click", function(event) {
        document.getElementById("sw-notification").classList.add("hide");
        newWorker.postMessage({ action: "skipWaiting" });
      });
    //register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => {
        reg.addEventListener("updatefound", () => {
          newWorker = reg.installing;
          newWorker.addEventListener("statechange", () => {
            switch (newWorker.state) {
              case "installed":
                if (navigator.serviceWorker.controller) {
                  document
                    .getElementById("sw-notification")
                    .classList.remove("hide");
                }
                break;
            }
          });
        });
        console.log("Registered!", reg);
      })
      .catch(err => {
        console.log("Registration failed:", err);
      });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  });
}
