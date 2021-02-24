#!/usr/bin/env python

import pandas as pd
import numpy as np
from datetime import date, timedelta

start_date= date(2019,12,1)
end_date= date(2021,2,24)
delta= timedelta(days=2)

races=['Asian','White','Black','Unknown']
eths=['Hispanic or Latino','Not Hispanic or Latino','Unknown']
sex=['Female','Male','Unknown']
wellness=['Patient','Healthy']

races_prob= [0.20,0.50,0.25,0.05]
eths_prob= [0.15,0.75,0.10]
sex_prob= [0.60,0.35,0.05]
wellness_prob= [0.8,0.2]

site='MGH'


# actual
df= pd.DataFrame(columns=['Consent Date','Race','Ethnicity','Sex','Wellness'])
k=0
i= start_date
while i<=end_date:

    curr_date= i.strftime('%Y-%m-%d')
    i+=delta

    for num in range(np.random.randint(1,3)):
        
        df.loc[k]= [curr_date, 
            races[np.where(np.random.multinomial(1,races_prob))[0][0]],
            eths[np.where(np.random.multinomial(1,eths_prob))[0][0]],
            sex[np.where(np.random.multinomial(1,sex_prob))[0][0]],
            wellness[np.where(np.random.multinomial(1,wellness_prob))[0][0]]]
        
        k+=1

df.to_csv(f'../data/PRESCIENT/{site}_metadata.csv', index=False)


