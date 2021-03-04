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
        vis.selectedNetSiteData= vis.givenData.filter(d=>selectedPrefixes.includes(d.prefix))
        
        // console.log(vis.selectedNetSiteData)
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        
        /*
        let allMetaData= vis.filteredData.map(d=>d.metaData).flat()
        rmrActualCount(allMetaData)
        rmrPlanCount(vis.filteredData.map(d=>d.planData))
        ethnCount(allMetaData)
        */
        
        let cohortData= filterByCohort(vis.selectedNetSiteData)
        
        // filter actual metaData by cohort and populate RMR table
        let allMetaData= vis.selectedNetSiteData.map(d=>d.metaData).flat()
        let cohortMetaData= filterByCohort(allMetaData)
        rmrActualCount(cohortMetaData)
        
        // no more filter for rmrPlanCount
        rmrPlanCount(vis.selectedNetSiteData.map(d=>d.planData))
        
        // filter actual cohortMetaData by date and populate ethnicity table
        let cohortMetaByDate= filterByDate(cohortMetaData)
        ethnCount(cohortMetaByDate)        
        
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

