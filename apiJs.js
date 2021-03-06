const containerResults = document.getElementById("flexContainer");
let resultContainerChild = document.createElement("section");


//Stores all user inputs
let userInputItems = {
  inputString: null,
  inputDistance: null,
  inputSearchSize: null,
  inputFullmenu: 0,
}

//Stores all api request results
let requestStateItems = {
  lat: null,
  lon: null,
  readyOpencageURL: null,
  readydocmenuURL: null,
  documenuSearchResults: null,
  opencageSearchResults: null,
}

function cleanDom() {
  while (containerResults.lastElementChild) {
    containerResults.removeChild(containerResults.lastElementChild);
  }
}

//Should have used creatEelement methods.....

//function to rename empty values to N/A
function renameEmptyStrings(string) {
  if (string === "") {
    return string = "N/A"
  } else {
    return string = string;
  }
}

//function to make buttons
function renameAndCreateEmptyBTN(string) {
  if (string === "") {
    return string = `<a href="#"><button class="restLinkBtn" disabled>Visit website!</button></a>`
  } else {
    return string = `<a href="${string}"><button class="restLinkBtn">Visit website!</button></a>`
  }
}

function listDomResults() {

  requestStateItems.documenuSearchResults.data.forEach(resturant => {

    let restName = renameEmptyStrings(resturant.restaurant_name);
    let restPhone = renameEmptyStrings(resturant.restaurant_phone);
    let restPrice = renameEmptyStrings(resturant.price_range);
    let resthours = renameEmptyStrings(resturant.hours);
    let restAddress = renameEmptyStrings(resturant.address.formatted);
    let restHyperlink = renameAndCreateEmptyBTN(resturant.restaurant_website);
    let cuisinesItteration = document.createElement("ul");;

    resturant.cuisines.forEach(cuisines => {
      let checkNA = renameEmptyStrings(cuisines);
      let createItteration = document.createElement("li");
      let createItterationTextNode = document.createTextNode(checkNA);
      createItteration.appendChild(createItterationTextNode);
      cuisinesItteration.appendChild(createItteration);
    })

    let restCuisines = cuisinesItteration.outerHTML;


    //Makes the dynamic elements of everything gathered
    let resultArticle = document.createElement("article");
    resultArticle.classList = "articleContainer";
    resultArticle.innerHTML = `
    <header>
        <h3 class="restHeader">${restName}</h3>
    </header>
       
    <div>
          <p><b>Phone: </b><a href="tel:${restPhone}">${restPhone}</a></p>
         <div class="meta">
          <p><b>Price range:</b> ${restPrice}</p>
          <p><b>Hours opened:</b> ${resthours}</p>
          <div>
          <p><b>We focus on:</b> ${restCuisines}</p>
          </div>
          <p>${restHyperlink}</p>
          </div>
        </div>
    
        <adress class="restAdress"><b>Visit us at:</b><br>${restAddress}</adress>
        `
    containerResults.appendChild(resultArticle);
  });
}

function noDomResults() {
  resultContainerChild.classList = "NoSearchResults"
  resultContainerChild.innerHTML =
    `<p class="errorPara">Sorry, your search gave no results, check your spelling on the street, or try another cuisine</p>`;
  containerResults.appendChild(resultContainerChild);
}

function ErrorFetchResults(message) {
  resultContainerChild.classList = "errorContainer"
  resultContainerChild.innerHTML = `
  <p class="errorPara"><b>Something failed to fetch, doublecheck your spelling on the street</b></p>
  <p class="errorPara">Error message from fetch::: ${message}</p>`
  containerResults.appendChild(resultContainerChild);
}

//makes a workable URL for geo fetch
function makeFullUrl() {
  let trimString = userInputItems.inputString.trim().replaceAll(" ", "%20");
  let concateURL = "https://api.opencagedata.com/geocode/v1/json?q=" + trimString +
    "&key=5933d4d1a2e44014898cdbbbc9b225d6&language=en";
  requestStateItems.readyOpencageURL = concateURL;
  //API_OPENCAGEDATA_KEY "5933d4d1a2e44014898cdbbbc9b225d6";
}

//Makes workable url for docmenu
function makeFullResturantUrl() {
  let documenuURL = "https://api.documenu.com/v2/restaurants/search/geo?" +
    `lat=${requestStateItems.lat}&lon=${requestStateItems.lon}&distance=${userInputItems.inputDistance}&size=${userInputItems.inputSearchSize}`;
  //shorthand if else statement.. Made to build up the URL! https://www.javascripttutorial.net/javascript-if-else/
  userInputItems.inputFullmenu.length > 0 ? documenuURL += `&cuisine=${userInputItems.inputFullmenu}` : "";
  requestStateItems.readydocmenuURL = documenuURL;
}

function simulateLoading(booleanFetching) {
  const feildsetContainer = document.getElementById("feildsetContainer");
  const contentLoadingImage = document.getElementById("loadImage");
  if (booleanFetching) {
    feildsetContainer.disabled = true;
    contentLoadingImage.hidden = false;
  } else {
    feildsetContainer.disabled = false;
    contentLoadingImage.hidden = true;
  }
};

//Makes request for resturants with requestLocation cordinates
function requestResturant() {

  makeFullResturantUrl()

  const API_KEY = "2fa880c30294de07ebdc0113f4299e33";

  fetch(requestStateItems.readydocmenuURL, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY
      }
    }).then(res => res.json())
    .then(objs => {
      requestStateItems.documenuSearchResults = objs;
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

  userInputItems.inputString = document.getElementById("search").value;
  userInputItems.inputDistance = document.getElementById("distance").value;
  userInputItems.inputSearchSize = document.getElementById("size").value;
  userInputItems.inputFullmenu = document.getElementById("cuisine").value;
  makeFullUrl();

  fetch(requestStateItems.readyOpencageURL)
    .then(res => res.json())
    .then(objs => {
      requestStateItems.opencageSearchResults = objs;
      //Grabs the first cordinates of the search, doesn't care about arrays.
      requestStateItems.lat = objs.results[0].geometry.lat;
      requestStateItems.lon = objs.results[0].geometry.lng;
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