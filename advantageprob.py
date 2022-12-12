import numpy as np
import matplotlib.pyplot as plt

def pSingle(X, S): #P(1dX >= S)
    if S > X or S < 1: return 0
    return sum([1/X for _ in range(S, X+1)])

def pAdv(X, S): #P(adv(1dX) >= S)
    l = pSingle(X,S)
    return 2*l - l**2


probs = {}
for i in range(1,21):
    probs[i] = (1 - pAdv(20,i)) + (pAdv(20, i) - pAdv(20,i+1)) # cdf
#    probs[i] = pAdv(20,i) - pAdv(20,i+1)  # pmf        

    
# line of best fit
probsArr = []
for k in probs.keys():
    probsArr.append((k, probs[k]))
        
dt = np.array(probsArr)
    

X = dt[:, 0]
y = dt[:, 1]

params = np.polyfit((X+1), y, 2)


fig = plt.figure(figsize=(10,5))

bar = plt.bar(probs.keys(), probs.values(), width=1)

lobfX = np.array([i for i in range(1,23)])

plt.plot(params[0] * lobfX**2 + params[1] * lobfX + params[2], 'r')
plt.xlim(1,20)
plt.ylim(0,)

plt.show()