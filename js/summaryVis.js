/* * * * * * * * * * * * * *
 *          SummaryVis     *
 * * * * * * * * * * * * * */

class SummaryVis {
    constructor(parentElement, enrollData) {
        this.parentElement = parentElement;
        this.enrollData = enrollData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const width = 200;
        const height = 125;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // Init drawing area
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);
        
        
        // Scales and axes
		vis.x = d3.scaleTime()
			.range([0, vis.width])
			

		vis.y = d3.scaleLinear()
			.range([vis.height, 0]);
        
        // Initialize area function
		vis.area = d3.line()
			.x(d=> vis.x(d.date))
			.y(d=> vis.y(d.cumVisit))


        
		// Append path
		vis.svg.append("path")
			.attr("class", "area")
            .attr("fill", "none")
            
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // Obtain cumulative total
        vis.cumData= cumCount(vis.enrollData)
                 
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Set domains
        // X domain dates
        vis.x.domain(d3.extent(vis.cumData, d=> d.date))
        
        // Y domain counts
        vis.y.domain([0, d3.max(vis.cumData, d=>d.cumVisit)])
        
        // Render path
        vis.svg.select(".area")
            .transition()
            .duration(1000)
            .attr("d", vis.area(vis.cumData))
            .attr('stroke', 'black')
             
        document.getElementById('category').innerHTML= $('#site-name').val()
        document.getElementById('category-count').innerHTML= vis.cumData[vis.cumData.length-1].cumVisit

    }

}


function cumCount(enrollData) {
    
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
    
    // Count visits per day
    let count= {}
    filteredData.forEach(d=> count[d.date]=count[d.date]?count[d.date]+=1:1)
    
    // Calculate cumulative sum
    let cumData= []
    Object.keys(count).forEach((d,i)=>
        cumData.push(
            {
                date: d,
                // d is actually days[i]--the current date
                cumVisit: i>0?count[d]+cumData[i-1].cumVisit:count[d]
            }
        )
    )
    
    
    return cumData
    
}