/* * * * * * * * * * * * * *
 *          LineVis         *
 * * * * * * * * * * * * * */

class LineVis {
    constructor(parentElement, enrollData, expectedData) {
        this.parentElement = parentElement;
        this.enrollData = enrollData;
        this.expectedData = expectedData;
        this.displayData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const width = 1000;
        const height = 600;

        vis.margin = { top: 30, right: 20, bottom: 40, left: 90 };
        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(0, ${vis.margin.top})`);

        // Scales and Axes
        vis.x = d3.scaleBand().range([vis.margin.left, vis.width]).paddingInner(0.1);
        vis.xAxis = d3.axisBottom();

        vis.y = d3.scaleLinear().range([vis.height, 0]);
        vis.yAxis = d3.axisLeft().ticks(8);

        vis.gx = vis.svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.height + 15})`);

        vis.gy = vis.svg
            .append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(${vis.margin.left}, 0)`);

        vis.gy.append('text').attr('y', -15).attr('class', 'title y-title');

        // Group of pattern elements
        vis.patterng = vis.svg.append('g');


        // Append tooltip
        vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip')
            .attr('style', "text-transform: capitalize;");
        
                
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        let tmp, enrollCount, totalEnroll, enrollCount1, totalEnroll1
        
        tmp= count(vis.enrollData)
        enrollCount= tmp[0]
        totalEnroll= tmp[1]
        
        tmp= count(vis.expectedData)
        enrollCount1= tmp[0]
        totalEnroll1= tmp[1]
        
        
        vis.x.domain(enrollCount.map(d=>d.group));
        vis.xAxis.scale(vis.x);
        vis.gx.transition().duration(1000).call(vis.xAxis);

        vis.y.domain([0, d3.max([enrollCount.map(d=>d.visit), enrollCount1.map(d=>d.visit)].flat())]);
        
        vis.yAxis.scale(vis.y);
        vis.gy.transition().duration(1000).call(vis.yAxis);      
        
        vis.statType='Actual'
        vis.enrollCount= enrollCount
        vis.totalEnroll= totalEnroll
        vis.elementColor= sharedRed
        vis.rectOffset= 0;
        vis.updateVis();
        
        vis.statType='Expected'
        vis.enrollCount= enrollCount1
        vis.totalEnroll= totalEnroll1
        vis.elementColor= sharedBlue
        vis.rectOffset= vis.x.bandwidth()/2;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.patterng.attr('transform', `translate(${vis.x.bandwidth() / 2},0)`);
        
        // Actual
        let tmp = vis.patterng
            .selectAll(`.${vis.statType}`)
            .data(vis.enrollCount, d => d.group);

        vis.circle = tmp.enter()
            .append('rect')
            .merge(tmp);

        vis.circle
            .transition()
            .duration(1000)
            .attr('x', d=> vis.x(d.group)+vis.rectOffset-vis.x.bandwidth()/2)
            .attr('y', d=> vis.y(d.visit))
            .attr('width', vis.x.bandwidth()/2)
            .attr('height', d=> vis.height-vis.y(d.visit))
            .attr('class', `point ${vis.statType}`)
            .attr('fill', vis.elementColor);
        
        tmp.exit().remove();
        
        vis.showTooltip(vis.statType, vis.elementColor);
        

    }

    showTooltip(type, color) {
        let vis = this;

        vis.circle
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', sharedYellow);

                vis.tooltip
                    .style('opacity', 1)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 20 + 'px').html(`
                 <div style="background: rgba(0, 0, 0, 0.8); color: #fff; border-radius: 2px; padding: 12px">
                     <h6>${d.group}</h6>
                     ${type} ${d3.format(',')(d.visit)} (${d3.format('.1%')(d.visit/vis.totalEnroll)})
                 </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('fill', color);

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

    console.log("Filtered data", filteredData);
    
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

