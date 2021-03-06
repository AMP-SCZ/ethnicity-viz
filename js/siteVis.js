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

        
        vis.targetLabelOffset= -10
        vis.gy.append('text')
            .attr('y', vis.targetLabelOffset)
            .attr('class', 'title y-title')
            .text('Target')
        
        
        vis.actualLabelOffset= 10
        vis.gy.append('text')
            .attr('y', vis.actualLabelOffset)
            .attr('class', 'title y-title')
            .text('Actual')
        
        vis.statusLabelOffset= 30

        // Group of pattern elements
        vis.patterng = vis.svg.append('g');

        // Append tooltip
        vis.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .attr('style', "text-transform: capitalize;");
        
        
        // TODO
        // fixed 85% green line
        // fixed CHR and HC legends
        
        // variable CHR percentage labels
        // variable HC percentage labels
        
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // FIXME
        // PRESCIENT network
        // sorting isn't right unless planData is also filtered for network
        vis.planData.sort((a,b)=> a.Network+'/'+a.Site > b.Network+'/'+b.Site?-1:1)
        vis.metaData.sort((a,b)=> a.prefix > b.prefix?-1:1)
        
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
        
        
        // bar labels
        let labels = vis.patterng
            .selectAll('.label.count')
            .data(vis.cohortMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'label count')
            .attr('text-anchor', 'middle')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d,i) => d3.format('.0%')(d.metaData.length/vis.currTarget[i]['Target']))
            .attr('x', (d,i)=> vis.x(sites[i])+vis.x.bandwidth()/2)
            .attr('y', (d,i)=> vis.y(d.metaData.length/vis.currTarget[i]['Target']*100)-5)

        labels.exit().remove();
        
        
        // actual labels
        labels = vis.patterng
            .selectAll('.actual.label')
            .data(vis.cohortMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'actual label')
            .attr('text-anchor', 'middle')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d,i) => d.metaData.length)
            .attr('x', (d,i)=> vis.x(sites[i])+vis.x.bandwidth()/2)
            .attr('y', vis.actualLabelOffset)

        labels.exit().remove();
        
        
        // target labels
        labels = vis.patterng
            .selectAll('.target.label')
            .data(vis.cohortMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'target label')
            .attr('text-anchor', 'middle')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d,i) => vis.currTarget[i]['Target'])
            .attr('x', (d,i)=> vis.x(sites[i])+vis.x.bandwidth()/2)
            .attr('y', vis.targetLabelOffset)

        labels.exit().remove();
        
        
        
        // status markers
        labels = vis.patterng
            .selectAll('.status.label')
            .data(vis.cohortMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'status label')
            .attr('text-anchor', 'middle')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d,i)=> d.metaData.length/vis.currTarget[i]['Target']>0.85?'✓':'x')
            .attr('fill', (d,i)=> d.metaData.length/vis.currTarget[i]['Target']>0.85?'green':'red')
            .attr('style', 'font-weight:bold')
            .attr('x', (d,i)=> vis.x(sites[i])+vis.x.bandwidth()/2)
            .attr('y', vis.statusLabelOffset)

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

