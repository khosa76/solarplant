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
      // Show loading state for the daily card
      showSpinner("energy-month-1");
      
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
            
            // Map month number to month name
            const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthName = monthNames[parseInt(month)];
            
            // Return the date in "DD Month" format
            return `${parseInt(day)} ${monthName}`;
        };
        
        const wholeMonth = (monthtamp) => {
          // Convert the input to a number
          const numberValue = parseFloat(monthtamp);
        
          if (!isNaN(numberValue)) {
            return numberValue.toFixed(1); // Show only 1 decimal place and append " kWh"
          } else {
            console.error('Input must be a valid number');
            return "0.0 kWh";  // Handle invalid input with a default value
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
              document.getElementById("next-btn").setAttribute("disabled", "true");
              document.getElementById("next-btn").style.opacity = "0";
            } else {
              card1.innerText = trimTimestamp(currentData.ts);  // Display trimmed timestamp normally
              document.getElementById("next-btn").removeAttribute("disabled");
              document.getElementById("next-btn").style.color = "#0073e6";
              document.getElementById("next-btn").style.opacity = "1";
            }
    
            updateDataValue("energy-month-1", wholeMonth(currentData.val)); // Display value
            
            // Disable prev button if we're at the first day of the month
            if (currentIndex === 0) {
              document.getElementById("prev-btn").setAttribute("disabled", "true");
              document.getElementById("prev-btn").style.color = "#e8f5e9";
              document.getElementById("prev-btn").style.opacity = "0";
            } else {
              document.getElementById("prev-btn").removeAttribute("disabled");
              document.getElementById("prev-btn").style.color = "#0073e6";
              document.getElementById("prev-btn").style.opacity = "1";
            }
          } else {
            updateDataValue("energy-month-1", "0.0 kWh");
            card1.innerText = "ਡਾਟਾ ਨਹੀਂ ਹੈ";
          }
      }
    
        // Initial display for today
        updateCard();
    
       // Event listener for going to the previous day
      document.getElementById("prev-btn").addEventListener("click", function(e) {
        e.preventDefault(); // Prevent default button behavior
        
        // Add haptic feedback if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        if (currentIndex > 0) {
          document.getElementById("next-btn").style.display = "block";
          currentIndex--; // Move to the previous index
          updateCard();
        }
      });

      // Event listener for going to the next day (only up to today's index)
      document.getElementById("next-btn").addEventListener("click", function(e) {
        e.preventDefault(); // Prevent default button behavior
        
        // Add haptic feedback if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        if (currentIndex < todayIndex) {
          currentIndex++; // Move to the next index
          updateCard();
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching the data:", error); 
      // Show error state
      updateDataValue("energy-month-1", "ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋਇਆ");
    });
  }
  
