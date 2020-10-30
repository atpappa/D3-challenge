// svg height and width
var svgWidth = 800;
var svgHeight = 500;

// Margin
var margin = {
    top:20,
    right: 40,
    bottom: 100,
    left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// SVG Wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Appending the SVG group to chartGroup
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Show x and y axis
var chosenXAxis = 'poverty';
var chosenYAxis = 'obesity';

// Update x-scale var for axis label click
function xScale(cData, chosenXAxis) {
    // make scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(cData, d => d[chosenXAxis]) * 0.9,
            d3.max(cData, d => d[chosenXAxis]) * 1.1])
        .range([0, width]);
    return xLinearScale;
}

// Update y-scale var for axis label click
function yScale(cData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(cData, d => d[chosenYAxis]) * 0.9,
            d3.max(cData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);
    return yLinearScale;
}

// updating x and y axis
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function to render the circles
function renderCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Rendering text
function renderText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
    textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
    

  return textGroup;
}

// Updating the circles group with new tool tip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var toolTip = d3.tip()
        .attr("class", "toolTip")
        .offset([80, -60])
        .html(function(d) {
            if (chosenXAxis === "income") {
                return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} USD<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
            }
            else if (chosenXAxis === "age") {
                return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`);
            }
            else {
                return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>${chosenYAxis}: ${d[chosenYAxis]}%`);
            }
            });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
    })
    .on("mouseout", function(d, index) {
        toolTip.hide(d);
    });
    return circlesGroup;
}

// RETRIEVE DATA
d3.csv("static/data/data.csv").then(function(cData) {
    // PARSE DATA/turn strings into integers
    cData.forEach(function(data) {
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.poverty = +data.poverty;
        data.abbr = data.abbr;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare;
    });
    console.log(cData);

    // LinearScales
    var xLinearScale = xScale(cData, chosenXAxis);
    var yLinearScale = yScale(cData, chosenYAxis);

    // Axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // Append yaxis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Append circles/text
    var circlesGroup = chartGroup.selectAll("circle")
        .data(cData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "lightgreen")
        .attr("opacity", ".6");

    var textGroup = chartGroup.selectAll("text")
        .exit()
        .data(cData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("dy", 3);
    

    // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("class","axis-text-x")
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("class","axis-text-x")
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");      

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("class","axis-text-x")
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Income (Median)");
    
    // yaxis labels
    var yLabelsGroup = chartGroup.append("g");

    var healthCareLabel = yLabelsGroup.append("text")
        .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
        .attr("dy", "1em")
        .attr("class","axis-text-y")
        .classed("axis-text", true)
        .attr("value", "healthcare") 
        .text("Lack of Healthcare (%)");   

    var smokerLabel = yLabelsGroup.append("text")
        .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
        .attr("dy", "1em")
        .attr("class","axis-text-y")
        .attr("value", "smokes") 
        .classed("inactive", true)
        .text("Smokes (%)");       

    var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
        .attr("dy", "1em")
        .attr("class","axis-text-y")
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Obesity (%)");

    // x axis labels event listener
    xLabelsGroup.selectAll(".axis-text-x")
        .on("click", function() {
            // Get value of selection
            var value = d3.select(this).attr("value");
            if (value !==chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(cData, chosenXAxis);
                // updates y scale for new data
                yLinearScale = yScale(cData, chosenYAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // update text
                textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // update tooltip
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // BOLD TEXT
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);   
                }
                else if (chosenXAxis === "poverty")
                    {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
            }
        });

    // yaxis labels event listener
    yLabelsGroup.selectAll(".axis-text-y")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replaces chosenYAxis with value
                chosenYAxis = value;

                // update x scale for new data
                xLinearScale = xScale(cData, chosenXAxis);
                // update y scale for new data
                yLinearScale = yScale(cData, chosenYAxis);
                // update y with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // update text
                textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
                // update tool tips again
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenYAxis === "healthcare") {
                    healthCareLabel
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
                healthCareLabel
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
                healthCareLabel
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
});
