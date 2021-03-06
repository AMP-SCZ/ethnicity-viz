/* * * * * * * * * * * * *
 *    Site Summaries     *
 * * * * * * * * * * * * */

class SiteVis {
    constructor(parentElement, metaData, planData) {
        this.parentElement= parentElement
        this.metaData= metaData
        this.planData= planData
        
        this.initVis()
    }
    
    initVis() {
        let vis = this
        
        const width = 900;
        const height = 500;

        vis.margin = { top: 50, right: 20, bottom: 50, left: 50 };
        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Scales and Axes
        vis.x = d3.scaleBand()
            .range([vis.margin.left, vis.width])
            .paddingInner(0.1);
        vis.xAxis = d3.axisBottom();

        vis.y = d3.scaleLinear()
            .domain([0,100])
            .range([vis.height, vis.margin.top]);
        vis.yAxis = d3.axisLeft().ticks(8);

        vis.gx = vis.svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.height+10})`);

        vis.gy = vis.svg
            .append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(${vis.margin.left-10}, 0)`);

        vis.gy.append('text')
            .attr('y', 0)
            .attr('class', 'title y-title')
            .text('Enrollment')

        // Group of pattern elements
        vis.patterng = vis.svg.append('g');

        // Append tooltip
        vis.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .attr('style', "text-transform: capitalize;");
        
        
        // fixed domain Y axis: [0,100]
        // variable domain X axis: selected sites
        
        // fixed plot title
        // fixed 85% green line
        // fixed CHR and HC legends
        
        // variable horizontal labels: number of enrollment per site
        // variable horizontal labels: x/tick mark
        
        // variable bar labels: percentage of target achieved        
        // variable CHR percentage labels
        // variable HC percentage labels
        
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // filter selected networks and sites
        vis.selectedNetSiteData= vis.metaData.filter(d=>selectedPrefixes.includes(d.prefix))
        
        // filter actual metaData by date
        vis.cohortMetaByDate= vis.selectedNetSiteData.map(d=> {
            d.metaData=filterByDate(d.metaData)
            return d
        })        
        // console.log(vis.cohortMetaByDate)
        
        // obtain target for the date range
        vis.currTarget= interpTarget(vis.planData)
        // console.log(vis.currTarget)
        
        
        // console.log(vis.selectedNetSiteData)
        vis.updateVis();
    }
    

    updateVis() {
        let vis = this;
                
        let sites= vis.cohortMetaByDate.map(d=>d.prefix.split('/')[2])
        vis.x.domain(sites);
        vis.xAxis.scale(vis.x);
        vis.gx.transition().duration(1000).call(vis.xAxis);
        
        vis.yAxis.scale(vis.y);
        vis.gy.transition().duration(1000).call(vis.yAxis);
        
        // vis.patterng.attr('transform', `translate(${vis.x.bandwidth()/2},0)`);
        
        // bars
        let tmp = vis.patterng
            .selectAll('.bar')
            .data(vis.cohortMetaByDate, d => d.prefix);

        vis.bar = tmp.enter()
            .append('rect')
            .merge(tmp);

        vis.bar
            .transition()
            .duration(1000)
            .attr('x', (d,i)=> vis.x(sites[i]))
            .attr('y', (d,i)=> vis.y(d.metaData.length/vis.currTarget[i]['Target']*100))
            .attr('width', vis.x.bandwidth())
            .attr('height', (d,i)=> vis.height-vis.y(d.metaData.length/vis.currTarget[i]['Target']*100))
            .attr('class', 'bar')
            .attr('fill', 'lightblue')
            
        tmp.exit().remove();
        
        
        // labels        
        let labels = vis.patterng
            .selectAll('.label.count')
            .data(vis.cohortMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'label count')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d) => d3.format(',')(d.metaData.length))
            .attr('x', (d,i)=> vis.x(sites[i]))
            .attr('y', (d,i)=> vis.y(d.metaData.length/vis.currTarget[i]['Target']*100)-5)

        labels.exit().remove();
        
        
        vis.showTooltip();

    }
    
    
    showTooltip(type, total) {
        let vis = this;

        vis.bar
            .on('mouseover', function (event, d) {
                
                let target= vis.currTarget.filter(s=> d.prefix.includes(s['Site']) && s)[0]
                
                vis.tooltip
                    .style('opacity', 1)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 20 + 'px').html(`
                <div style="background: rgba(0, 0, 0, 0.8); color: #fff; border-radius: 2px; padding: 12px">
                    <h6>${d.prefix.split('/')[2]}</h6>
                    <table class="table" style="margin-bottom: 0; font-family: Monospace; font-size: 14px">
                    <tbody>
                        <tr>
                            <td>Actual</td>
                            <td>${d.metaData.length}</td>
                        </tr>
                        <tr>
                            <td>Target</td>
                            <td>${target['Target']}</td>
                        </tr>
                        <tr>
                            <td>Actual/Target</td>
                            <td>${d3.format('.0%')(d.metaData.length/target['Target'])}</td>
                        </tr>
                    </tbody>
                </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                
                vis.tooltip.style('opacity', 0)
                    .style('left', 0)
                    .style('top', 0)
                    .html(``);
            });
            
    }
    
}


function interpTarget(planData) {
    
    // Date parser
    let parseDate = d3.timeParse("%m/%d/%Y");

    // Get input field values and filter
    let lower= document.getElementById("lower").value
    let upper= document.getElementById("upper").value
    
    let l_given= parseDate(start_date).getTime()
    let u_given= parseDate(end_date).getTime()
    
    lower=lower?parseDate(lower).getTime():l_given
    upper=upper?parseDate(upper).getTime():u_given
    
    let interpData= planData.map(d=> {
        
        d["Target"]= Math.round((upper-l_given)/(u_given-l_given)*(+d["Target"]))
        d["CHR%"]= Math.round(+d["CHR%"]/100*d["Target"])
        d["HC%"]= Math.round(+d["HC%"]/100*d["Target"])
        d["Minority%"]= Math.round(+d["Minority%"]/100*d["Target"])
        d["Hispanic%"]= Math.round(+d["Hispanic%"]/100*d["Target"])
        
        return d
    })
    
    return interpData
    
}

