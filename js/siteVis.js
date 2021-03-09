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

        
        vis.legendRectOffset= -45
        vis.legendTextOffset= -35
        vis.targetLabelOffset= -10
        vis.actualLabelOffset= 10
        vis.statusLabelOffset= 30
        
        
        vis.gy.append('text')
            .attr('y', vis.targetLabelOffset)
            .attr('class', 'title y-title label target')
            .text('Target')  
        
        
        vis.gy.append('text')
            .attr('y', vis.actualLabelOffset)
            .attr('class', 'title y-title label actual')
            .text('Actual')
        

        // Group of pattern elements
        vis.patterng = vis.svg.append('g');

        // Append tooltip
        vis.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .attr('style', "text-transform: capitalize;");
        
        vis.patterng.append("line")
            .attr("x1", vis.margin.left)
            .attr("y1", vis.y(85))
            .attr("x2", vis.width)
            .attr("y2", vis.y(85))
            .attr("id", "thresh-line")
            
        vis.patterng.append("text")
            .attr("x", vis.margin.left-30)
            .attr("y", vis.y(84))
            .text("85%")
            .attr("fill", "green")
            .attr("text-anchor", "end")
            
        vis.defs= vis.patterng.append('defs')
        
        vis.colors= d3.schemeCategory10
        
        
        let legendWidth= 15
        vis.cohorts= ['CHR', 'HC']
        vis.patterng
            .selectAll('.rect.legend')
            .data(vis.cohorts)
            .enter()
            .append('rect')
            .attr('width', legendWidth)
            .attr('height', legendWidth)
            .attr('x', (d,i)=> vis.width/4*(i+1))
            .attr('y', vis.legendRectOffset)
            .attr('fill', (d,i)=> vis.colors[i])
            .attr('class', 'rect legend')
        
        
        vis.patterng
            .selectAll('.text.legend')
            .data(vis.cohorts)
            .enter()
            .append('text')
            .attr('x', (d,i)=> vis.width/4*(i+1)+legendWidth+5)
            .attr('y', vis.legendTextOffset)
            .attr('fill', 'black')
            .attr('class', 'text legend')
            .text(d=>d)
        
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        vis.planData.sort((a,b)=> a.Network+'/'+a.Site > b.Network+'/'+b.Site?-1:1)
        vis.metaData.sort((a,b)=> a.prefix > b.prefix?-1:1)
        
        // console.log(vis.planData)
        // console.log(vis.metaData)
        
        // filter selected networks and sites
        vis.selectedNetSiteData= vis.metaData.filter(d=>selectedPrefixes.includes(d.prefix))
        vis.selectedNetSitePlanData= vis.planData.filter(d=>selectedPrefixes.includes(`data/${d.Network}/${d.Site}`))

        
        // filter actual metaData by date
        vis.cohortMetaByDate= vis.selectedNetSiteData.map(d=> {
            let dnew= JSON.parse(JSON.stringify(d))
            dnew.metaData=filterByDate(d.metaData)
            return dnew
        })
        
        // console.log(vis.cohortMetaByDate)
        
        // obtain target for the date range
        vis.currTarget= interpTarget(vis.selectedNetSitePlanData)
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
            // .attr('fill', 'lightblue')
            .attr('fill', (d, i)=> {
                
                let chrFrac= d.metaData.filter(w=>w.Wellness==='Patient' && w).length/d.metaData.length
                
                let grad = vis.defs.append("linearGradient")
                    .attr("id", "grad_" + i)
                    .attr("x1", "0%")
                    .attr("x2", "0%")
                    .attr("y1", "0%")
                    .attr("y2", "100%")
                    .selectAll("stop")
                    .data([
                        {offset: d3.format(".0%")(chrFrac), color: vis.colors[0]},
                        {offset: d3.format(".0%")(1-chrFrac), color: vis.colors[1]}
                    ])
                    .enter()
                    .append("stop")
                    .attr("offset", d => d.offset)
                    .attr("stop-color", d => d.color)
                    

                return `url(#grad_${i})`;
            
            })
            
        tmp.exit().remove();
        
        
        // bar labels
        /*
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
        */
        
        vis.chrMetaByDate= vis.cohortMetaByDate.map(d=> {
            let dnew= JSON.parse(JSON.stringify(d))
            dnew.metaData= d.metaData.filter(w=>w.Wellness==='Patient' && w)
            return dnew
        })
        
        
        // CHR percentage
        let labels = vis.patterng
            .selectAll('.label.chr')
            .data(vis.chrMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'label chr')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d,i) => d3.format('.0%')(d.metaData.length/vis.currTarget[i]['Target']))
            .attr('x', (d,i)=> vis.x(sites[i])+vis.x.bandwidth()/2)
            .attr('y', (d,i)=> 
                vis.y((vis.cohortMetaByDate[i].metaData.length-d.metaData.length/2)/vis.currTarget[i]['Target']*100))

        labels.exit().remove();
        
        
        // HC percentage
        labels = vis.patterng
            .selectAll('.label.hc')
            .data(vis.chrMetaByDate, d => d.prefix)

        labels
            .enter()
            .append('text')
            .attr('class', 'label hc')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .merge(labels)
            .transition()
            .duration(1000)
            .text((d,i) => d3.format('.0%')((vis.cohortMetaByDate[i].metaData.length-d.metaData.length)/vis.currTarget[i]['Target']))
            .attr('x', (d,i)=> vis.x(sites[i])+vis.x.bandwidth()/2)
            .attr('y', (d,i)=> 
                vis.y(((vis.cohortMetaByDate[i].metaData.length-d.metaData.length)/2)/vis.currTarget[i]['Target']*100))

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
    
    // FIXME
    // Should numerator (upper-l_given) be replaced by (upper-lower)?
    // It should be because actual is within lower and upper
    // On the other hand, it should not be because target should always be counted from the beginning i.e. l_given
    let interpData= planData.map(d=> {
        
        let dnew= JSON.parse(JSON.stringify(d))
        
        dnew["Target"]= Math.round((upper-lower)/(u_given-l_given)*(+d["Target"]))
        dnew["CHR%"]= Math.ceil(+d["CHR%"]/100*dnew["Target"])
        dnew["HC%"]= Math.floor(+d["HC%"]/100*dnew["Target"])
        dnew["Minority%"]= Math.round(+d["Minority%"]/100*dnew["Target"])
        dnew["Hispanic%"]= Math.round(+d["Hispanic%"]/100*dnew["Target"])
        
        return dnew
    })
    
    // console.log(interpData)
    
    return interpData
    
}

