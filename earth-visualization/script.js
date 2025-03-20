// Earth Pulse Visualization using NASA EPIC API
// Replace YOUR_NASA_API_KEY with your actual NASA API key

// Global variables
let slider;
let earthImage = null;
let earthImages = [];  // Array to hold generated Earth images
let epicData = {};
let pulseTimer = 0;
let pulseSpeed = 0.8;
let maxPulse = 20;
let appStartYear = 2016; // Starting year for our visualization

// Create default Earth images
function preload() {
  // Instead of loading from NASA's servers directly, we'll create basic Earth images
  // to avoid CORS issues for the visualization
  
  // Create a basic Earth image programmatically
  function createEarthImage(baseColor, landColor, size) {
    // Create a temporary canvas with p5.js
    let tempCanvas = createGraphics(size, size);
    
    // Draw Earth background (ocean)
    tempCanvas.background(baseColor);
    
    // Draw some basic landmass shapes
    tempCanvas.fill(landColor);
    tempCanvas.noStroke();
    
    // North America
    tempCanvas.beginShape();
    tempCanvas.vertex(size*0.2, size*0.2);
    tempCanvas.vertex(size*0.4, size*0.2);
    tempCanvas.vertex(size*0.45, size*0.4);
    tempCanvas.vertex(size*0.3, size*0.5);
    tempCanvas.vertex(size*0.2, size*0.4);
    tempCanvas.endShape(CLOSE);
    
    // South America
    tempCanvas.beginShape();
    tempCanvas.vertex(size*0.35, size*0.5);
    tempCanvas.vertex(size*0.4, size*0.5);
    tempCanvas.vertex(size*0.38, size*0.7);
    tempCanvas.vertex(size*0.3, size*0.7);
    tempCanvas.endShape(CLOSE);
    
    // Europe/Africa
    tempCanvas.beginShape();
    tempCanvas.vertex(size*0.5, size*0.25);
    tempCanvas.vertex(size*0.6, size*0.2);
    tempCanvas.vertex(size*0.65, size*0.4);
    tempCanvas.vertex(size*0.6, size*0.6);
    tempCanvas.vertex(size*0.5, size*0.55);
    tempCanvas.vertex(size*0.45, size*0.4);
    tempCanvas.endShape(CLOSE);
    
    // Asia/Australia
    tempCanvas.beginShape();
    tempCanvas.vertex(size*0.6, size*0.3);
    tempCanvas.vertex(size*0.8, size*0.25);
    tempCanvas.vertex(size*0.85, size*0.4);
    tempCanvas.vertex(size*0.75, size*0.5);
    tempCanvas.vertex(size*0.65, size*0.45);
    tempCanvas.endShape(CLOSE);
    
    // Australia
    // tempCanvas.ellipse(size*0.8, size*0.65, size*0.15, size*0.1);
    
    // Create image from the canvas
    let img = tempCanvas.get();
    tempCanvas.remove();
    return img;
  }
  
  // Create different variations of Earth images
  const size = 540; // Size of our images
  
  // Base ocean and land colors for different variations
  const variations = [
    { ocean: color(0, 105, 148), land: color(34, 139, 34) },    // Standard blue/green
    { ocean: color(0, 90, 130),  land: color(150, 113, 23) },   // Beige land
    { ocean: color(25, 25, 112), land: color(46, 139, 87) },    // Dark blue/sea green
    { ocean: color(70, 130, 180), land: color(222, 184, 135) }, // Light blue/tan
    { ocean: color(0, 0, 128),   land: color(107, 142, 35) },   // Navy/olive
    { ocean: color(30, 144, 255), land: color(85, 107, 47) },   // Deep blue/dark olive
    { ocean: color(65, 105, 225), land: color(143, 188, 143) }, // Royal blue/light green
    { ocean: color(0, 119, 190), land: color(160, 82, 45) },    // Azure/sienna
    { ocean: color(100, 149, 237), land: color(189, 183, 107) }, // Cornflower/khaki
    { ocean: color(0, 128, 128), land: color(154, 205, 50) }    // Teal/yellow green
  ];
  
  // Generate Earth images for each variation
  for (let i = 0; i < 10; i++) {
    earthImages[i] = createEarthImage(
      variations[i].ocean, 
      variations[i].land, 
      size
    );
  }
}

