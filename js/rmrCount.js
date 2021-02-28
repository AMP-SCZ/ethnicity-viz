// Populate table with targets from csvs


// Calculate actuals

let parseDate = d3.timeParse("%Y-%m-%d");

let total= new Array(7).fill(0)
let totalHisp= new Array(7).fill(0)
let totalMinor= new Array(7).fill(0)

let report_dates= ["12-1-2019", "4-1-2020", "8-1-2020", "12-1-2020", "4-1-2021", "8-1-2021", "12-1-2021"].map(
    d=> d3.timeParse("%m-%d-%Y")(d).getTime()
)
console.log(report_dates)

d3.csv('../data/ProNET/MGH_metadata.csv').then(data=> rmrCount(data))

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
    
    
    report_dates.map((d,i)=> {
        if (i>0 && total[i]) {
            total[i]=total[i]+total[i-1]
            totalHisp[i]=totalHisp[i]+totalHisp[i-1]
            totalMinor[i]=totalMinor[i]+totalMinor[i-1]
        }
    })
    
    // Calculate ratio and status
    console.log("Total")
    console.log(total)
    
    console.log("Hispanic or Latino")
    console.log(totalHisp)
    
    console.log("Racial Minority")
    console.log(totalMinor)
}