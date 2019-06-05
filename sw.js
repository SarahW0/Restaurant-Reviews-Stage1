/*
const cacheName = "restaurant-review-stage1-v1";
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

//self is the worker here and is the window somewhere else
self.addEventListener("install", event => {
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

self.addEventListener("activate", event => {
  console.log("Activate event");
});

self.addEventListener("fetch", event => {
  event.respondWith(
    //find the fetching resource from the cache
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});*/
