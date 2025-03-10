// const sha1 = require('js-sha1');
// const axios = require('axios');

// Global variables to store the username, hashed password, and response
let globalUsr = "";
let globalPowSha1 = "";
let globalJsonResponse = {}; // Variable to store the JSON response
let globalurl = ""; // Variable to store the final URL
let globalMonthUrl = "";
let HTTP_INTERFACE_ADDRESS_NEW = "https://web.shinemonitor.com/public/";
let isDataLoaded = false;

// Login function
function login(usr, pwd) {
  // Hash the password using sha1 package
  globalPowSha1 = sha1(pwd); // SHA-1 hash of password
  console.log("Global Hashed created :", globalPowSha1);

  globalUsr = usr;
  console.log("Global user created :", usr);
}

// HTTP login function
async function http_login(usr, pwdSha1) {
  try {
    // Show loading indicator
    showLoadingState(true);
    
    var salt = new Date().getTime();
    var action =
      "&action=auth&usr=" +
      encodeURI(usr).replace("+", "%2B").replace("'", "%27") +
      "&company-key=bnrl_frRFjEz8Mkn";
    var sign = sha1(salt + pwdSha1 + action); // Use sha1 package instead of hex_sha1
    var url =
      "https://web.shinemonitor.com/public/" +
      "?sign=" +
      sign +
      "&salt=" +
      salt +
      action; // Example URL

    console.log("Generated URL: ", url); // Log the URL to the console

    // Make the HTTP request and get the response
    const response = await axios.get(url);

    // Store the JSON response
    globalJsonResponse = response.data;

    // Log the JSON response to the console
    console.log("Received JSON Response:", globalJsonResponse);
    getUrl();
  } catch (error) {
    console.error("Error fetching data:", error);
    // Show error to user
    showErrorMessage();
  }
}

function getUrl() {
  var flag = "";
  var callfront = "&callback=Khosa";
  var action =
    "&action=queryPlantCurrentData&plantid=" +
    "1286812" +
    "&par=ENERGY_TODAY,ENERGY_MONTH,ENERGY_YEAR,ENERGY_TOTAL,ENERGY_PROCEEDS,ENERGY_CO2,CURRENT_TEMP,CURRENT_RADIANT,BATTERY_SOC,ENERGY_COAL,ENERGY_SO2" +
    flag +
    "&i18n=en_US" +
    "&lang=en_US";
  var currUsr = globalJsonResponse.dat;
  var salt = new Date().getTime();

  var sign = sha1(salt + currUsr.secret + currUsr.token + action);
  var urlfinal =
    "https://web.shinemonitor.com/public/" +
    "?sign=" +
    sign +
    "&salt=" +
    salt +
    "&token=" +
    currUsr.token +
    action +
    callfront;

  globalurl = urlfinal;

  console.log("");
  console.log("2nd Generated URL: ", globalurl);
  monthTab();
}

function fetchData() {
  if (!globalurl) {
    console.error("globalurl is not set yet!");
    return;
  }

  showLoadingState(true);
  
  const script = document.createElement("script");
  script.src = globalurl; // Use the dynamically set globalurl
  console.log("Fetched Refreshed");
  document.body.appendChild(script);
}

function Khosa(data) {
  showLoadingState(false);
  
  try {
    const energyToday = parseFloat(
      data.dat.find((item) => item.key === "ENERGY_TODAY").val
    ).toFixed(1);
    const energyMonth = parseFloat(
      data.dat.find((item) => item.key === "ENERGY_MONTH").val
    ).toFixed(1);
    const energyTotal = parseFloat(
      data.dat.find((item) => item.key === "ENERGY_TOTAL").val
    ).toFixed(1);

    // Update the values and hide the spinners
    updateDataValue("energy-today", `${energyToday}`);
    updateDataValue("energy-month-1", `${energyToday}`);
    updateDataValue("energy-month", `${energyMonth}`);
    updateDataValue("energy-total", `${energyTotal}`);
    
    isDataLoaded = true;
  } catch (error) {
    console.error("Error processing data:", error);
    showErrorMessage();
  }
}

// Function to update a data value and hide its spinner
function updateDataValue(elementId, value) {
  const element = document.getElementById(elementId);
  
  // Remove any existing spinners
  const spinner = element.querySelector('.loading-spinner');
  if (spinner) {
    spinner.remove();
  }
  
  // Set the text value
  element.textContent = value;
}

