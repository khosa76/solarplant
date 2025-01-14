// const sha1 = require('js-sha1');
// const axios = require('axios');

// Global variables to store the username, hashed password, and response
let globalUsr = "";
let globalPowSha1 = "";
let globalJsonResponse = {}; // Variable to store the JSON response
let globalurl = ""; // Variable to store the final URL
let globalMonthUrl = "";
let HTTP_INTERFACE_ADDRESS_NEW = "https://web.shinemonitor.com/public/";

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

  try {
    // Make the HTTP request and get the response
    const response = await axios.get(url);

    // Store the JSON response
    globalJsonResponse = response.data;

    // Log the JSON response to the console
    console.log("Received JSON Response:", globalJsonResponse);
    getUrl();
  } catch (error) {
    console.error("Error fetching data:", error);
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

  const script = document.createElement("script");
  script.src = globalurl; // Use the dynamically set globalurl
  console.log("Fetched Refreshed");
  document.body.appendChild(script);
}

function Khosa(data) {
  const energyToday = parseFloat(
    data.dat.find((item) => item.key === "ENERGY_TODAY").val
  ).toFixed(1);
  const energyMonth = parseFloat(
    data.dat.find((item) => item.key === "ENERGY_MONTH").val
  ).toFixed(1);
  const energyTotal = parseFloat(
    data.dat.find((item) => item.key === "ENERGY_TOTAL").val
  ).toFixed(1);

  document.getElementById("energy-today").innerText = `${energyToday} kWh`;
  document.getElementById("energy-month").innerText = `${energyMonth} kWh`;
  document.getElementById("energy-total").innerText = `${energyTotal} kWh`;
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
  // httpReplace(action)

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

function fetchMonthData() {
    axios
      .get(globalMonthUrl)
      .then((response) => {
        const data = response.data.dat.perday; // Array of daily data
        console.log("Original Data: ", data);
  
        // Get today's date as the index (1-based date, so subtract 1 for zero-based index)
        const today = new Date();
        const todayIndex = today.getDate() - 1; // Today's index in the array
        let currentIndex = todayIndex; // Start at today's index
  
        // Function to trim the timestamp (remove time part "00:00:00")
        const trimTimestamp = (timestamp) => {
          // Split the timestamp into date and time
          const datePart = timestamp.split(" ")[0];  // Extract "YYYY-MM-DD"
          const [year, month, day] = datePart.split("-");  // Split into [year, month, day]
          
          // Return the date in "dd-mm-yyyy" format
          return `${day}-${month}-${year}`;
      };
      


        const wholeMonth = (monthtamp) => {
          // Convert the input to a number
          const numberValue = parseFloat(monthtamp);
        
          if (!isNaN(numberValue)) {
            return numberValue.toFixed(1) + " kWh"; // Show only 1 decimal place and append " kWh"
          } else {
            console.error('Input must be a valid number');
            return null;  // Handle invalid input
          }
        };
        

        
        // Function to update the card display based on the current index
        function updateCard() {
          const card = document.getElementById("energy-month-1");
          const card1 = document.getElementById("data-label-1");
          
  
          const currentData = data[currentIndex]; // Get the data for the current index
          if (currentData) {
            if (currentIndex === todayIndex) {
              card1.innerText = "ਅੱਜ";  // Set text to "Today"
              document.getElementById("next-btn").style.color = "#e8f5e9";
              
          } else {
              card1.innerText = trimTimestamp(currentData.ts);  // Display trimmed timestamp normally
          }
  
          card.innerText = wholeMonth(currentData.val); // Display value
      } else {
          card.innerText = "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...";
          card1.innerText = "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...";
      }
  }
  
        // Initial display for today
        updateCard();
  
       // Event listener for going to the previous day
      document.getElementById("prev-btn").addEventListener("click", () => {
        if (currentIndex > 0) {
          document.getElementById("next-btn").style.display = "block";
          document.getElementById("next-btn").style.color = "#0073e6";
          currentIndex--; // Move to the previous index
          updateCard();
        }
      });

      // Event listener for going to the next day (only up to today's index)
      document.getElementById("next-btn").addEventListener("click", () => {
        if (currentIndex < todayIndex) {
          currentIndex++; // Move to the next index
          updateCard();
        }else {
            document.getElementById("next-btn").style.display = "block";
            document.getElementById("next-btn").style.color = "#e8f5e9";
        
        }
      });

     


      



    })

    
    .catch((error) => {
      console.error("Error fetching the data:", error); 
    });
}





  

window.onload = async () => {
  // Call the login function first and then fetch data
  login("Khosa776", "stmyoB@86");
  await http_login(globalUsr, globalPowSha1); // Ensure http_login has run before fetching data
  // document.getElementById("next-btn").style.display = "block";
  document.getElementById("next-btn").style.color = "#e8f5e9";
  

  fetchData(); // Call fetchData after globalurl is set
  window.scrollTo(0, 1);
  disableUserInteractions();
  setInterval(fetchData, 300000);
};
