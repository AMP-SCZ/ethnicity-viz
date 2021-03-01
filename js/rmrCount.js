// Populate table with targets from csvs


// Calculate actuals

let parseDate = d3.timeParse("%Y-%m-%d");

let total= new Array(7).fill(0)
let totalHisp= new Array(7).fill(0)
let totalMinor= new Array(7).fill(0)

let report_dates= ["12/1/2019", "4/1/2020", "8/1/2020", "12/1/2020", "4/1/2021", "8/1/2021", "12/1/2021"].map(
    d=> d3.timeParse("%m/%d/%Y")(d).getTime()
)
console.log(report_dates)

// TODO
// apply filter on files
// do not load all of them
// or should we load all of them and then filter out dynamically


populateSite()

let files= ['../data/ProNET/MGH_metadata.csv', '../data/ProNET/BWH_metadata.csv'].map(file=>d3.csv(file))
Promise.all(files).then(data => {
    data= data.flat()
    console.log(data)
    rmrCount(data)
})
    

function rmrCount(data) {
    
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


function populateSite() {
    
    let network= $('#network-name').val()
    $('#site-name').empty();
    $('#site-name').append(new Option('All', 'All'))
    
    if (network==="All") {
        combinedSites= [networkSite['ProNET'], networkSite['PRESCIENT']].flat()
        combinedSites.sort((a,b)=> a>b?1:-1)
        combinedSites.forEach(s=> $('#site-name').append(new Option(s, s)))
        
    }
    else {
        networkSite[network].sort((a,b)=> a>b?1:-1)
        networkSite[network].forEach(s=> $('#site-name').append(new Option(s, s)))
    
    }
    
}