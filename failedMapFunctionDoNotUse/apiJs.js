const containerResults = document.getElementById("flexContainer");
let notificationElement = document.createElement("section");


//Stores all fetch results for later use if desired!

let userInputItems = {
  inputString: null,
  inputDistance: null,
  inputSearchSize: null,
  inputFullmenu: 0,
  resetUserItems: function () {
    this.inputString = null;
    this.inputDistance = null;
    this.inputSearchSize = null;
    this.inputFullmenu = 0;
  }
}

let fetchRequest = {
  lat: null,
  lon: null,
  readyOpencageURL: null,
  readydocmenuURL: null,
  documenuSearchResults: null,
  opencageSearchResults: null,
  resetfetchRequest: function () {
    this.lat = null;
    this.lon = null;
    this.readyOpencageURL = null;
    this.readydocmenuURL = null;
    this.documenuSearchResults = null;
    this.opencageSearchResults = null;
  }
}

function cleanDom() {
  while (containerResults.lastElementChild) {
    containerResults.removeChild(containerResults.lastElementChild);
  }
}

//Should have used creatEelement methods.....



function calculateVisibleMap(mapid, lat, lon) {
 
  console.log(mapid);
  console.log(lat);
  console.log(lon);
  mapboxgl.accessToken = 'pk.eyJ1IjoidGhybyIsImEiOiJja21ldW5xbGUyejByMnVudzZjNmZicGk2In0.w1F6JWPWuwV0ZGJuGLqOoQ';
  var map = new mapboxgl.Map({
  container: 'map' + mapid, // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: [lat, lon], // starting position [lng, lat]
  zoom: 9 // starting zoom
  });

 new mapboxgl.Marker({color: 'black'})
.setLngLat([lat, lon])
.addTo(map);
};



function listDomResults() {

  let mapid = 0;

  fetchRequest.documenuSearchResults.data.forEach(resturant => {

    mapid++

    function renameEmptyStrings(string) {
      if (string === "") {
        return string = "Not detailed"
      } else {
        return string = string;
      }
    }

    let restName = renameEmptyStrings(resturant.restaurant_name)
    let restPhone = renameEmptyStrings(resturant.restaurant_phone)
    let restPrice = renameEmptyStrings(resturant.price_range)
    let resthours = renameEmptyStrings(resturant.hours)
    let restAddress = renameEmptyStrings(resturant.address.formatted)

    function renameAndCreateEmptyBTN(string) {
      if (string === "") {
        return string = `<a href="#"><button class="restLinkBtn" disabled>Visit website!</button></a>`
      } else {
        return string = `<a href="${string}"><button class="restLinkBtn">Visit website!</button></a>`
      }
    }

    let restHyperlink = renameAndCreateEmptyBTN(resturant.restaurant_website)

    let cuisinesItteration = document.createElement("ul");;

    resturant.cuisines.forEach(cuisines => {
      let checkNA = renameEmptyStrings(cuisines);
      let createItteration = document.createElement("li");
      let createItterationTextNode = document.createTextNode(checkNA);
      createItteration.appendChild(createItterationTextNode);
      cuisinesItteration.appendChild(createItteration);
    })

    let restCuisines = cuisinesItteration.outerHTML;


    let resultArticle = document.createElement("article");
    resultArticle.classList = "articleContainer";
    resultArticle.innerHTML = `
        <h3 class="restHeader">${restName}</h3>
       
          <div><b>Phone: </b><a href="tel:${restPhone}">${restPhone}</a></div>
         <div class="meta">
          <div><b>Price range:</b> ${restPrice}</div>
          <div><b>Hours opened:</b> ${resthours}</div>
          <div><b>We focus on:</b> ${restCuisines}</div>
            
          <adress class="restAdress"><b>Visit us at:</b><br>${restAddress}</adress>
          
        </div>
        <div>${restHyperlink}</div>

        <div id='map${mapid}' style='width: 400px; height: 300px;'></div>
      
        `
    containerResults.appendChild(resultArticle);

    calculateVisibleMap(mapid, resturant.geo.lat, resturant.geo.lon);
    
  });
}

