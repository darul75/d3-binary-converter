var BITS_MANT_SIMPLE = 23;
var BITS_MANT_DOUBLE = 52;

var BITS_EXP_SIMPLE = 8;
var BITS_EXP_DOUBLE = 11;

var TYPES_BOUND = {
  char: {
      bits: 8,
      mask: 0xFF,
      unsigned : {
          low: {value: 0x00, replace: 0x00},
          high: {value: 0xFF, replace: 0xFF}
      },
      signed : {
          low: {value: -127, replace: 0x81},
          high: {value: 0x7F, replace: 0x7F}
      }
  },
  short: {
      bits: 16,
      mask: 0xFFFF,
      unsigned : {
          low: {value: 0x00, replace: 0x00},
          high: {value: 0xFFFF, replace: 0xFFFF}
      },
      signed : {
          low: {value: -32767, replace: 0x8001},
          high: {value: 32767, replace: 0x7FFF}
      }
  }
}

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

// http://www.binaryconvert.com/
// https://books.google.fr/books?id=4RChxt67lvwC&pg=PA35&lpg=PA35&dq=javascript+integer+to+binary+representation&source=bl&ots=thZ9FhLTp2&sig=TslfYziR2WFoaUPkrmkgkVZYGt8&hl=fr&sa=X&ved=0ahUKEwjdhrv-ybDJAhXHLhoKHYx7D8M4ChDoAQg_MAQ#v=onepage&q=javascript%20integer%20to%20binary%20representation&f=false
// http://www.theirishpenguin.com/2013/08/02/batshift-crazy-basic-binary-number-representation-in-javascript.html
function charEncoding(number, signed, rules) {
  var positive = false;

  if (signed) {
    if (number >= rules.signed.high.value) {
      return '0' + (rules.signed.high.replace >>> 0).toString(2);
    }

    if (number < rules.signed.low.value) {
      return (rules.signed.low.replace >>> 0).toString(2);
    }

  }

  if (!signed) {
    if (number < rules.unsigned.low.value) {
      return fillBits((rules.unsigned.low.replace >>> 0).toString(2), rules.bits-1);
    }

    if (number > rules.unsigned.high.value) {
      return (rules.unsigned.high.value >>> 0).toString(2);
    }
  }

  var bits = ((Math.abs(number) & rules.mask) >>> 0).toString(2);

  if (signed) {
    return number > 0 ? '0' + fillBits(bits, rules.bits-1-bits.length) : '1' + fillBits(bits, rules.bits-1 - bits.length);
  }

  return fillBits(bits, rules.bits - bits.length);
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
var unsignedCharId = '#unsignedChar';
var signedCharId = '#signedChar';
var unsignedShortId = '#unsignedShort';
var signedShortId = '#signedShort';

var svgContainer = d3.select(targetId).append("svg").attr("width", 800).attr("height", 300);
var svgContainerUC = d3.select(unsignedCharId).append("svg").attr("width", 500).attr("height", 100);
var svgContainerSC = d3.select(signedCharId).append("svg").attr("width", 500).attr("height", 100);
var svgContainerUS = d3.select(unsignedShortId).append("svg").attr("width", 500).attr("height", 100);
var svgContainerSS = d3.select(signedShortId).append("svg").attr("width", 500).attr("height", 100);

drawText(svgContainer, 'Float (IEEE754 Single precision 32-bit)', 0, 20, '30px');
drawText(svgContainer, 'Double (IEEE754 Double precision 64-bit)', 0, 150, '30px');
drawText(svgContainerUC, 'Unsigned char (8-bit)', 0, 20, '30px');
drawText(svgContainerSC, 'Signed char (8-bit)', 0, 20, '30px');
drawText(svgContainerUS, 'Unsigned char (16-bit)', 0, 20, '30px');
drawText(svgContainerSS, 'Signed char (16-bit)', 0, 20, '30px');

var value = 2.25;

var norm = IEEE754Encoding(value);
draw(svgContainer, norm.sign, "#BDD4B3", "#159957", 0, 50);
draw(svgContainer, norm.exponent, "#DADEE2", "#DE407D", 30, 50);
draw(svgContainer, norm.mantis, "#DADEE2", "#4679BD", 250, 50);

var normDouble = IEEE754Encoding(value, true);
draw(svgContainer, normDouble.sign, "#BDD4B3", "#159957", 0, 200);
draw(svgContainer, normDouble.exponent, "#DADEE2", "#DE407D", 30, 200);
draw(svgContainer, normDouble.mantis, "#DADEE2", "#4679BD", 300, 200);

var int = floor(value);

var charUnsigned = charEncoding(int, false, TYPES_BOUND.char);
var charSigned = charEncoding(int, true, TYPES_BOUND.char);
var shortUnsigned = charEncoding(int, false, TYPES_BOUND.short);
var shortSigned = charEncoding(int, true, TYPES_BOUND.short);

draw(svgContainerUC, charUnsigned, "#DADEE2", "#DE407D", 0, 50);
draw(svgContainerSC, charSigned, "#DADEE2", "#DE407D", 0, 50);

draw(svgContainerUS, shortUnsigned, "#DADEE2", "#DE407D", 0, 50);
draw(svgContainerSS, shortSigned, "#DADEE2", "#DE407D", 0, 50);

// when the input range changes update value
d3.select("#number").on("input", function() {
  var value = this.value;

  if (isNaN(value)) return;

  var int = floor(value);

  d3.select(targetId).select("svg").remove();
  d3.select(unsignedCharId).select("svg").remove();
  d3.select(signedCharId).select("svg").remove();
  d3.select(unsignedShortId).select("svg").remove();
  d3.select(signedShortId).select("svg").remove();

  svgContainer = d3.select(targetId).append("svg").attr("width", 800).attr("height", 300);
  svgContainerUC = d3.select(unsignedCharId).append("svg").attr("width", 500).attr("height", 100);
  svgContainerSC = d3.select(signedCharId).append("svg").attr("width", 500).attr("height", 100);

  drawText(svgContainer, 'Float (IEEE754 Single precision 32-bit)', 0, 20, '30px');
  drawText(svgContainer, 'Double (IEEE754 Double precision 64-bit)', 0, 150, '30px');
  drawText(svgContainerUC, 'Unsigned char (8-bit)', 0, 20, '30px');
  drawText(svgContainerSC, 'Signed char (8-bit)', 0, 20, '30px');

  var norm = IEEE754Encoding(value);
  draw(svgContainer, norm.sign, "#BDD4B3", "#159957", 0, 50);
  draw(svgContainer, norm.exponent, "#DADEE2", "#DE407D", 30, 50);
  draw(svgContainer, norm.mantis, "#DADEE2", "#4679BD", 250, 50);

  var normDouble = IEEE754Encoding(value, true);
  draw(svgContainer, normDouble.sign, "#BDD4B3", "#159957", 0, 200);
  draw(svgContainer, normDouble.exponent, "#DADEE2", "#DE407D", 30, 200);
  draw(svgContainer, normDouble.mantis, "#DADEE2", "#4679BD", 300, 200);

  var charUnsigned = charEncoding(int, false, TYPES_BOUND.char);
  draw(svgContainerUC, charUnsigned, "#DADEE2", "#DE407D", 0, 50);

  var charSigned = charEncoding(int, true, TYPES_BOUND.char);
  draw(svgContainerSC, charSigned, "#DADEE2", "#DE407D", 0, 50);

  var shortUnsigned = charEncoding(int, false, TYPES_BOUND.short);
  draw(svgContainerUS, shortUnsigned, "#DADEE2", "#DE407D", 0, 50);

  var shortSigned = charEncoding(int, true, TYPES_BOUND.short);
  draw(svgContainerSS, shortSigned, "#DADEE2", "#DE407D", 0, 50);

});

function draw(container, bits, color1, color2, padX, padY) {
  var w = 10;

  for (var i=0;i<bits.length; i++) {
    var v = bits[i];
    var x = 2*i*w;

    container.append("rect")
      .attr("x", x+padX).attr("y", 10+padY)
      .attr("width", w).attr("height", 10)
      .style("fill", function(d, i) {
        return v === '0' ? color1 : color2;
      });

    drawText(container, v, x+2+padX, 30+padY, '10px');
  }
}

function drawText(container, txt, x, y, size) {
  container.append("text").attr("x", x).attr("y", y).attr("dy", ".35em").style("font-size",size).text(txt);
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
