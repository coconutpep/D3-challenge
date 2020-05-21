var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
//function used for updating y-scale on click
function yScale(healthData, chosenYAxis) {
    //create scales
    const yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d[chosenYAxis])])
        .range([height, 0]);
}
// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
//function used for updating yAxis upon axis label click
function renderYAxis(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    let xLabel;
    let yLabel;
  
    if (chosenXAxis === "poverty") {
        xLabel = "In Poverty (%):";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age (Median)";
    }
    else {
        xLabel = "Household Income (Median)";
    } 

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes (%)";
    }
    else {
        yLabel = "Obesity (%)";
    } 

    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.state}<hr>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", d => toolTip.show(d))
        // onmouseout event
        .on("mouseout", (d, index) => toolTip.hide(d));

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data/data.csv").then((healthData, err) => {
  if (err) throw err;

  // parse data
  healthData.forEach(d => {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.healthcare = +d.healthcare;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
  });

  // xLinearScale function above csv import
  const xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  const yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  const xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  const yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("stroke", "black")
    .attr("fill", "lightblue")
    .attr("opacity", ".5");

  // Create group x-axis labels
  const xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  const ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  const incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") //value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis labels
  const yLabelsGroup = chartGroup.append("g")
  .attr("transform", `rotate(-90) translate(${0 - margin.left}, ${0 - (height / 2)})`);

  const healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", `rotate(-90) translate(${0 - margin.left}, ${0 - (height / 2)})`)
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  const smokesLabel = yLabelsGroup.append("text")
    .attr("transform", `rotate(-90) translate(${0 - margin.left - 20}, ${0 - (height / 2)})`)
    .attr("y", 0 - margin.left - 20)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)");

  const obesityLabel = yLabelsGroup.append("text")
    .attr("transform", `rotate(-90) translate(${0 - margin.left - 40}, ${0 - (height / 2)})`)
    .attr("y", 0 - margin.left - 40)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hairData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
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
        else if (chosenXAxis === "age") {
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
        else{
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active",false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
      }
    });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(hairData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
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
        else if (chosenYAxis === "smokes") {
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
