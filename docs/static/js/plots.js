//Create variable for SVG element's width and height
const svgWidth = window.width * (2/3);
const svgHeight = window.height * (1/3);
//Create variable for chart margins
const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
};
//Append SVG element into div set aside for chart
const svg = d3.select("#chart").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Read in csv data and create interactive scatterplot
d3.csv("data/data.csv").then(healthData => {
    
});