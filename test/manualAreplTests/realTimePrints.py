from time import sleep
from datetime import datetime

x=0

while(x<2):
    x = x+1
    sleep(2)
    print(datetime.now())

###########################################
#                Expected Result
###########################################

# prints should appear in real time