function showLoadingState(isLoading) {
  if (isLoading && !isDataLoaded) {
    // Show spinners for each data element
    showSpinner("energy-month-1");
    showSpinner("energy-month");
    showSpinner("energy-total");
    
    // Optional: add visual loading indicators here
    const cards = document.querySelectorAll(".data-card, .data-card-2");
    cards.forEach(card => {
      card.style.opacity = "0.9";
    });
  } else if (!isLoading) {
    // Remove visual loading indicators
    const cards = document.querySelectorAll(".data-card, .data-card-2");
    cards.forEach(card => {
      card.style.opacity = "1";
    });
  }
}

// Function to show the spinner in a data element
function showSpinner(elementId) {
  const element = document.getElementById(elementId);
  
  // Clear any existing content
  element.innerHTML = '';
  
  // Create and append the spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  element.appendChild(spinner);
}

function showErrorMessage() {
  const errorMessage = "ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ";
  
  updateDataValue("energy-month-1", errorMessage);
  updateDataValue("energy-month", errorMessage);
  updateDataValue("energy-total", errorMessage);
  
  // Add a retry button or auto-retry
  setTimeout(() => {
    if (!isDataLoaded) {
      fetchData();
    }
  }, 5000);
}

function disableUserInteractions() {
  // document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
  // document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
  // document.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
  // document.addEventListener("keydown", (event) => event.preventDefault());
}

function monthTab() {
  PLANT_MONTH_STATE = false;
  let MAIN_CHOOSE_PLANT_ID = "";
  thisMonthData();

  function thisMonthData() {
    var d = new Date();
    THIS_MONTH = parseDate2yyyymm(d);
    var monthdate = parseDate2yyyymm(d);

    let MAIN_CHOOSE_PLANT_ID = "1286812";
    getMonthData(MAIN_CHOOSE_PLANT_ID, THIS_MONTH);
  }

  function getMonthData(MAIN_CHOOSE_PLANT_ID, date) {
    var monthUrl =
      "&action=queryPlantEnergyMonthPerDay&plantid=" +
      MAIN_CHOOSE_PLANT_ID +
      "&date=" +
      date;
    http_async_request_public(monthUrl);
  }
}

function http_async_request_public(action, onSuccess, onError) {
  action = action + "&i18n=en_US" + "&lang=en_US";

  var currUsr = globalJsonResponse.dat;

  var salt = new Date().getTime();
  var sign = sha1(
    salt +
      currUsr.secret +
      currUsr.token +
      action.replace(/#/g, "%23").replace(/'/g, "%27").replace(/ /g, "%20")
  );

  var url2 =
    HTTP_INTERFACE_ADDRESS_NEW +
    "?sign=" +
    sign +
    "&salt=" +
    salt +
    "&token=" +
    currUsr.token +
    action.replace(/#/g, "%23").replace(/'/g, "%27").replace(/ /g, "%20");

  globalMonthUrl = url2;
  console.log("");
  console.log("3rd Url", globalMonthUrl);
  fetchMonthData();
}

function parseDate2yyyymm(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  return y + "-" + (m < 10 ? "0" + m : m);
}

// Add vibration feedback for button presses if supported by the device
function vibrateOnTouch() {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // 50ms vibration for feedback
  }
}

// Handle network connection status
function handleConnectionStatus() {
  const updateConnectionStatus = () => {
    if (navigator.onLine) {
      console.log('Back online, refreshing data...');
      if (isDataLoaded === false) {
        fetchData();
      }
    } else {
      console.log('Offline');
      // Could show an offline message here
    }
  };
  
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

window.onload = async () => {

  document.getElementById("next-btn").style.color = "#e8f5e9";
  document.getElementById("next-btn-1").style.color = "#e8f5e9";
  document.getElementById("next-btn").style.opacity = "0";
  document.getElementById("next-btn-1").style.opacity = "0";


  // Setup initial loading state
  showLoadingState(true);
  
  // Initialize connection handling
  handleConnectionStatus();
  
  // Add touch feedback
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('touchstart', vibrateOnTouch);
  });
  
  // Call the login function first and then fetch data
  login("Khosa776", "stmyoB@86");
  await http_login(globalUsr, globalPowSha1); // Ensure http_login has run before fetching data
  
  // Update button appearance


  
  fetchData(); // Call fetchData after globalurl is set
  yearTab();
  
  // Periodically refresh data, but not too frequently to save battery
  setInterval(fetchData, 600000); // 10 minutes
};