function noDomResults(message) {
  notificationElement.classList = "NoSearchResults"
  notificationElement.innerHTML =
    `<p class="errorPara">Sorry, your search gave no results, check your spelling on the street, or try another cuisine</p>`;
  containerResults.appendChild(notificationElement);
}

function ErrorFetchResults(message) {
  notificationElement.classList = "errorContainer"
  notificationElement.innerHTML = `
  <p class="errorPara"><b>Something failed to fetch, doublecheck your spelling on the street</b></p>
  <p class="errorPara">Error message from fetch::: ${message}</p>`
  containerResults.appendChild(notificationElement);
}

//makes a workable URL for geo fetch
function makeFullUrl() {
  let fill = userInputItems.inputString.trim().replaceAll(" ", "%20");
  let concateURL = "https://api.opencagedata.com/geocode/v1/json?q=" + fill +
    "&key=5933d4d1a2e44014898cdbbbc9b225d6&language=en";
  fetchRequest.readyOpencageURL = concateURL;
  // Key already in url! I don't like they include it in the url
  // const API_OPENCAGEDATA_KEY = "5933d4d1a2e44014898cdbbbc9b225d6";
}

//Makes workable url for docmenu
function makeFullResturantUrl() {
  let documenuURL = "https://api.documenu.com/v2/restaurants/search/geo?" +
    `lat=${fetchRequest.lat}&lon=${fetchRequest.lon}&distance=${userInputItems.inputDistance}&size=${userInputItems.inputSearchSize}`;
  //shorthand if else statement.. Made to build up the URL! https://www.javascripttutorial.net/javascript-if-else/
  userInputItems.inputFullmenu.length > 0 ? documenuURL += `&cuisine=${userInputItems.inputFullmenu}` : "";
  fetchRequest.readydocmenuURL = documenuURL;
}

function simulateLoading(booleanFetching) {
  const feildsetContainer = document.getElementById("feildsetContainer");

  if (booleanFetching) {
    feildsetContainer.disabled = true;
  } else {
    feildsetContainer.disabled = false;
  }
};

//Makes request for resturants with requestLocation cordinates
function requestResturant() {

  makeFullResturantUrl()

  const API_KEY = "2fa880c30294de07ebdc0113f4299e33";

  fetch(fetchRequest.readydocmenuURL, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY
      }
    }).then(res => res.json())
    .then(objs => {
      fetchRequest.documenuSearchResults = objs;
      if (objs.totalResults === 0) {
        simulateLoading(false);
        noDomResults()
        return;
      }
      listDomResults()
      simulateLoading(false)
    }).catch(err => {
      console.log(err.message);
      ErrorFetchResults(err.message);
      simulateLoading(false);
    })
}

//Makes the full requst!
const requestLocation = document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();
  simulateLoading(true);
  cleanDom();
  fetchRequest.resetfetchRequest();
  userInputItems.resetUserItems();
  userInputItems.inputString = document.getElementById("search").value;
  userInputItems.inputDistance = document.getElementById("distance").value;
  userInputItems.inputSearchSize = document.getElementById("size").value;
  userInputItems.inputFullmenu = document.getElementById("fullmenu").value;
  makeFullUrl();

  fetch(fetchRequest.readyOpencageURL)
    .then(res => res.json())
    .then(objs => {
      fetchRequest.opencageSearchResults = objs;
      //Grabs the first cordinates of the search, doesn't care about arrays.
      fetchRequest.lat = objs.results[0].geometry.lat;
      fetchRequest.lon = objs.results[0].geometry.lng;
      requestResturant();
    }).catch(err => {
      console.log(err.message);
      ErrorFetchResults(err.message);
      simulateLoading(false);
    })
});

document.getElementById("distance").addEventListener("change", (e) => {
  let showDistanceOutput = document.getElementById("showDistanceOutput");
  showDistanceOutput.innerHTML = `<b>${e.target.value}</b>`;
})