var BITS_MANT_SIMPLE = 23;
var BITS_MANT_DOUBLE = 52;

var BITS_EXP_SIMPLE = 8;
var BITS_EXP_DOUBLE = 11;

var expBase2 = exp();

// method
function IEEE754Encoding(number, double) {

    var pm = double ? BITS_MANT_DOUBLE: BITS_MANT_SIMPLE;
    var pe = double ? BITS_EXP_DOUBLE : BITS_EXP_SIMPLE;

	// - convert and normalize the integer part into binary
    //    - by splitting number into integer/fraction
    //    - and computing binary representation

    // integer
	var int = floor(number);
    var bInt = numToBinaryStr(int);

    console.log('binary int ' + bInt);

    // fraction (decimal)
    var fraction = number - int,
    	bDec = '',
        i = 0,
    	space = pm - bInt.length; // mantissa free space

    while (i++ < space) {
        var value = fraction * 2;

        if (value === 0) break;

        var int = floor(value);
        bDec += '' + int;
        fraction = value - int;
    }

    // normalise decimal position to get exponent
    var isZero = false;
    var idx = -1;
    var exposant = bInt.length - 1;
    if (exposant == 0) {
        idx = bDec.indexOf('1') + 1;
    	exposant = -idx;
        isZero = true;
    }

    // (51,375)10  = (1, 10011011000)base2x2^5
    console.log('('+number+') base 10 = ('+bInt+','+bDec+')base 2 * 2^' +exposant);

    // remove first useless bit
    bDec = !isZero ? bDec : bDec.substring(idx);
    var mantis = bInt.substring(1, bInt.length) + bDec;

    console.log(mantis);

    if (mantis.length < pm) {
        mantis = fillBits(mantis, pm - mantis.length, true);
    }

    check(exposant, mantis);

    // binary exposant
    exposant += double ? 1023 : 127;

    console.log('final exposant ' + exposant);

    exposant = numToBinaryStr(exposant);

    console.log('binary exposant ' + exposant);

    if (exposant.length < pe) {
        exposant = fillBits(exposant, pe - exposant.length);
    }

    console.log('binary exposant ' + exposant);

    console.log('IEEE 754 normalisation value ');
    console.log('1 ' + exposant + ' ' + mantis);

    return {
    	sign: '1',
        exponent: exposant,
        mantis: mantis
    }
}

// https://books.google.fr/books?id=4RChxt67lvwC&pg=PA35&lpg=PA35&dq=javascript+integer+to+binary+representation&source=bl&ots=thZ9FhLTp2&sig=TslfYziR2WFoaUPkrmkgkVZYGt8&hl=fr&sa=X&ved=0ahUKEwjdhrv-ybDJAhXHLhoKHYx7D8M4ChDoAQg_MAQ#v=onepage&q=javascript%20integer%20to%20binary%20representation&f=false
// http://www.theirishpenguin.com/2013/08/02/batshift-crazy-basic-binary-number-representation-in-javascript.html
function charEncoding(number, signed) {
  var positive = false;

  if (signed && number > 0x7F) {
    return '0' + (0x7F >>> 0).toString(2);
  }

  if (signed && number < -127) {
    return (0x81 >>> 0).toString(2);
  }

  var bits = ((Math.abs(number) & 0x000000FF) >>> 0).toString(2);

  if (signed) {
    return number > 0 ? '0' + bits : '1' + bits;
  }

  return bits;
}

// https://en.wikipedia.org/wiki/Single-precision_floating-point_format
// http://www.binaryconvert.com/result_float.html?decimal=049054055055055050049056

/*
var norm = IEEE754Encoding(8388607);
IEEE754Encoding(0.375);
IEEE754Encoding(0.333);

IEEE754Encoding(0.25);
IEEE754Encoding(6.875);
IEEE754Encoding(0.152);
IEEE754Encoding(210.25);
IEEE754Encoding(3.14);
*/


// GRAPHICS

var targetId = '#ieee754';

var svgContainer = d3.select(targetId).append("svg").attr("width", 800).attr("height", 300);

drawText('Float (IEEE754 Single precision 32-bit)', 0, 20, '30px');
drawText('Double (IEEE754 Double precision 64-bit)', 0, 150, '30px');

var value = 2.25;

var norm = IEEE754Encoding(value);
draw(norm.sign, "#DADEE2", "#4679BD", 0, 50);
draw(norm.exponent, "#DADEE2", "#DE407D", 30, 50);
draw(norm.mantis, "#DADEE2", "#4679BD", 250, 50);

var normDouble = IEEE754Encoding(value, true);
draw(normDouble.sign, "#DADEE2", "#4679BD", 0, 200);
draw(normDouble.exponent, "#DADEE2", "#DE407D", 30, 200);
draw(normDouble.mantis, "#DADEE2", "#4679BD", 300, 200);

// when the input range changes update value
d3.select("#number").on("input", function() {
  var value = this.value;
  console.log(isNaN(value));

  if (isNaN(value)) return;

  d3.select("svg").remove();
  svgContainer = d3.select(targetId).append("svg").attr("width", 800).attr("height", 300);

  var norm = IEEE754Encoding(value);
  draw(norm.sign, "#DADEE2", "#4679BD", 0, 50);
  draw(norm.exponent, "#DADEE2", "#DE407D", 30, 50);
  draw(norm.mantis, "#DADEE2", "#4679BD", 250, 50);

  var normDouble = IEEE754Encoding(value, true);
  draw(normDouble.sign, "#DADEE2", "#4679BD", 0, 200);
  draw(normDouble.exponent, "#DADEE2", "#DE407D", 30, 200);
  draw(normDouble.mantis, "#DADEE2", "#4679BD", 300, 200);
});

function draw(bits, color1, color2, padX, padY) {
    var w = 10;

    for (var i=0;i<bits.length; i++) {
        var v = bits[i];
        var x = 2*i*w;

        svgContainer.append("rect")
		.attr("x", x+padX).attr("y", 10+padY)
		.attr("width", w).attr("height", 10)
        .style("fill", function(d, i) {
          return v === '0' ? color1 : color2;
        });

        drawText(v, x+2+padX, 30+padY, '10px');

    }
}

function drawText(txt, x, y, size) {
    svgContainer.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", ".35em")
        .style("font-size",size)
        .text(txt);
}

// UTILS

// convert number into a binary string
function numToBinaryStr(num) { return (num >>> 0).toString(2); }

// fetch integer number part
function floor(num) { return Math.floor(num); }

// base 2 exponent power
function exp() {
  return function(exp) {
     return Math.pow(2, exp);
  }
}

function fillBits(s, length, suffix) {
    for (var i=0; i<length; i++) {
     if (suffix) {
         s += '0';
     }
     else {
         s = '0' + s;
     }
    }

    return s;
}

function check(exposant, mantis) {
	var check = expBase2(exposant);

    for (var j=0; j<mantis.length; j++) {
     var bit = mantis[j];
     if (bit == 1) {
         check += (bit * expBase2(-(j+1))) * expBase2(exposant);
     }
    }

    console.log('check');
    console.log(check);
}

// max : Math.pow(2, 23) - 1
