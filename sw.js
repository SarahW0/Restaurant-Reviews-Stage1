const cacheName = "restaurant-review-stage1-v1-4";

//self is the worker here and is the window somewhere else
self.addEventListener("install", event => {
  const resourceToCache = [
    "/",
    "index.html",
    "restaurant.html",
    "css/styles.css",
    "data/restaurants.json",
    "js/dbhelper.js",
    "js/main.js",
    "js/restaurant_info.js"
  ];

  console.log("install event");
  //wait the last promise to complete before returning control to the event handler
  event.waitUntil(
    //add the resource to the cache
    caches
      .open(cacheName)
      .then(cache => {
        //load the resources from network and save them in the cache
        return cache.addAll(resourceToCache);
      })
      .catch(err => console.log(err))
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cache) {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin

            return cache.indexOf("restaurant-review") >= 0;
          })
          .map(function(cache) {
            console.log("delete:", cache);
            return caches.delete(cache);
          })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    //find the fetching resource from the cache
    caches.match(event.request.url).then(cachedResponse => {
      const fetchURL = new URL(event.request.url);
      if (fetchURL.hostname !== "localhost") {
        event.request.mode = "no-cors";
      }
      return (
        cachedResponse ||
        fetch(event.request)
          .then(function(response) {
            if (response.status === 404) {
              return new Response("Resource was not found!");
            }
            return caches.open(cacheName).then(cache => {
              //load the resources from network and save them in the cache
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(function(err) {
            return new Response(`Something is wrong: ${err}`);
          })
      );
    })
  );
});

self.addEventListener("message", function(event) {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
