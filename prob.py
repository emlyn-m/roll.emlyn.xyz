import matplotlib.pyplot as plt

def pAdv(X, S):
    return (2*S - 1) / X**2

probs = {}
for i in range(1,21):
    probs[i] = pAdv(20, i)
    print(i, probs[i])
    
print("sum(v)=", sum(probs.values()))

fig = plt.figure(figsize=(10,5))

bar = plt.bar(probs.keys(), probs.values(), width=1)
plt.show()