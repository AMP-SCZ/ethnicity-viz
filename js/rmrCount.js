/* * * * * * * * * * * * * *
 *          RMR Table      *
 * * * * * * * * * * * * * */
 
let parseDate = d3.timeParse("%Y-%m-%d");

let report_dates= ["12/1/2019", "4/1/2020", "8/1/2020", "12/1/2020", "4/1/2021", "8/1/2021", "12/1/2021"].map(
    d=> d3.timeParse("%m/%d/%Y")(d).getTime()
)
console.log(report_dates)

// ENH
// Can we define an object so all csvs are loaded when the page loads and then filter as we go?
// Currently, desired csvs are loaded on demand.


// useful for debugging
// let filePrefixes= ['../data/ProNET/MGH', '../data/ProNET/BWH']

function loadMetaData(filePrefixes) {
    
    let files= filePrefixes.map(file=>d3.csv(file+'_metadata.csv'))
    Promise.all(files).then(data => {
        data= data.flat()
        console.log(data)
        
        // filter by wellness here
        data= filterByWellness(data)
        rmrCount(data)
        
        // filter by date here
        data= filterByDate(data)
        ethnCount(data)
    })
}


function loadRmrData(filePrefixes) {
    let totalTarget= new Array(7).fill(0)
    let totalMinorTarget= new Array(7).fill(0)
    let totalHispTarget= new Array(7).fill(0)
    
    let files= filePrefixes.map(file=>d3.csv(file+'_plan.csv'))
    
    let currTarget
    files.forEach(f=> {
        Promise.any([f]).then(data => {
            
            currTarget= Object.values(data[0]).filter((d,i)=>i>0).map(d=>+d)
            currTarget.forEach((d,i)=> totalTarget[i]+=d)
            
            currTarget= Object.values(data[4]).filter((d,i)=>i>0).map(d=>+d)
            currTarget.forEach((d,i)=> totalMinorTarget[i]+=d)
            
            currTarget= Object.values(data[8]).filter((d,i)=>i>0).map(d=>+d)
            currTarget.forEach((d,i)=> totalHispTarget[i]+=d)
            
            
            table= document.getElementById('rmr-report')
            
            report_dates.forEach((d,i)=> {
                if (totalTarget[i]) {
                    table.rows[1].cells[i+1].innerText=d3.format(',')(totalTarget[i])
                    table.rows[5].cells[i+1].innerText=d3.format(',')(totalMinorTarget[i])
                    table.rows[9].cells[i+1].innerText=d3.format(',')(totalHispTarget[i])
                }
            })
        
        })
    })
}

function filterByWellness(data) {
    wellness= $('#wellness').val()
    if (wellness!=='All') {
        filteredData= data.filter(d=> d["Wellness"]===wellness && d)
    }
    else
        filteredData= data
    
    return filteredData
}

function filterByDate(siteData) {
    
    // Date parser
    let parseDate = d3.timeParse("%m/%d/%Y");

    // Get input field values and filter
    let lower= document.getElementById("lower").value
    let upper= document.getElementById("upper").value
    
    lower && (lower=parseDate(lower).getTime())
    upper && (upper=parseDate(upper).getTime())
    
    // FIXME how is date loaded as %Y-%m-%d while we wrote %m/%d/%Y in the csvs?
    parseDate = d3.timeParse("%Y-%m-%d");
    if (lower && upper) {
        // Filter by date
        filteredData= siteData.filter(d => {
            let curr_date= parseDate(d["Consent Date"]).getTime()
            return (curr_date>=lower && curr_date<=upper)
        })
    }
    else
        filteredData= siteData
    
    return filteredData
}

function rmrCount(data) {
    
    let total= new Array(7).fill(0)
    let totalHisp= new Array(7).fill(0)
    let totalMinor= new Array(7).fill(0)
    
    data.forEach(d=> {
        curr_date= parseDate(d["Consent Date"]).getTime()
        
        if (curr_date<report_dates[0])
            col_ind=0
            
        else if (curr_date<report_dates[1])
            col_ind=1
            
        else if (curr_date<report_dates[2])
            col_ind=2
            
        else if (curr_date<report_dates[3])
            col_ind=3
            
        else if (curr_date<report_dates[4])
            col_ind=4
            
        else if (curr_date<report_dates[5])
            col_ind=5
            
        else if (curr_date<report_dates[6])
            col_ind=6
        
                
        total[col_ind]+=1
        if (d["Race"]!=="White")
            totalMinor[col_ind]+=1
        
        if (d["Ethnicity"]==="Hispanic or Latino")
            totalHisp[col_ind]+=1
            
    })
    
    
    report_dates.forEach((d,i)=> {
        if (i>0 && total[i]) {
            total[i]=total[i]+total[i-1]
            totalHisp[i]=totalHisp[i]+totalHisp[i-1]
            totalMinor[i]=totalMinor[i]+totalMinor[i-1]
        }
    })
    
    // Calculate ratio and status
    console.log("Total")
    console.log(total)
    
    console.log("Racial Minority")
    console.log(totalMinor)
    
    console.log("Hispanic or Latino")
    console.log(totalHisp)
    
    
    table= document.getElementById('rmr-report')
    
    report_dates.forEach((d,i)=> {
        if (total[i]) {
            table.rows[2].cells[i+1].innerText=d3.format(',')(total[i])
            table.rows[6].cells[i+1].innerText=d3.format(',')(totalMinor[i])
            table.rows[10].cells[i+1].innerText=d3.format(',')(totalHisp[i])
        }
    })
}

