ethn_hash= {
    "Not Hispanic or Latino": 0,
    "Hispanic or Latino": 3,
    "Unknown/Not Reported Ethnicity": 6
}

// Subtract 1 for numeric operation
sex_hash= {
    "Female": 1,
    "Male": 2,
    "Unknown/Not Reported": 3
}

// Races start from row index 3
// Subtract 3 for numeric operation
race_hash= {
    "Asian": 3,
    "White": 4,
    "Black": 5,
    "Unknown/Not Reported": 6
}


let ethn_count= new Array(5).fill(0).map(() => new Array(10).fill(0))


d3.csv('../data/PRESCIENT/Sydney_metadata.csv').then(data=> {
    
    data.forEach(d=> {
        
        // r=race, e=ethnicity, s=sex
        r= d["Race"]
        e= d["Ethnicity"]
        s= d["Sex"]
        
        row_ind= race_hash[r]-3
        col_ind= ethn_hash[e]+sex_hash[s]-1
        
        // console.log(r,row_ind)
        ethn_count[row_ind][col_ind]+=1
        
    })
    

    table= document.getElementById('ethnic-report')
    R= 4
    C= 9
    ethn_count.forEach((row,i)=> {
        
        row.forEach((col,j)=> {
            
            if (i<R && j<C) {
                ethn_count[i][C]+= ethn_count[i][j]
                ethn_count[R][j]+= ethn_count[i][j]
            } else if (i==R && j<C) {
                ethn_count[R][C]+= ethn_count[R][j]
            }
            
            table.rows[i+3].cells[j+1].innerText=d3.format(',')(ethn_count[i][j])
        })
    })
    
    console.log(ethn_count)

})