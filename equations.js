var generateButton = document.getElementById("generate");
var hiddenDiv = document.getElementById("hiddenDiv");
var equationP = document.getElementById("equation");

function setUpHiddenDiv() {
    generateButton.addEventListener("click", function() {
        hiddenDiv.style.display = "initial";
        scrollEaseTo(hiddenDiv, 750);
    });
}

function setUpEquation() {
    var equation = "";
    for (let component of components) {
        equation += par(component.getEquation());
    }
    equationP.textContent = "\\[" + equation + "=0\\]";
    MathJax.typeset();
}

function scrollEaseTo(element, duration) {
    var startingY = window.pageYOffset;
    var elementY = element.getBoundingClientRect().top - 15
    // If element is close to page's bottom then window will scroll only to some position above the element.
    var targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY + document.documentElement.scrollTop;
    
    var diff = targetY - startingY
    // Easing function: easeInOutCubic
    // From: https://gist.github.com/gre/1650294
    var easing = function (t) { return -0.5 * Math.cos(Math.PI * t) + 0.5 }
    var start;

    if (!diff) {return;}

    window.requestAnimationFrame(function step(timestamp) {
        if (!start) start = timestamp
        // Elapsed miliseconds since start of scrolling.
        var time = timestamp - start
            // Get percent of completion in range [0, 1].
        var percent = Math.min(time / duration, 1)
        // Apply the easing.
        // It can cause bad-looking slow frames in browser performance tool, so be careful.
        percent = easing(percent)

        window.scrollTo(0, startingY + diff * percent)

            // Proceed with animation as long as we wanted it to.
        if (time < duration) {
            window.requestAnimationFrame(step)
        } else {
            setUpEquation();
        }
    });
    
}

function multiply() {
    var factors = Array.prototype.slice.call(arguments);
    var product = "";
    for(let factor of factors) {
        if (factor == 0 || factor == "0") {
            return 0;
        } else if (factor != 1 || factor != "1") {
            product += factor;
        }
    }
    return product;
}

function divide(numerator, denominator) {
    if (isConstant(numerator) && isConstant(denominator)) {
        var gcd = function gcd(a,b){
            return b ? gcd(b, a%b) : a;
        };
        gcd = gcd(numerator,denominator);

        numerator = numerator/gcd;
        denominator = denominator/gcd;

        if(numerator<0 && denominator<0) {
            numerator *= -1;
            denominator *= -1;
        }

        if (denominator == 1) {
            return numerator;
        } else if (numerator == 0) {
            return 0;
        } else {
            var negative = "";
            if(numerator<0 || denominator<0) {
                numerator = Math.abs(numerator);
                denominator = Math.abs(denominator);
                negative = "-";
            }
            return negative + "{" + numerator + " \\over " + denominator + "}";
        }
    }

    if (denominator == 1 || denominator == "1") {
        return numerator;
    } else if (numerator == 0 || numerator == "0" || numerator == "-0") {
        return 0;
    } else {
        var negative = "";
        if(numerator<0 || denominator<0) {
            numerator = Math.abs(numerator);
            denominator = Math.abs(denominator);
            negative = "-";
        }
        return negative + "{" + numerator + " \\over " + denominator + "}";
    }
}

function add() {
    var addends = Array.prototype.slice.call(arguments);
    var sum = "";
    var constant = 0;
    for(let addend of addends) {
        if(typeof addend == "number") {
            addend = addend.toString();
        }

        if (addend != "0" && addend != "-0") {
            if (isConstant(addend)) {
                constant += Number(addend);
            } else if (addend.startsWith("-")) {
                sum += addend;
            } else if (sum == "") {
                sum += addend;
            } else {
                sum += "+" + addend;
            }
        }
    }

    if (constant != 0) {
        if(constant > 0 && sum != "") {
            sum += "+" + constant;
        } else {
            sum += constant;
        }
    }

    return sum;
}

function restrict() {
    var restrictions = Array.prototype.slice.call(arguments);
    var product = "";
    for (let restriction of restrictions) {
        if (restriction.dir == "min") {
            product += par(add(restriction.value, neg(restriction.limit)));
        } else if (restriction.dir == "max") {
            product += par(add(restriction.limit, neg(restriction.value)));
        }
    }
    return "\\sqrt{|" + product + "|\\over" + product + "}";
}

function neg(expression) {
    if(typeof expression == "number") {
        expression = expression.toString();
    }

    if(isConstant(expression)) {
        if (expression.startsWith("-")) {
            return expression.substring(1);
        } else {
            return "-"+ expression;
        }
    } else {
        return "- \\left(" + expression + "\\right)";
    }  
}

function isConstant(expression) {
    if(typeof expression == "number") {
        expression = expression.toString();
    }

    return expression.match(/^[-]?\d*\.?\d*$/g) != null;
}

function par(expression) {
    return "\\left(" + expression + "\\right)";
}