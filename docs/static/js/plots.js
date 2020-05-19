//Use a function to hold code to ensure responsivity
function makeResponsive() {
    //Create variable for SVG element's width and height
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;
    //Create variable for chart margins
    const margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };
    //Set chart dimensions
    const width = svgWidth - margin.right - margin.left;
    const height = svgHeight - margin.top - margin.bottom;
    //Append SVG element into div set aside for chart
    const svg = d3.select("#chart").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    //Read in csv data and create interactive scatterplot
    d3.csv("data/data.csv").then(healthData => {
        //Format data for math
        healthData.forEach(d => {
            d.poverty = +d.poverty;
            d.age = +d.age;
            d.income = +d.income;
            d.healthcare = +d.healthcare;
            d.obesity = +d.obesity;
            d.smokes = +d.smokes;
        });

        //Create Scales for Charts
        const xScale = d3.scaleLinear()
            .domain(d3.extent(healthData, d => d.poverty))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([height, 0]);

        //Create Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        //Draw Axes
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);
        svg.append("g")
            .call(yAxis);
        
        //Draw points for the graph
        const circleGroup = svg.selectAll("circle").data(healthData).enter()
            .append("circle")
            .attr("cx", d => xScale(d.poverty))
            .attr("cy", d => yScale(d.healthcare))
            .attr("r", 15)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "pink");
        //Create Data Labels for data Points
        const dataLabels = svg.selectAll("text").data(healthData).enter()
            .append("text")
            .attr("x", d => xScale(d.poverty) - 10)
            .attr("y", d => yScale(d.healthcare) + 5)
            .attr("width", 20)
            .text(d => d.abbr);
    });
}

//Call makeResponsive to draw initial graph
makeResponsive();