function setup() {
  // Create canvas and append it to the container div
  let canvas = createCanvas(600, 600);
  canvas.parent('container');

  // Create slider to simulate years
  slider = createSlider(0, 9, 5, 1);  // Min: 0, Max: 9, Default: 5, Step: 1
  slider.position(10, height - 50);
  slider.style('width', '480px');  // Made slightly smaller to accommodate new button
  slider.parent('container');

  // Fetch the EPIC data initially
  fetchEpicData(slider.value());
  
  // Slider event listener to update data when slider is moved
  slider.input(() => {
    fetchEpicData(slider.value());
  });
  
  // Label to explain the slider's functionality
  let sliderLabel = createDiv('Slide to view Earth images from 2015-2024 via NASA EPIC API');
  sliderLabel.position(10, height - 80);
  sliderLabel.style('color', 'white');
  sliderLabel.style('font-size', '14px');
  sliderLabel.parent('container');
  
  // Add API attribution
  let attribution = createDiv('Data from NASA EPIC API (CO2 and temperature data simulated)');
  attribution.position(10, height - 30);
  attribution.style('color', 'white');
  attribution.style('font-size', '12px');
  attribution.parent('container');
  
  // Create Test API button
  let testButton = createButton('Test NASA API');
  testButton.position(360, height - 15);
  testButton.mousePressed(testNasaApi);
  testButton.style('background-color', '#0B3D91'); // NASA blue
  testButton.style('color', 'white');
  testButton.style('border', 'none');
  testButton.style('padding', '8px 16px');
  testButton.style('border-radius', '4px');
  testButton.style('cursor', 'pointer');
  testButton.parent('container');
  
  // Add "Show Current Images" button
  let showImagesButton = createButton('Show Current Images');
  showImagesButton.position(500, height - 50);
  showImagesButton.mousePressed(() => {
    // Get the year from the slider
    const year = appStartYear + slider.value();
    const month = "03"; // March 
    const day = "07";   // 7th
    const currentDate = `${year}-${month}-${day}`;
    
    // Check if date is in the future
    const today = new Date();
    const selectedDate = new Date(currentDate);
    
    if (selectedDate > today) {
      // Use a safer date for future dates
      showEpicImageGallery("2023-01-01");
    } else {
      showEpicImageGallery(currentDate);
    }
  });
  showImagesButton.style('background-color', '#4CAF50'); // Green
  showImagesButton.style('color', 'white');
  showImagesButton.style('border', 'none');
  showImagesButton.style('padding', '8px 16px');
  showImagesButton.style('border-radius', '4px');
  showImagesButton.style('cursor', 'pointer');
  showImagesButton.parent('container');
}

