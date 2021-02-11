/* * * * * * * * * * * * * *
 *          PieVis         *
 * * * * * * * * * * * * * */

class PieVis {
    constructor(parentElement, enrollData, statType) {
        this.parentElement = parentElement;
        this.enrollData = enrollData;
        this.displayData;
        this.statType= statType;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const width = 500;
        const height = 400;

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        
        // Pie layout
        vis.pie = d3.pie()
            .value(d=> d.visit)
            
        // Path generator for the pie segments
        vis.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(vis.width/3);
        
        // Group of pattern elements
        vis.patterng = vis.svg.append('g')
            .attr('transform', `translate(${vis.width/2}, ${vis.height/2})`);


        // Append tooltip
        vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip')
            .attr('style', "text-transform: capitalize;");
        
        // Y-title
        vis.svg.append("text")
            .attr("x", vis.width/2)
            .attr("y", 0)
            .attr("class", "y-title plot-title")
            .text(`${vis.statType} Enrollment`)
                
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
                
        [vis.enrollCount, vis.totalEnroll]= count(vis.enrollData)
                 
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let tmp = vis.patterng
            .selectAll('.pie-chart')
            .data(vis.pie(vis.enrollCount), d=>d.data.group);

        vis.circle = tmp.enter()
            .append('path')
            .merge(tmp);

        vis.circle
            .transition()
            .duration(1000)
            .attr('d', vis.arc)
            .attr('fill', d=> pieColors[d.data.group])
            .attr('class', 'pie-chart')
                
        tmp.exit().remove();
        
        vis.showTooltip();
        
        

    }

    showTooltip() {
        let vis = this;

        vis.circle
            .on('mouseover', function (event, d) {
                d3.select(this)
                .attr('stroke', 'black')
                .attr("stroke-dasharray", ("10,5"))
                .attr('stroke-width', '3px')

                vis.tooltip
                    .style('opacity', 1)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 20 + 'px').html(`
                 <div style="background: rgba(0, 0, 0, 0.8); color: #fff; border-radius: 2px; padding: 12px">
                     <h6>${d.data.group}</h6>
                     ${d3.format(',')(d.data.visit)} (${d3.format('.1%')(d.data.visit/vis.totalEnroll)})
                 </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                .attr('stroke-width', '0px')

                vis.tooltip.style('opacity', 0).style('left', 0).style('top', 0).html(``);
            });
    }
}


function count(enrollData) {
    
    let selectedSite = $('#site-name').val();
        
    // Filter by site
    let siteData = enrollData.filter(d=>d.site===selectedSite)
    
    // Date parser
    let parseDate = d3.timeParse("%m/%d/%Y");

    // Get input field values and filter
    let lower= document.getElementById("lower").value
    let upper= document.getElementById("upper").value  
    
    lower=lower?parseDate(lower).getTime():d3.min(siteData, d=>d.date)
    upper=upper?parseDate(upper).getTime():d3.max(siteData, d=>d.date)
    
    // Filter by date
    filteredData= siteData.filter(d => d.date>=lower && d.date<=upper)

    // console.log("Filtered data", filteredData);
    
    // Get unique ethnicities and their enrollments
    let enrollCount= {}
    
    // TODO combine the following two blocks into one
    races.forEach(r=> {
        filteredData.forEach(d=> {
            if ((d.race===r) && (Object.keys(enrollCount).indexOf(r)<0))
                enrollCount[r]= 0
            else if (d.race===r)
                enrollCount[r]+= 1
        })
    })
    
    enrollCountDict= []
    Object.keys(enrollCount).forEach(r=>enrollCountDict.push(
        {
            group: r,
            visit: enrollCount[r]
        }
    ))
    
    totalEnroll= Object.values(enrollCount).reduce((a, v) => a + v, 0)
    
    return [enrollCountDict, totalEnroll]
    
}


