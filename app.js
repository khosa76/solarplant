// const sha1 = require('js-sha1');
// const axios = require('axios');

// Global variables to store the username, hashed password, and response
let globalUsr = '';
let globalPowSha1 = '';
let globalJsonResponse = {};  // Variable to store the JSON response
let globalurl = '';  // Variable to store the final URL

// Login function
function login(usr, pwd) {
    // Hash the password using sha1 package
    globalPowSha1 = sha1(pwd);  // SHA-1 hash of password
    console.log('Global Hashed created :', globalPowSha1);

    globalUsr = usr;
    console.log('Global user created :', usr);
}




// HTTP login function
async function http_login(usr, pwdSha1) {
    var salt = new Date().getTime();
    var action = "&action=auth&usr=" + encodeURI(usr).replace('+', '%2B').replace("'", '%27') + "&company-key=bnrl_frRFjEz8Mkn";
    var sign = sha1(salt + pwdSha1 + action);  // Use sha1 package instead of hex_sha1
    var url = "https://web.shinemonitor.com/public/" + "?sign=" + sign + "&salt=" + salt + action;  // Example URL

    console.log("Generated URL: ", url);  // Log the URL to the console

    try {
        // Make the HTTP request and get the response
        const response = await axios.get(url);

        // Store the JSON response
        globalJsonResponse = response.data;

        // Log the JSON response to the console
        console.log('Received JSON Response:', globalJsonResponse);
        getUrl();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function getUrl() {
    var flag = "";
    var callfront = "&callback=Khosa";
    var action = "&action=queryPlantCurrentData&plantid=" + "1286812" + "&par=ENERGY_TODAY,ENERGY_MONTH,ENERGY_YEAR,ENERGY_TOTAL,ENERGY_PROCEEDS,ENERGY_CO2,CURRENT_TEMP,CURRENT_RADIANT,BATTERY_SOC,ENERGY_COAL,ENERGY_SO2" + flag + "&i18n=en_US" + "&lang=en_US";
    var currUsr = globalJsonResponse.dat;
    var salt = new Date().getTime();

    var sign = sha1(salt + currUsr.secret + currUsr.token + action);
    var urlfinal = "https://web.shinemonitor.com/public/" + "?sign=" + sign + "&salt=" +
        salt + "&token=" + currUsr.token + action + callfront;

    globalurl = urlfinal;
    console.log("2nd Generated URL: ", globalurl);
}

function fetchData() {
    if (!globalurl) {
        console.error("globalurl is not set yet!");
        return;
    }

    const script = document.createElement("script");
    script.src = globalurl;  // Use the dynamically set globalurl
    document.body.appendChild(script);
}

function Khosa(data) {
    const energyToday = parseFloat(data.dat.find((item) => item.key === "ENERGY_TODAY").val).toFixed(1);
    const energyMonth = parseFloat(data.dat.find((item) => item.key === "ENERGY_MONTH").val).toFixed(1);
    const energyTotal = parseFloat(data.dat.find((item) => item.key === "ENERGY_TOTAL").val).toFixed(1);

    document.getElementById("energy-today").innerText = `${energyToday} kWh`;
    document.getElementById("energy-month").innerText = `${energyMonth} kWh`;
    document.getElementById("energy-total").innerText = `${energyTotal} kWh`;
}

function disableUserInteractions() {
    document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
    // document.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
    document.addEventListener("keydown", (event) => event.preventDefault());
}

window.onload = async () => {
    // Call the login function first and then fetch data
    login('Khosa776', 'stmyoB@86');
    await http_login(globalUsr, globalPowSha1);  // Ensure http_login has run before fetching data
    fetchData();  // Call fetchData after globalurl is set
    window.scrollTo(0, 1);
    disableUserInteractions();
    setInterval(fetchData, 300000);
};
