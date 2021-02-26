#!/usr/bin/env python

import pandas as pd
import numpy as np
from datetime import date, timedelta

start_date= date(2019,11,1)
end_date= date(2021,2,24)
delta= timedelta(days=2)

races=['Asian','White','Black','Unknown/Not Reported']
eths=['Hispanic or Latino','Not Hispanic or Latino','Unknown/Not Reported Ethnicity']
sex=['Female','Male','Unknown/Not Reported']
wellness=['Patient','Healthy']

races_prob= [0.20,0.50,0.25,0.05]
races_prob= [0.10,0.70,0.15,0.05]
races_prob= [0.10,0.60,0.05,0.25]
# races_prob= [0.10,0.70,0.10,0.10]

eths_prob= [0.15,0.75,0.10]
eths_prob= [0.10,0.75,0.15]
eths_prob= [0.05,0.85,0.10]
# eths_prob= [0.05,0.80,0.15]

sex_prob= [0.60,0.35,0.05]
sex_prob= [0.20,0.70,0.10]
sex_prob= [0.50,0.50,0.00]
# sex_prob= [0.35,0.65,0.00]

wellness_prob= [0.8,0.2]
# wellness_prob= [0.90,0.10]

outfile= f'../data/ProNET/MGH_metadata.csv'
outfie= f'../data/ProNET/BWH_metadata.csv'
outfie= f'../data/ProNET/Yale_metadata.csv'

outfie= f'../data/PRESCIENT/Adelaide_metadata.csv'
outfie= f'../data/PRESCIENT/Melbourne_metadata.csv'
outfie= f'../data/PRESCIENT/Sydney_metadata.csv'


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

df.to_csv(outfile, index=False)


