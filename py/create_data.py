#!/usr/bin/env python

import pandas as pd
import numpy as np
from datetime import date, timedelta

start_date= date(2020,1,1)
end_date= date(2020,12,31)
delta= timedelta(days=1)

sites=['BWH', 'MGH', 'McLean', 'PNC']
races=['Asian','White','Black','Hispanic']
prob= [
    [0.15,0.25,0.45,0.15],
    [0.25,0.45,0.15,0.15],
    [0.45,0.15,0.25,0.15],
    [0.25,0.15,0.15,0.45]
]

# actual
df= pd.DataFrame(columns=['site','date','race'])
k=0
for j, s in enumerate(sites):
    i= start_date
    while i<=end_date:
    
        curr_date= i.strftime('%Y-%m-%d')
        i+=delta
    
        for num in range(np.random.randint(1,11)):
            # df.loc[k]= [s, curr_date, races[np.random.randint(0,4)]]
            df.loc[k]= [s, curr_date, races[np.where(np.random.multinomial(1,prob[j]))[0][0]]]
            k+=1

df.to_csv('../data/enroll_data.csv',index=False)


# expected
ex_enroll= [650, 800, 450, 200]
df= pd.DataFrame(columns=['site','date','race'])
k=0
for s in sites:
    for q, start_date in enumerate([date(2020,1,1), date(2020,4,1), date(2020,7,1), date(2020,10,1)]):
        i= start_date
        while i<=end_date:
        
            curr_date= i.strftime('%Y-%m-%d')
            i+=delta
        
            for num in range(ex_enroll[q]//120):
                df.loc[k]= [s, curr_date, races[np.random.randint(0,4)]]
                k+=1

df.to_csv('../data/expected_data.csv',index=False)

