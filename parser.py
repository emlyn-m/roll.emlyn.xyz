import re

"""
Parser
  XdY = d(X,Y)
    - Roll X Y-sided die and sum
    
  Xadv(Y)
    - Roll X (Y-sided die with advantage) and sum
    
  +
    - add(pmf1, pmf2)
    - Combine two PMFs
    
  -
    - sub(pmf1, pmf2)
    - Return new pmf representing pmf1 - pmf2
"""

rollCombo = input(">>> ")
rollCombo = re.split(r"(\+|-|d)", rollCombo.replace(" ", "")) # enclosing parens: add delimiters, \+ : '+' symbol raw (excluding regex meaning)


print(rollCombo)