function yearTab() {
    PLANT_MONTH_STATE = false;
    let MAIN_CHOOSE_PLANT_ID = "1286812";
    let allData = [];  // To store all the combined data

    thisYearData();

    function thisYearData() {
        var y = new Date();
        const THIS_YEAR = y.getFullYear();

        // Generate an array of years from THIS_YEAR to 2024
        const years = [];
        for (let year = THIS_YEAR; year >= 2024; year--) {
            years.push(year);
        }

        // Iterate over the years array and call getYearData for each year
        years.forEach((year) => {
            getYearData(MAIN_CHOOSE_PLANT_ID, year);
        });
    }

    function getYearData(MAIN_CHOOSE_PLANT_ID, year) {
        var yearUrl =
            "&action=queryPlantEnergyYearPerMonth&plantid=" +
            MAIN_CHOOSE_PLANT_ID +
            "&date=" +
            year;

        console.log("Processing year:", year);

        http_async_request_public_1(yearUrl, year);
    }

    function http_async_request_public_1(action, year) {
        action = action + "&year=" + year + "&i18n=en_US&lang=en_US";

        var currUsr = globalJsonResponse.dat;

        // Generate a salt and sign the request
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

        // Log the generated URL for debugging
        console.log("Generated URL:", globalMonthUrl);

        fetchYearData(year); // Pass the year to fetchYearData
    }

    function fetchYearData(year) {
        // Show loading state if data not yet loaded
        showSpinner("energy-month");
        
        axios
            .get(globalMonthUrl)
            .then((response) => {
                const data = response.data.dat.permonth; // Fetch per-month data
                console.log("Monthly Data for year " + year + ": ", data);

                // Combine this year's data with the global allData array
                allData = allData.concat(data);
                console.log("Current allData after fetching year " + year + ":", allData);

                // Once all data for all years is fetched, sort it by timestamp
                if (allData.length === (new Date().getFullYear() - 2024 + 1) * 12) {
                    // All data has been fetched for all years (12 months per year)
                    allData.sort((a, b) => new Date(a.ts) - new Date(b.ts)); // Sort chronologically
                    
                    // Now set the starting index to the present month
                    let initialIndex = setInitialIndex(); // Get the initial index of the present month

                    updateMonthlyCards(initialIndex); // Pass the initialIndex to updateMonthlyCards
                }
            })
            .catch((error) => {
                console.error("Error fetching the data:", error);
                // Show error state
                updateDataValue("energy-month", "ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋਇਆ");
            });
    }

    function setInitialIndex() {
        const currentMonth = new Date(); // Current date
        const currentYear = currentMonth.getFullYear(); // Get current year
        const currentMonthIndex = currentMonth.getMonth(); // Get current month (0 = January, 11 = December)
      
        // Iterate through allData to find the index of the current month
        let initialIndex = -1;
        for (let i = 0; i < allData.length; i++) {
          const dataMonth = new Date(allData[i].ts);
          const dataYear = dataMonth.getFullYear();
          const dataMonthIndex = dataMonth.getMonth();
      
          // Check if the year and month match the current date
          if (dataYear === currentYear && dataMonthIndex === currentMonthIndex) {
            initialIndex = i; // Store the index where current month is found
            break; // Exit the loop as we've found the current month
          }
        }
      
        console.log("Initial index of current month:", initialIndex);
        return initialIndex;
    }

    function updateMonthlyCards(initialIndex) {
        const card = document.getElementById("energy-month");
        const cardLabel = document.getElementById("data-label-2");

        let currentIndex1 = initialIndex; // Set the initial index to the present month
        const october2024 = new Date("2024-10-01");

        // Function to update the display for the current month
        const updateCard = () => {
            const card2 = document.getElementById("data-label-2");
            const currentData = allData[currentIndex1]; // Get data for the current month
            
            if (currentData) {
                cardLabel.innerText = trimTimestamp(currentData.ts); // Update date label
                updateDataValue("energy-month", formatEnergy(currentData.val)); // Update energy value
            } else {
                cardLabel.innerText = "ਡਾਟਾ ਨਹੀਂ ਹੈ"; // No data text
                updateDataValue("energy-month", "0.0 kWh");
            }

            // Disable the "Previous" button if the date reaches October 2024
            const currentMonthDate = new Date(currentData.ts);
            if (currentMonthDate <= october2024) {
                document.getElementById("prev-btn-1").setAttribute("disabled", "true");
                document.getElementById("prev-btn-1").style.color = "#e8f5e9";
                document.getElementById("prev-btn-1").style.opacity = "0";
            } else {
                document.getElementById("prev-btn-1").removeAttribute("disabled");
                document.getElementById("prev-btn-1").style.color = "#0073e6";
                document.getElementById("prev-btn-1").style.opacity = "1";
            }

            // Disable the "Next" button if we are at the latest month
            const currentDate = new Date(); // Get today's date
            const currentMonth = currentDate.getMonth(); // Get current month (0 = January, 11 = December)
            const currentYear = currentDate.getFullYear(); // Get current year

            const currentDataMonth = new Date(currentData.ts); // Parse current data timestamp
            const currentDataMonthIndex = currentDataMonth.getMonth();
            const currentDataYear = currentDataMonth.getFullYear();

            // Disable the "Next" button if the current data's month is the same as the current month
            if (currentDataYear === currentYear && currentDataMonthIndex === currentMonth) {
                card2.innerText = "ਮਹੀਨਾ";  // Set text to "Month"
                document.getElementById("next-btn-1").setAttribute("disabled", "true");
                document.getElementById("next-btn-1").style.color = "#e8f5e9";
                document.getElementById("next-btn-1").style.opacity = "0";
            } else {
                document.getElementById("next-btn-1").removeAttribute("disabled");
                document.getElementById("next-btn-1").style.color = "#0073e6";
                document.getElementById("next-btn-1").style.opacity = "1";
            }
        };

        // Initial display for the first month
        updateCard();

        // Previous button handler with haptic feedback
        document.getElementById("prev-btn-1").addEventListener("click", function(e) {
            e.preventDefault(); // Prevent default button behavior
            
            // Add haptic feedback if supported
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            
            if (currentIndex1 > 0) {
                currentIndex1--; // Move to the previous month
                updateCard();
            }
        });

        // Next button handler with haptic feedback
        document.getElementById("next-btn-1").addEventListener("click", function(e) {
            e.preventDefault(); // Prevent default button behavior
            
            // Add haptic feedback if supported
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            
            if (currentIndex1 < allData.length - 1) {
                currentIndex1++; // Move to the next month
                updateCard();
            }
        });
    }

    // Function to trim the timestamp to display month name and year
    const trimTimestamp = (timestamp) => {
        const [year, month] = timestamp.split(" ")[0].split("-"); // Extract year and month
        
        // Map month number to month name with full month names
        const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[parseInt(month)];
        
        return `${monthName} ${year}`; // Format as "Month YYYY"
    };

    // Function to format energy value (1 decimal place + "kWh")
    const formatEnergy = (value) => {
        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
            return numberValue.toFixed(1);
        }
        return "0.0 kWh"; // Default value instead of N/A
    };
}
