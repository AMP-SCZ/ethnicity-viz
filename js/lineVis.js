/* * * * * * * * * * * * * *
 *          Lineis         *
 * * * * * * * * * * * * * */

class LineVis {
    constructor(parentElement, enrollData) {
        this.parentElement = parentElement;
        this.enrollData = enrollData;

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
                
        
        // Scales
		vis.x = d3.scaleTime()
			.range([0, vis.width])
        
		vis.y = d3.scaleLinear()
			.range([vis.height, 0]);
        
        // Axes
        vis.xAxis = d3.axisBottom();
        vis.yAxis = d3.axisLeft();

        vis.gx = vis.svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(${vis.margin.left-15}, ${vis.height + 15})`);

        vis.gy = vis.svg
            .append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(${vis.margin.left-15}, 0)`);

        vis.gy.append('text')
            .attr("x", vis.margin.right+5)
            .attr('y', -15)
            .attr('class', 'title y-title')
            .text('Enrollment')

        // Initialize area function
		vis.area = d3.line()
			.x(d=> vis.x(d.date))
			.y(d=> vis.y(d.cumVisit))
        
        // Group of pattern elements
        vis.patterng = vis.svg.append('g');
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // Obtain cumulative total
        [vis.cumData, vis.maxVisit]= groupCumCount(vis.enrollData)
                 
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Set domains
        // X domain dates
        vis.x.domain(d3.extent(vis.enrollData, d=>d.date))
        vis.xAxis.scale(vis.x);
        vis.gx.transition().duration(1000).call(vis.xAxis);
        
        // Y domain counts
        vis.y.domain([0, vis.maxVisit])
        vis.yAxis.scale(vis.y);
        vis.gy.transition().duration(1000).call(vis.yAxis); 
        
        vis.patterng.attr('transform', `translate(${vis.margin.left},0)`);
        
        // Actual
        let tmp = vis.patterng
            .selectAll(`.curve`)
            .data(Object.keys(vis.cumData));

        vis.curve = tmp.enter()
            .append('path')
            .merge(tmp);

        vis.curve
            .transition()
            .duration(1000)
            .attr("d", d=> vis.area(vis.cumData[d]))
            .attr('class', `curve`)
            .attr('stroke', d=> pieColors[d])
            .attr("fill", "none")
            .attr('stroke-width', 2)
        
        tmp.exit().remove();
        

    }

}


function groupCumCount(enrollData) {
    
    let maxVisit=0
    let selectedSite = $('#site-name').val();
        
    // Filter by site
    // let siteData = enrollData.filter(d=>d.site===selectedSite)
    let siteData= enrollData
    
    // Date parser
    let parseDate = d3.timeParse("%m/%d/%Y");

    // Get input field values and filter
    let lower= document.getElementById("lower").value
    let upper= document.getElementById("upper").value  
    
    lower=lower?parseDate(lower).getTime():d3.min(siteData, d=>d.date)
    upper=upper?parseDate(upper).getTime():d3.max(siteData, d=>d.date)
    
    // Filter by date
    filteredData= siteData.filter(d => d.date>=lower && d.date<=upper)
    
    // Count visits per day
    let count= {}
    races.forEach(r=> count[r]={})
    filteredData.forEach(d=> count[d.race][d.date]=count[d.race][d.date]?count[d.race][d.date]+=1:1)
    
    // Calculate cumulative sum
    let cumData= {}
    let cumVisit
    races.forEach(r=> {
        cumData[r]=[]
        Object.keys(count[r]).forEach((d,i)=> {
            // d is actually days[i]--the current date
            cumVisit=i>0?count[r][d]+cumData[r][i-1].cumVisit:count[r][d]
            cumData[r].push(
                {
                    date: d,                    
                    cumVisit: cumVisit
                }
            )
            maxVisit=cumVisit>maxVisit?cumVisit:maxVisit
        })
    })
    
    
    return [cumData, maxVisit]
    
}