function draw() {
  background(0);  // Set black background

  // Adjust pulse speed based on environmental data
  let co2 = epicData.co2Level || 400;  // Default to 400 if no data
  let temp = epicData.temperature || 15;  // Default to 15°C if no data

  // Use CO2 and temperature data to map to pulse speed
  pulseSpeed = map(co2 + temp, 0, 1000, 0.4, 1.5);  // Adjust speed based on data

  pulseTimer += pulseSpeed * 0.05;  // Slow it down to mimic a real heartbeat

  // Earth pulsing effect based on the fetched image and pulse speed
  let pulseSize = sin(pulseTimer) * maxPulse;
  let earthSize = 300 + pulseSize;  // Pulsing effect based on size

  // Create a glow effect for the Earth
  drawEarthGlow(width/2, height/2, earthSize + 20, color(100, 150, 255, 50));

  // Display Earth image
  if (earthImage) {
    push();
    imageMode(CENTER);
    translate(width / 2, height / 2);
    
    // Add a subtle rotation based on the timer for a more dynamic effect
    rotate(pulseTimer * 0.02);
    
    image(earthImage, 0, 0, earthSize, earthSize);
    pop();
    
    // Display EPIC metadata if available
    if (epicData.date) {
      fill(255);
      textSize(14);
      textAlign(LEFT, TOP);
      text(`Image Date: ${epicData.formattedDate || epicData.date.substring(0, 10)}`, 10, 100);
      
      if (epicData.centroid_coordinates) {
        text(`Centroid: ${epicData.centroid_coordinates.lat.toFixed(2)}°, ${epicData.centroid_coordinates.lon.toFixed(2)}°`, 10, 120);
      }
    }
  } else {
    fill(28, 60, 100);  // Default color if image isn't loaded
    // ellipse(width / 2, height / 2, earthSize, earthSize);  // Draw Earth as a circle
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text("Loading Earth Image...", width / 2, height / 2);
  }

  // Create a semi-transparent overlay for data visualization
  fill(0, 0, 0, 100); // Semi-transparent black rectangle
  noStroke();
  rect(10, 10, width - 20, 70, 10); // Rounded rectangle for data display

  // Display CO2 and temperature data with nicer formatting
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`CO₂ Level: ${co2.toFixed(2)} ppm`, 20, 20);
  
  // Add visual indicator for CO2 levels
  const co2Width = map(co2, 400, 500, 100, 200);
  fill(map(co2, 400, 500, 0, 255), map(co2, 400, 500, 255, 0), 0);
  rect(180, 22, co2Width, 12, 5);
  
  text(`Temperature: ${temp.toFixed(2)}°C`, 20, 45);
  
  // Add visual indicator for temperature
  const tempWidth = map(temp, 14, 16, 100, 200);
  fill(map(temp, 14, 16, 0, 255), 0, map(temp, 14, 16, 255, 0));
  rect(180, 47, tempWidth, 12, 5);
  
  // Show the year based on slider value with larger text
  const year = appStartYear + slider.value();
  fill(255);
  textSize(24);
  textAlign(CENTER, TOP);
  text(`Earth in ${year}`, width / 2, 85);
  
  // Display pulsation speed in small text
  fill(180);
  textSize(12);
  text(`Heartbeat: ${pulseSpeed.toFixed(2)}`, width / 2, 115);
}

// Function to draw a glowing effect
function drawEarthGlow(x, y, size, glowColor) {
  push();
  noStroke();
  // Draw multiple expanding circles with decreasing opacity
  for (let i = 0; i < 5; i++) {
    const glowSize = size + i * 2;
    const opacity = map(i, 0, 5, 30, 0);
    fill(red(glowColor), green(glowColor), blue(glowColor), opacity);
    // ellipse(x, y, glowSize, glowSize);
  }
  pop();
}

// Function to display the NASA EPIC image gallery
function showEpicImageGallery(date) {
  // Create or update gallery display
  let galleryDiv = select('#epic-gallery');
  if (!galleryDiv) {
    galleryDiv = createDiv('');
    galleryDiv.id('epic-gallery');
    galleryDiv.position(50, 150);
    galleryDiv.style('background-color', 'rgba(0, 0, 0, 0.8)');
    galleryDiv.style('padding', '15px');
    galleryDiv.style('border-radius', '10px');
    galleryDiv.style('width', '500px');
    galleryDiv.style('max-height', '300px');
    galleryDiv.style('overflow-y', 'auto');
    galleryDiv.style('z-index', '10');
    galleryDiv.parent('container');
  }
  
  // Clear the gallery
  galleryDiv.html('<h3 style="color: white; text-align: center;">NASA EPIC Images</h3><div id="close-gallery" style="position: absolute; top: 10px; right: 15px; color: white; cursor: pointer; font-size: 20px;">×</div><div id="gallery-content" style="display: flex; flex-wrap: wrap; justify-content: center;"></div>');
  
  // Add close button functionality
  let closeButton = select('#close-gallery');
  closeButton.mousePressed(() => {
    galleryDiv.remove();
  });
  
  let galleryContent = select('#gallery-content');
  
  // Show loading indicator
  galleryContent.html('<p style="color: white; text-align: center;">Loading NASA EPIC images...</p>');
  
  // Use the proxy to get the API data
  const apiKey = "XVbWVugQF44fR70E1zijo79TcsrNJEP61Sx3EzWB";
  const url = `http://localhost:3000/epic-api?date=${date}&apiKey=${apiKey}`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        // Create links to each image
        let imagesHtml = `<p style="color: white; width: 100%; text-align: center;">${data.length} images available for ${date}</p>`;
        
        data.forEach((image, index) => {
          const dateStr = image.date.substring(0, 10);
          const dateParts = dateStr.split('-');
          const year = dateParts[0];
          const month = dateParts[1];
          const day = dateParts[2];
          
          // Use the proxy URL for the image
          const proxyImageUrl = `http://localhost:3000/epic-image?year=${year}&month=${month}&day=${day}&imageName=${image.image}`;
          
          // Add the image to the gallery
          // You can now actually display the images directly
          imagesHtml += `<div style="margin: 10px; text-align: center;">
                           <img src="${proxyImageUrl}" alt="EPIC image ${index + 1}" 
                                style="width: 150px; height: 150px; object-fit: cover; border: 2px solid #333;">
                           <div style="margin-top: 5px;">
                             Image #${index + 1}<br>
                             <small>Centroid: ${image.centroid_coordinates.lat.toFixed(2)}°, 
                                     ${image.centroid_coordinates.lon.toFixed(2)}°</small>
                           </div>
                         </div>`;
        });
        
        galleryContent.html(imagesHtml);
      } else {
        galleryContent.html('<p style="color: white; text-align: center;">No images found for this date.</p>');
      }
    })
    .catch(error => {
      galleryContent.html(`<p style="color: #F44336; text-align: center;">Error loading images: ${error.message}</p>`);
    });
}

