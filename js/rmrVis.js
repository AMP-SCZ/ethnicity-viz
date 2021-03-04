/* * * * * * * * * * * * * * * * * * * *
 *     Research Milestone Reporting    *
 * * * * * * * * * * * * * * * * * * * */

class RmrVis {
    constructor(data) {
        this.givenData= data
        
        this.initVis();
    }

    initVis() {
        let vis = this;
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        // filter selected networks and sites
        vis.filteredData= vis.givenData.filter(d=>selectedPrefixes.includes(d.prefix))
        
        console.log(vis.filteredData)
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        
        // rmrPlanCount(vis.filteredData.map(d=>d.planData))
        // rmrActualCount(vis.filteredData.map(d=>d.metaData))
        
        ethnCount(vis.filteredData.map(d=>d.metaData).flat())
        
    }

}

/*
planned enrollment
    - one total
    - percentage for racial minority
    - percentage for hispanic
    - percentage for C
    - percentage for CHR

*/

