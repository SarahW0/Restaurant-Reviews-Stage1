/**
 * js functions for the restaurant detail page
 */
(function() {
  let gRestaurant;
  /**
   * Initialize map as soon as the page is loaded.
   */
  document.addEventListener("DOMContentLoaded", event => {
    initMap();
  });

  /**
   * resize map 3 times to make it fully cover map div element
   * without these code, the map only covers part of map div element until window is resized
   */
  window.addEventListener("load", event => {
    setTimeout(function() {
      if (window.newMap) {
        window.newMap._onResize();
      }
    }, 200);

    setTimeout(function() {
      if (window.newMap) {
        window.newMap._onResize();
      }
    }, 500);

    setTimeout(function() {
      if (window.newMap) {
        window.newMap._onResize();
      }
    }, 1000);
  });
  /**
   * Initialize leaflet map
   */
  initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        window.newMap = L.map(document.querySelector("#map"), {
          center: [restaurant.latlng.lat, restaurant.latlng.lng],
          zoom: 16,
          scrollWheelZoom: false,
          keyboard: false
        });
        L.tileLayer(
          "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
          {
            mapboxToken:
              "pk.eyJ1Ijoic2FyYWhqaHciLCJhIjoiY2p3ZGE5NWhpMGVhczN6cWg2YzhubmV0OCJ9.SYH8ULsuEGLoeZzT5UyVhA",
            maxZoom: 25, //18,
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
            id: "mapbox.streets"
          }
        ).addTo(window.newMap);

        //create breadcrumb navigation menu
        fillBreadcrumb();

        //add markers to the restaurants on map
        DBHelper.mapMarkerForRestaurant(gRestaurant, window.newMap);
      }
    });
  };

  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL = callback => {
    if (gRestaurant) {
      // restaurant already fetched!
      callback(null, gRestaurant);
      return;
    }
    const id = getParameterByName("id");
    if (!id) {
      // no id found in URL
      error = "No restaurant id in URL";
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        gRestaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return;
        }
        fillRestaurantHTML();
        callback(null, restaurant);
      });
    }
  };

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML = (restaurant = gRestaurant) => {
    //show restaurant name
    const name = document.getElementById("restaurant-name");
    name.innerHTML = restaurant.name;

    //show restaurant address
    const address = document.getElementById("restaurant-address");
    address.innerHTML = `<span class="screen-reader-only">address is</span>${
      restaurant.address
    }`;

    /** Beginning Restaurant Picture */
    const resURL = DBHelper.imageUrlForRestaurant(restaurant);
    const imageName = resURL.substring(0, resURL.length - 4);

    const picture = document.getElementById("restaurant-picture");
    picture.innerHTML = `
    <source media="(min-width: 760px)" srcset="${imageName}-medium.jpg, ${imageName}.jpg 2x">  
    <source media="(max-width: 400px)" srcset="${imageName}-medium.jpg, ${imageName}.jpg 2x">  
    <img id="restaurant-img" class="restaurant-img" src="${imageName}.jpg" alt="${
      restaurant.name
    } restaurant">
    `;
    /** End Restaurant Picture */

    //show restaurant cuisine type
    const cuisine = document.getElementById("restaurant-cuisine");
    cuisine.innerHTML = `${
      restaurant.cuisine_type
    }<span class="screen-reader-only">cuisine type</span>`;

    // fill operating hours
    if (restaurant.operating_hours) {
      fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
  };

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML = (operatingHours = gRestaurant.operating_hours) => {
    const hours = document.getElementById("restaurant-hours");
    for (let key in operatingHours) {
      const row = document.createElement("tr");

      const day = document.createElement("td");
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement("td");
      time.innerHTML = operatingHours[key];
      var timeRes = operatingHours[key].split(",");
      if (timeRes.length === 0) {
        time.innerHTML = operatingHours[key];
      } else {
        let timeStr = "";
        for (let i = 0; i < timeRes.length; i++) {
          timeStr += timeRes[i].trim();
          if (i < timeRes.length - 1) {
            timeStr += "<br />";
          }
        }
        time.innerHTML = timeStr;
      }

      row.appendChild(time);

      hours.appendChild(row);
    }
  };

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML = (reviews = gRestaurant.reviews) => {
    const container = document.getElementById("reviews-container");
    const title = document.createElement("h3");
    title.innerHTML = "Reviews";
    container.appendChild(title);

    if (!reviews) {
      const noReviews = document.createElement("p");
      noReviews.innerHTML = "No reviews yet!";
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById("reviews-list");
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  };

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML = review => {
    const li = document.createElement("li");
    const name = document.createElement("p");
    name.setAttribute("class", "review-name");
    name.innerHTML = `<span class="screen-reader-only">Reviewd by</span>${
      review.name
    }`;
    li.appendChild(name);

    const date = document.createElement("p");
    date.setAttribute("class", "review-date");
    date.innerHTML = review.date;
    li.appendChild(date);

    const rating = document.createElement("p");
    rating.setAttribute("class", "review-rating");

    let star = "";
    for (let i = 0; i < review.rating; i++) {
      star += "❤";
    }
    rating.innerHTML = `Rating: <span class="screen-reader-only">${
      review.rating
    } out of 5</span><span class="review-star" aria-hidden="true">${star}</span>`;

    li.appendChild(rating);

    const comments = document.createElement("p");
    comments.setAttribute("class", "review-comments");
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
  };

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb = (restaurant = gRestaurant) => {
    const breadcrumb = document.getElementById("breadcrumb");
    const li = document.createElement("li");
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  };

  /**
   * Get a parameter by name from page URL.
   */
  getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };
})();