// Add API testing function
function testNasaApi() {
  // Create or update status display
  let statusDiv = select('#api-status');
  if (!statusDiv) {
    statusDiv = createDiv('Testing NASA API connection...');
    statusDiv.id('api-status');
    statusDiv.position(10, 140);
    statusDiv.style('color', 'yellow');
    statusDiv.style('background-color', 'rgba(0, 0, 0, 0.5)');
    statusDiv.style('padding', '10px');
    statusDiv.style('border-radius', '5px');
    statusDiv.style('max-width', '580px');
    statusDiv.parent('container');
  } else {
    statusDiv.html('Testing NASA API connection...');
    statusDiv.style('color', 'yellow');
  }
  
  // Get a random date from the past few years that's likely to have EPIC data
  const randomYear = 2019 + floor(random(4)); // Random year between 2019-2022
  const randomMonth = floor(random(1, 13)).toString().padStart(2, '0');
  const randomDay = floor(random(1, 28)).toString().padStart(2, '0');
  const randomDate = `${randomYear}-${randomMonth}-${randomDay}`;
  
  const apiKey = "XVbWVugQF44fR70E1zijo79TcsrNJEP61Sx3EzWB";
  const url = `https://api.nasa.gov/EPIC/api/natural/date/${randomDate}?api_key=${apiKey}`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`NASA API returned status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        // Success - got data from the API
        statusDiv.html(`✅ API test successful!<br>
                      Connected to NASA EPIC API<br>
                      Retrieved ${data.length} images for ${randomDate}<br>
                      First image: ${data[0].identifier || data[0].image}`);
        statusDiv.style('color', '#4CAF50');
        
        // Display the date in the response to show real data
        const responseDate = data[0].date.substring(0, 10);
        statusDiv.html(statusDiv.html() + `<br>Image date: ${responseDate}`);
        
        // Add a button to view the images
        let viewImagesButton = createButton('View Images');
        viewImagesButton.position(10, 230);
        viewImagesButton.mousePressed(() => {
          viewImagesButton.remove(); // Remove the button after clicking
          showEpicImageGallery(responseDate);
        });
        viewImagesButton.style('background-color', '#4CAF50');
        viewImagesButton.style('color', 'white');
        viewImagesButton.style('border', 'none');
        viewImagesButton.style('padding', '8px 16px');
        viewImagesButton.style('border-radius', '4px');
        viewImagesButton.style('cursor', 'pointer');
        viewImagesButton.parent('container');
      } else {
        // Got a response but no data
        statusDiv.html(`⚠️ API connection successful, but no images found for ${randomDate}`);
        statusDiv.style('color', 'orange');
      }
      
      // Set a timer to fade out the message
      setTimeout(() => {
        statusDiv.style('opacity', '0.8');
        setTimeout(() => {
          statusDiv.style('opacity', '0.6');
          setTimeout(() => {
            statusDiv.style('opacity', '0.4');
            setTimeout(() => {
              statusDiv.style('opacity', '0.2');
              setTimeout(() => {
                statusDiv.remove();
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 5000);
    })
    .catch(error => {
      // Error connecting to the API
      statusDiv.html(`❌ API test failed: ${error.message}`);
      statusDiv.style('color', '#F44336');
    });
}

// Modify the fetchEpicData function to use the proxy
function fetchEpicData(sliderValue) {
  const apiKey = "XVbWVugQF44fR70E1zijo79TcsrNJEP61Sx3EzWB";
  const epicDate = getEpicDateFromSlider(sliderValue);
  
  // Use the proxy server to fetch EPIC API data
  const url = `http://localhost:3000/epic-api?date=${epicDate}&apiKey=${apiKey}`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        epicData = data[0];
        
        // Extract date parts for image URL construction
        const dateStr = epicData.date.substring(0, 10);
        const dateParts = dateStr.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        
        // Now load the image using the proxy
        const proxyImageUrl = `http://localhost:3000/epic-image?year=${year}&month=${month}&day=${day}&imageName=${epicData.image}`;
        
        loadImage(proxyImageUrl, img => {
          earthImage = img;  // Now we can use the actual NASA image!
        }, (err) => {
          console.error("Failed to load Earth image", err);
          // Fall back to our generated Earth images
          const yearIndex = int(sliderValue) % earthImages.length;
          earthImage = earthImages[yearIndex];
        });
        
        // Calculate environmental data based on year
        const selectedYear = appStartYear + sliderValue;
        epicData.co2Level = 400 + ((selectedYear - 2015) * 2.5);
        epicData.temperature = 14 + ((selectedYear - 2015) * 0.02);
        
        if (selectedYear > 2020) {
          epicData.temperature += (selectedYear - 2020) * 0.03;
        }
        
        epicData.formattedDate = dateStr;
      } else {
        console.log("No EPIC data available for this date");
        generateFallbackData(sliderValue);
      }
    })
    .catch(error => {
      console.error('Error fetching EPIC data:', error);
      generateFallbackData(sliderValue);
    });
}

