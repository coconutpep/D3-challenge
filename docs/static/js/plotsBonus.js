//Set svg height and width to window height and width
const svgWidth = window.innerWidth;
const svgHeight = window.innerHeight;

//Set chart margins
const margin = {
    top: 50,
    right: 40,
    bottom: 80,
    left: 100
};

//Set chart height and width
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

//Create SVG wrapper 
const svg = d3.select("#chart").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Append svg group to hold chart
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); //Shift chart by margins

//Initial Paramaters
let chosenX = "poverty";
let chosenY = "healthcare";

//Function for updating the xScale
function xScale(healthData, chosenX) {
    //Create Scale
    const xLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d[chosenX]))
        .range([0, width]);
    
    return xLinearScale;
}

//Function for updating the yScale
function yScale(healthData, chosenY) {
    //Create Scale
    const yLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d[chosenY]))
        .range([height, 0]);

    return yLinearScale;
}

//Function for rendering x-axis
function renderX(newXScale, xAxis) {
    //Create axis from new scale
    const bottomAxis = d3.axisBottom(newXScale);

    //Transition the x-axis
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

//Function for rendering y-axis
function renderY(newYScale, yAxis) {
    //Create axis from new scale
    const leftAxis = d3.axisLeft(newYScale);

    //Transition y-axis
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function for updating circle group
function renderCircles(circlesGroup, labelsGroup, newXScale, newYScale, chosenX, chosenY) {
    //Transition circles
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenX]))
        .attr("cy", d => newYScale(d[chosenY]));

    //Transition labels
    labelsGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenX]))
        .attr("y", d => newYScale(d[chosenY]));

    return circlesGroup;
}

//Function for updating circle group tool tips
function updateToolTips(circlesGroup, chosenX, chosenY) {
    //Set empty labels
    let xLabel;
    let yLabel;
    
    //Switch statement to change x labels
    if (chosenX === "poverty") {
        xLabel = "% Poverty:";
    }
    else if (chosenX === "age") {
        xLabel = "Age (Median)";
    }
    else if (chosenX === "income") {
        xLabel = "Household Income (Median)";
    }

    //Switch statement to change y labels
    if (chosenY === "healthcare") {
        yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenY === "smokes") {
        yLabel = "Smokes (%)";
    }
    else if (chosenY === "obesity") {
        yLabel = "Obesity (%)";
    }

    //Create tooltips
    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(d => `${d.state}<hr>${xLabel} ${d[chosenX]}<br>${yLabel} ${d[chosenY]}`);

    //Create tooltips on circle group
    circlesGroup.call(toolTip);

    //Create event handlers to show/hide tooltips
    circlesGroup.on("mouseover", d => toolTip.show(d))
        .on("mouseout", d => toolTip.hide(d));

    return circlesGroup;
}

//Retrieve csv data to create chart
d3.csv("data/data.csv").then((healthData, err) => {
    //Throw any errors
    if (err) throw err;

    //Parse the data
    healthData.forEach(d => {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    });
    console.log(healthData);
    //Scale functions call
    let xLinearScale = xScale(healthData, chosenX);
    let yLinearScale = yScale(healthData, chosenY);

    //Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    //Append axes
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //Append Circles for datapoints
    let circlesGroup = chartGroup.selectAll("circle").data(healthData).enter()
        .append("circle")
        .attr("cx", xScale(healthData, d => d[chosenX]))
        .attr("cy", yScale(healthData, d => d[chosenY]))
        .attr("r", 15)
        .attr("stroke", "black")
        .attr("fill", "lightblue")
        .attr("opacity", .75);

    //Append labels for circles
    let labelsGroup = chartGroup.selectAll(".data-label").data(healthData).enter()
        .append("text")
        .attr("x", xScale(healthData, d => d[chosenX]))
        .attr("y", yScale(healthData, d => d[chosenY]))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("stroke", "black")
        .text(d => d.abbr);
    
    //Draw initial chart
    circlesGroup = renderCircles(circlesGroup, labelsGroup, xLinearScale, yLinearScale, chosenX, chosenY);

    //Create group for x-axis labels
    const xAxisLabels = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    //Create group for y-axis labels
    const yAxisLabels = chartGroup.append("g")
        .attr("transform", `rotate(-90) translate(0, ${0 + (margin.left / 2)})`);

    //Create labels for x-axis
    const povertyLabel = xAxisLabels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty (%)");
    const ageLabel = xAxisLabels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");
    const incomeLabel = xAxisLabels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
    //Create labels for y-axis
    const healthcareLabel = yAxisLabels.append("text")
        .attr("x", 0 - (height / 2) - 40)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    const smokesLabel = yAxisLabels.append("text")
        .attr("x", 0 - (height / 2) - 20)
        .attr("y", 0 - margin.left - 20)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");
    const obesityLabel = yAxisLabels.append("text")
        .attr("x", 0 - (height / 2) - 20)
        .attr("y", 0 - margin.left - 40)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity (%)");

    //Update Tool tips
    let tipGroup = updateToolTips(circlesGroup, chosenX, chosenY);

    //x-axis event listeners
    xAxisLabels.selectAll("text")
        .on("click", function() {
            //Get value of selection
            const xValue = d3.select(this).attr("value");
            //Conditional statement to change chart when new axis is selected
            if (xValue !== chosenX) {
                //Replace chosenX with selected value
                chosenX = xValue;
                //update xScale for new value
                xLinearScale = xScale(healthData, chosenX);
                //Transition x-axis
                xAxis = renderX(xLinearScale, xAxis);
                //Update Circles
                circlesGroup = renderCircles(circlesGroup, labelsGroup, xLinearScale, yLinearScale, chosenX, chosenY);
                //Update ToolTips
                tipGroup = updateToolTips(circlesGroup, chosenX, chosenY);
                //Conditional statement to change axis formatting
                if (chosenX === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenX ==="age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    //y-axis event listeners
    yAxisLabels.selectAll("text")
    .on("click", function() {
        //Get value of selection
        const yValue = d3.select(this).attr("value");
        //Conditional statement to change chart when new axis is selected
        if (yValue !== chosenY) {
            //Replace chosenX with selected value
            chosenY = yValue;
            //update xScale for new value
            yLinearScale = yScale(healthData, chosenY);
            //Transition x-axis
            yAxis = renderY(yLinearScale, yAxis);
            //Update Circles
            circlesGroup = renderCircles(circlesGroup, labelsGroup, xLinearScale, yLinearScale, chosenX, chosenY);
            //Update ToolTips
            tipGroup = updateToolTips(circlesGroup, chosenX, chosenY);
            //Conditional statement to change axis formatting
            if (chosenY === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenY === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
}).catch(function(error) {
    console.log(error);
});