FUNC_LUT = {
    'd': ndx,
    '!': ndxAdv,
    '?': ndxDis,
    
    '+': async (x1, x2) => { return (await combine(x1, x2, add)) },
    '-': async (x1, x2) => { return (await combine(x1, x2, sub)) },
}

async function parsePrompt(prompt) {
    
    if (!/^((\+|-)?[0-9]+(d[0-9]+(\?|!)?)?)+$/.test(prompt)) { 
        console.error("Incorrect format!");
        return false;
    }
    
    
    prompt = (await prompt.replaceAll(/\s/g, "")); // remove all whitespace
    prompt = (await prompt.replaceAll(/([0-9]+)d([0-9]+)(\?|!)(\+|-)?/g, '$1$3$2$4')); // infix adv/disadv operators
    prompt = (await prompt.replaceAll(/(?<comb>\+|-)?(?<n1>[0-9]+)((?<op>d|!|\?)(?<n2>[0-9]+))?/g, '$2 $5 $4 $1 ')); // convert to rpn
    
    promptTokenised = (await prompt.trim().split(/(?: )+/g)); // trim, split on space ignoring repeats
    promptTokenised.reverse();
    
    promptTokenised.forEach((x, i) => {
        if (!isNaN(x)) {
            promptTokenised[i] = Number(x);
        }
    });

    currStack = Array();
    
    while (promptTokenised.length > 0) {
        latestOp = (await promptTokenised.pop());
        if (FUNC_LUT[latestOp]) {
            param2 = (await currStack.pop());
            param1 = (await currStack.pop());
            currStack.push((await FUNC_LUT[latestOp](param1, param2)));

            console.log(latestOp + ' ' + param1 + ' ' + param2);
        } else {
            currStack.push(latestOp);
        }
    }

    return currStack;
}