function generateFallbackData(sliderValue) {
  // Generate fallback data if API call fails
  const selectedYear = appStartYear + sliderValue;
  
  epicData = {
    date: `${selectedYear}-03-07T00:00:00.000Z`,
    formattedDate: `${selectedYear}-03-07`,
    image: "fallback",
    centroid_coordinates: { lat: 0, lon: 0 },
    co2Level: 400 + ((selectedYear - 2015) * 2.5),
    temperature: 14 + ((selectedYear - 2015) * 0.02)
  };
  
  // Add extra temperature rise after 2020 to simulate accelerating climate change
  if (selectedYear > 2020) {
    epicData.temperature += (selectedYear - 2020) * 0.03;
  }
  
  // Use one of our generated Earth images
  const yearIndex = int(sliderValue) % earthImages.length;
  earthImage = earthImages[yearIndex];
}

function getEpicDateFromSlider(sliderValue) {
  // EPIC data is available from 2016 to present, but with some delay
  // Map slider 0-9 to years 2016-2025
  const baseYear = appStartYear; // Use appStartYear (2016) instead of hardcoded 2015
  const yearsToAdd = int(sliderValue);
  
  // Create a date object for the selected year
  const date = new Date();
  date.setFullYear(baseYear + yearsToAdd);
  
  // Set month and day to March 7 for consistency
  date.setMonth(2); // March (0-indexed)
  date.setDate(7);  // 7th day
  
  // If the date is in the future, use a safe past date
  const currentDate = new Date();
  
  if (date > currentDate) {
    // Use January 1, 2023 as a safe date that should have EPIC data
    return "2023-01-01";
  }
  
  // Format as YYYY-MM-DD
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}