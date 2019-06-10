(function() {
  let gRestaurants, gNeighborhoods, gCuisines;
  let gMarkers = [];

  /**
   * Fetch neighborhoods and cuisines as soon as the page is loaded.
   */
  document.addEventListener("DOMContentLoaded", event => {
    initMap(); // added
    fetchNeighborhoods();
    fetchCuisines();
  });

  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) {
        // Got an error
        console.error(error);
      } else {
        gNeighborhoods = neighborhoods;
        fillNeighborhoodsHTML();
      }
    });
  };

  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML = (neighborhoods = gNeighborhoods) => {
    const select = document.getElementById("neighborhoods-select");
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement("option");
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  };

  /**
   * Fetch all cuisines and set their HTML.
   */
  fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        gCuisines = cuisines;
        fillCuisinesHTML();
      }
    });
  };

  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML = (cuisines = gCuisines) => {
    const select = document.getElementById("cuisines-select");

    cuisines.forEach(cuisine => {
      const option = document.createElement("option");
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  };

  /**
   * Initialize leaflet map, called from HTML.
   */
  initMap = () => {
    var width = window.innerWidth > 0 ? window.innerWidth : screen.width;

    window.newMap = L.map("map", {
      center: [40.722216, -73.987501],
      zoom: width < 800 ? 11 : 12,
      scrollWheelZoom: false,
      keyboard: false
    });
    L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
      {
        mapboxToken:
          "pk.eyJ1Ijoic2FyYWhqaHciLCJhIjoiY2p3ZGE5NWhpMGVhczN6cWg2YzhubmV0OCJ9.SYH8ULsuEGLoeZzT5UyVhA",
        maxZoom: 18,
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
        id: "mapbox.streets"
      }
    ).addTo(window.newMap);

    updateRestaurants();
  };

  /**
   * Update page and map for current restaurants.
   */
  updateRestaurants = () => {
    const cSelect = document.getElementById("cuisines-select");
    const nSelect = document.getElementById("neighborhoods-select");

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(
      cuisine,
      neighborhood,
      (error, restaurants) => {
        if (error) {
          // Got an error!
          console.error(error);
        } else {
          resetRestaurants(restaurants);
          fillRestaurantsHTML();
        }
      }
    );
  };

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants = restaurants => {
    // Remove all restaurants
    gRestaurants = [];
    const ul = document.getElementById("restaurants-list");
    ul.innerHTML = "";

    // Remove all map markers
    if (gMarkers) {
      gMarkers.forEach(marker => marker.remove());
    }
    gMarkers = [];
    gRestaurants = restaurants;
  };

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML = (restaurants = gRestaurants) => {
    const ul = document.getElementById("restaurants-list");
    restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
  };

  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML = restaurant => {
    /*
<picture>  
  <source media="(min-width: 610px)" srcset="1-medium.jpg, 1.jpg 2x">  
  <img src="1-small.jpg" srcset="1-medium.jpg 2x" alt="a head carved out of wood">
</picture>
*/
    const resURL = DBHelper.imageUrlForRestaurant(restaurant);
    const imageName = resURL.substring(0, resURL.length - 4);

    const picture = document.createElement("picture");
    picture.innerHTML = `
    <source media="(max-width: 610px)" srcset="${imageName}-medium.jpg, ${imageName}.jpg 2x">  
    <img src="${imageName}-small.jpg" srcset="${imageName}-medium.jpg 2x" alt="${
      restaurant.name
    } restaurant">
    `;

    const li = document.createElement("li");
    li.append(picture);

    const name = document.createElement("h1");
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement("p");
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement("p");
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement("a");
    more.innerHTML = `View Details <span class="screen-reader-only"> Link to view details about ${
      restaurant.name
    } restaurant in ${restaurant.neighborhood} and the address is ${
      restaurant.address
    }</span>`;
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li;
  };

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap = (restaurants = gRestaurants) => {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, window.newMap);
      marker.on("click", onClick);

      function onClick() {
        window.location.href = marker.options.url;
      }

      gMarkers.push(marker);
    });
  };
})();
