

populateSites()

// loadData()

// filterData()

// rmrCount()

// ethnCount()


function populateSites() {
    
    let network= $('#network-name').val()
    $('#site-name').empty();
    $('#site-name').append(new Option('All', 'All', true))
    
    if (network==="All") {
        combinedSites= [networkSite['ProNET'], networkSite['PRESCIENT']].flat()
        combinedSites.sort((a,b)=> a>b?1:-1)
        combinedSites.forEach(s=> $('#site-name').append(new Option(s, s)))
        
    }
    else {
        networkSite[network].sort((a,b)=> a>b?1:-1)
        networkSite[network].forEach(s=> $('#site-name').append(new Option(s, s)))
    
    }
    
    
    getPrefixes()
    
}

function getPrefixes() {
    
    let filePrefixes=[]
    
    let network= [$('#network-name').val()]
    if (network[0]==='All') {        
        network=['ProNET','PRESCIENT']
    }
    
    network.forEach(n=> {
        networkSite[n].forEach(s=> filePrefixes.push(`data/${n}/${s}`))
    })
    
    
    selectedPrefixes=[]
    selectedSites= $('#site-name').val().length?$('#site-name').val():['All']
    
    // one or more network + few sites
    if (selectedSites[0]!=='All') {
        selectedSites.forEach(s=> {
            filePrefixes.forEach(f=> {
                if (f.includes(s)) {
                    selectedPrefixes.push(f)
                }
            })
        })
    }
    // one or more network + all sites
    else {
        selectedPrefixes= filePrefixes
    }    
    
    console.log(selectedPrefixes)
    
    loadMetaData(selectedPrefixes)
    loadRmrData(selectedPrefixes)
    
}

