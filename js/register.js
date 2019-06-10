let newWorker;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => {
        document
          .getElementById("sw-reload")
          .addEventListener("click", function(event) {
            document.getElementById("sw-notification").classList.add("hide");
            newWorker.postMessage({ action: "skipWaiting" });
          });

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
