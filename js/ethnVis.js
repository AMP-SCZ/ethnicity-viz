/* * * * * * * * * * * * * *
 *          LineVis         *
 * * * * * * * * * * * * * */

class LineVis {
    constructor(parentElement, enrollData) {
        this.parentElement = parentElement;
        this.enrollData = enrollData;
        // this.expectedData = expectedData;
        this.displayData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const width = 1000;
        const height = 275;

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
        vis.x = d3.scaleBand().range([vis.margin.left, vis.width]);
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
        

        // Path
        vis.path = vis.patterng.append('path').attr('class', 'path');


        // Draw path
        vis.trend = d3
            .line()
            .curve(d3.curveCardinal)
            .y((d) => vis.y(d.visit));

        // Append tooltip
        vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip')
            .attr('style', "text-transform: capitalize;");
        
                
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // Date parser
        let parseDate = d3.timeParse("%m/%d/%Y");
        
        let selectedSite = $('#site-name').val();
                
        // Filter by site
        let siteData = vis.enrollData.filter(d=>d.site===selectedSite)
        
        // Get input field values and filter
        let lower= document.getElementById("lower").value
        let upper= document.getElementById("upper").value
        
        lower=lower?parseDate(lower).getTime():d3.min(siteData, d=>d.date)
        upper=upper?parseDate(upper).getTime():d3.max(siteData, d=>d.date)
        
        // Filter by date
        vis.filteredData= siteData.filter(d => d.date>=lower && d.date<=upper)

        console.log("Filtered data", vis.filteredData);
        
        // Get unique ethnicities and their enrollments
        let enrollCount= {}
        
        // TODO combine the following two blocks into one
        races.forEach(r=> {
            vis.filteredData.forEach(d=> {
                if ((d.race===r) && (Object.keys(enrollCount).indexOf(r)<0))
                    enrollCount[r]= 0
                else if (d.race===r)
                    enrollCount[r]+= 1
            })
        })
        
        vis.enrollCount= []
        Object.keys(enrollCount).forEach(r=>vis.enrollCount.push(
            {
                group: r,
                visit: enrollCount[r]
            }
        ))
        
        vis.totalEnroll= Object.values(enrollCount).reduce((a, v) => a + v, 0)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.x.domain(vis.enrollCount.map(d=>d.group));
        vis.xAxis.scale(vis.x);
        vis.gx.transition().duration(1000).call(vis.xAxis);

        vis.y.domain([0, d3.max(vis.enrollCount.map(d=>d.visit))]);
        vis.yAxis.scale(vis.y);
        vis.gy.transition().duration(1000).call(vis.yAxis);

        vis.trend.x(d => vis.x(d.group));

        vis.patterng.attr('transform', `translate(${vis.x.bandwidth() / 2},0)`);

        let tmp = vis.patterng
            .selectAll('.numVisit')
            .data(vis.enrollCount, d => d.group);

        let circle = tmp.enter()
            .append('circle')
            .merge(tmp);

        circle
            .transition()
            .duration(1000)
            .attr('cx', (d) => vis.x(d.group))
            .attr('cy', (d) => vis.y(d.visit))
            .attr('class', 'point numVisit')
            .attr('fill', sharedBlue);
        
        tmp.exit().remove();
        
        // Tooltip for actual enrollment
        vis.showTooltip(circle, sharedBlue, "Actual");

        vis.path
            .datum(vis.enrollCount)
            .transition()
            .duration(1000)
            .attr('d', vis.trend)
            .attr('stroke', 'black')
            .attr('fill', 'none');


    }

    showTooltip(circle, color, type) {
        let vis = this;

        circle
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', sharedYellow);

                vis.tooltip
                    .style('opacity', 1)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 20 + 'px').html(`
                 <div style="background: rgba(0, 0, 0, 0.8); color: #fff; border-radius: 2px; padding: 12px">
                     <h6>${d.group}</h6>
                     ${type} enrollment ${d3.format(',')(d.visit)} (${d3.format('.1%')(d.visit/vis.totalEnroll)})
                 </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('fill', color);

                vis.tooltip.style('opacity', 0).style('left', 0).style('top', 0).html(``);
            });
    }
}

