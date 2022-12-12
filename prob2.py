import matplotlib.pyplot as plt

def add(x,y): return x+y
def sub(x,y): return x-y
def mul(x,y): return x*y
def div(x,y): return x//y

def advPmf(X):
    probs = {}
    for i in range(1,X+1):
        probs[i] = (2*i - 1) / (X**2)
    return probs

def combine(pmf1, pmf2=None, operation=None):
    pmf1k = pmf1.keys()
    if pmf2 == None:
        pmf2 = {0:1}
    pmf2k = pmf2.keys()
    
    if operation == None:
        operation = add
    
    probt = {}

    #setup output space
    for k1 in pmf1.keys():
        for k2 in pmf2.keys():
            probt[operation(k1,k2)] = 0
                
    #populate with probabilities
    for s in probt.keys():
        for k1 in pmf1k:
            for k2 in pmf2k:
                if operation(k1, k2) == s: probt[s] += pmf1[k1] * pmf2[k2]

    return probt
                
    

#DEBUG BELOW
def onedx(x):
    rv = {}
    for i in range(1,x+1):
        rv[i] = 1/x
    return rv


pmfcomb = combine(onedx(6), onedx(4), sub)


for i in sorted(pmfcomb.keys()):
    print(i, round(pmfcomb[i]*100, 2))
print('Sum(v)=', sum(pmfcomb.values()))

fig = plt.figure(figsize=(10,5))

bar = plt.bar(pmfcomb.keys(), pmfcomb.values(), width=1)
plt.show()