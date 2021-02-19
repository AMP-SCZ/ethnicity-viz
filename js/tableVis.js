/* * * * * * * * * * * * * *
 *          TableVis         *
 * * * * * * * * * * * * * */

class TableVis {
    constructor(parentElement, enrollData, expectedData) {
        this.parentElement = parentElement;
        this.enrollData = enrollData;
        this.expectedData = expectedData;

        this.initVis();
    }
    
    initVis() {
        let vis = this;
        
        vis.wrangleData()
    }
    
    wrangleData() {
        let vis = this;
        
        let tmp
        
        tmp= count(vis.enrollData)
        vis.enrollCount= tmp[0]
        vis.totalEnroll= tmp[1]
        
        tmp= count(vis.expectedData)
        vis.expectedCount= tmp[0]
        vis.totalExpected= tmp[1]        
        
        vis.updateVis()
    }
    
    updateVis() {
        let vis = this;

        let table= document.getElementById("table-vis")
        
        // delete old table first
        table.innerHTML=''
        
        // write new table
        
        // write headers
        writeRow(table, '<b>Groups</b>', ['<b>Actual</b>','<b>Expected</b>'])
        
        // write rows
        vis.enrollCount.forEach((d,i)=> {
            writeRow(table, d.group, [d.visit, vis.expectedCount[i].visit])
        })
        
        // write total
        writeRow(table, '<b>Total</b>', [vis.totalEnroll, vis.totalExpected])
        

    }
    
}


function writeRow(table, field, value) {
    
    let row= table.insertRow(-1)
    row.insertCell(0).innerHTML= field
    row.insertCell(1).innerHTML= value[0]>=0?d3.format(',')(value[0]):value[0]
    row.insertCell(2).innerHTML= value[1]>=0?d3.format(',')(value[1]):value[1]

}


