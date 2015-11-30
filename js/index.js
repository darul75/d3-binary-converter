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
          low: {value: -128, replace: 0x80},
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
          low: {value: -32768, replace: 0x8000},
          high: {value: 32767, replace: 0x7FFF}
      }
  },
  integer: {
      bits: 32,
      mask: 0xFFFFFFFFFFFF,
      unsigned : {
          low: {value: 0x00, replace: 0x00},
          high: {value: 0xFFFFFFFF, replace: 0xFFFFFFFF}
      },
      signed : {
          low: {value: -2147483648, replace: 0x80000000},
          high: {value: 2147483647, replace: 0x7FFFFFFF}
      }
  }
}

var expBase2 = exp();

/**
 * Encodes in IEEE754.
 * @param {string} number - string representation of number.
 * @param {string} double - precision, single or double (float/double).
 *
 * @return {object} info.
 */
function encoderIEEE754(number, double) {

  var pm = double ? BITS_MANT_DOUBLE: BITS_MANT_SIMPLE;
  var pe = double ? BITS_EXP_DOUBLE : BITS_EXP_SIMPLE;

  if (number > Number.MAX_SAFE_INTEGER) {
    number = ''+Number.MAX_SAFE_INTEGER;
  }

  // integer
  var int = floor(Math.abs(number));
  var bInt = binaryInteger(int);

  // fraction (decimal)
  var bDec = binaryDecimal(number, pm);

  console.log('binary integer part: ' + bInt);
  console.log('binary decimal part: ' + bDec);

  // normalize decimal position to get exponent
  var isZero = false;
  var idx = -1;
  var exposant = bInt.length - 1;
  if (exposant == 0) {
    idx = bDec.indexOf('1') + 1;
    exposant = -idx;
    isZero = true;
  }

  // remove first useless bit
  bDec = !isZero ? bDec : bDec.substring(idx);
  var mantis = bInt.substring(1, bInt.length) + bDec;

  // (51,375)10  = (1, 10011011000)base2x2^5
  console.log('('+number+') base 10 = (1,'+mantis+')base 2 * 2^' +exposant);

  console.log(mantis);

  if (mantis.length < pm) {
      mantis = fillBits(mantis, pm - mantis.length, true);
  }

  check(exposant, mantis);

  // binary exposant
  exposant += double ? 1023 : 127;

  if (number == 0) {
    exposant = 0;
  }

  console.log('final exposant ' + exposant);

  exposant = binaryInteger(exposant);

  console.log('binary exposant ' + exposant);

  if (exposant.length < pe) {
      exposant = fillBits(exposant, pe - exposant.length);
  }

  console.log('binary exposant ' + exposant);

  console.log('IEEE 754 normalisation value ');

  var sign = floor(number) >= 0 ? '0' : '1';

  var finalBits = sign + exposant + mantis;

  console.log(finalBits);

  return {
    sign: sign,
    exponent: exposant,
    mantis: mantis,
    hex: binStringToHex(finalBits).toUpperCase()
  }
}

// http://www.binaryconvert.com/
// https://books.google.fr/books?id=4RChxt67lvwC&pg=PA35&lpg=PA35&dq=javascript+integer+to+binary+representation&source=bl&ots=thZ9FhLTp2&sig=TslfYziR2WFoaUPkrmkgkVZYGt8&hl=fr&sa=X&ved=0ahUKEwjdhrv-ybDJAhXHLhoKHYx7D8M4ChDoAQg_MAQ#v=onepage&q=javascript%20integer%20to%20binary%20representation&f=false
// http://www.theirishpenguin.com/2013/08/02/batshift-crazy-basic-binary-number-representation-in-javascript.html
function charEncoding(number, signed, rules) {
  var positive = false;
  var value = '';

  if (signed) {
    if (number >= rules.signed.high.value) {
      value = '0' + (rules.signed.high.replace >>> 0).toString(2);
      return { value: value, hex: binStringToHex(value).toUpperCase() };
    }

    if (number < rules.signed.low.value) {
      value = (rules.signed.low.replace >>> 0).toString(2);
      return { value: value, hex: binStringToHex(value).toUpperCase() };
    }

  }

  if (!signed) {
    if (number < rules.unsigned.low.value) {
      value = fillBits((rules.unsigned.low.replace >>> 0).toString(2), rules.bits-1);
      return { value: value, hex: binStringToHex(value).toUpperCase() };
    }

    if (number > rules.unsigned.high.value) {
      value = (rules.unsigned.high.value >>> 0).toString(2);
      return { value: value, hex: binStringToHex(value).toUpperCase() };
    }
  }

  var bits = binarySignInteger(number & rules.mask);

  if (signed) {
    value = fillBits(bits, rules.bits-bits.length);
    return { value: value, hex: binStringToHex(value).toUpperCase() };
  }

  value = fillBits(bits, rules.bits - bits.length);

  return { value: value, hex: binStringToHex(value).toUpperCase() };
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
var unsignedIntegerId = '#unsignedInteger';
var signedIntegerId = '#signedInteger';

var svgContainer = d3.select(targetId).append("svg").attr("width", 800).attr("height", 300);
var svgContainerUC = d3.select(unsignedCharId).append("svg").attr("width", 500).attr("height", 150);
var svgContainerSC = d3.select(signedCharId).append("svg").attr("width", 500).attr("height", 150);
var svgContainerUS = d3.select(unsignedShortId).append("svg").attr("width", 500).attr("height", 150);
var svgContainerSS = d3.select(signedShortId).append("svg").attr("width", 500).attr("height", 150);
var svgContainerUI = d3.select(unsignedIntegerId).append("svg").attr("width", 650).attr("height", 150);
var svgContainerSI = d3.select(signedIntegerId).append("svg").attr("width", 650).attr("height", 150);

drawText(svgContainer, 'Float (IEEE754 Single precision 32-bit)', 0, 20, '30px');
drawText(svgContainer, 'Double (IEEE754 Double precision 64-bit)', 0, 150, '30px');
drawText(svgContainerUC, 'Unsigned Char (8-bit)', 0, 20, '30px');
drawText(svgContainerSC, 'Signed Char (8-bit)', 0, 20, '30px');
drawText(svgContainerUS, 'Unsigned Short (16-bit)', 0, 20, '30px');
drawText(svgContainerSS, 'Signed Short (16-bit)', 0, 20, '30px');
drawText(svgContainerUI, 'Unsigned Integer (32-bit)', 0, 20, '30px');
drawText(svgContainerSI, 'Signed Integer (32-bit)', 0, 20, '30px');

var value = 2.25;

var norm = encoderIEEE754(value);
draw(svgContainer, norm.sign, "#BDD4B3", "#159957", 0, 50);
draw(svgContainer, norm.exponent, "#DADEE2", "#DE407D", 30, 50);
draw(svgContainer, norm.mantis, "#DADEE2", "#4679BD", 250, 50);
drawText(svgContainer, '0x' + norm.hex, 0, 110, '15px');

var normDouble = encoderIEEE754(value, true);
draw(svgContainer, normDouble.sign, "#BDD4B3", "#159957", 0, 200);
draw(svgContainer, normDouble.exponent, "#DADEE2", "#DE407D", 30, 200);
draw(svgContainer, normDouble.mantis, "#DADEE2", "#4679BD", 300, 200);
drawText(svgContainer, '0x' + normDouble.hex, 0, 260, '15px');

var int = floor(value);

var charUnsigned = charEncoding(int, false, TYPES_BOUND.char);
var charSigned = charEncoding(int, true, TYPES_BOUND.char);
var shortUnsigned = charEncoding(int, false, TYPES_BOUND.short);
var shortSigned = charEncoding(int, true, TYPES_BOUND.short);
var intUnsigned = charEncoding(int, false, TYPES_BOUND.integer);
var intSigned = charEncoding(int, true, TYPES_BOUND.integer);

draw(svgContainerUC, charUnsigned.value, "#DADEE2", "#DE407D", 0, 50);
drawText(svgContainerUC, '0x' + charUnsigned.hex, 0, 110, '15px');

draw(svgContainerSC, charSigned.value, "#DADEE2", "#DE407D", 0, 50);
drawText(svgContainerSC, '0x' + charSigned.hex, 0, 110, '15px');

draw(svgContainerUS, shortUnsigned.value, "#DADEE2", "#DE407D", 0, 50);
drawText(svgContainerUS, '0x' + shortUnsigned.hex, 0, 110, '15px');

draw(svgContainerSS, shortSigned.value, "#DADEE2", "#DE407D", 0, 50);
drawText(svgContainerSS, '0x' + shortSigned.hex, 0, 110, '15px');

draw(svgContainerUI, intUnsigned.value, "#DADEE2", "#DE407D", 0, 50);
drawText(svgContainerUI, '0x' + intUnsigned.hex, 0, 110, '15px');

draw(svgContainerSI, intSigned.value, "#DADEE2", "#DE407D", 0, 50);
drawText(svgContainerSI, '0x' + intSigned.hex, 0, 110, '15px');

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
  d3.select(unsignedIntegerId).select("svg").remove();
  d3.select(signedIntegerId).select("svg").remove();

  svgContainer = d3.select(targetId).append("svg").attr("width", 800).attr("height", 300);
  svgContainerUC = d3.select(unsignedCharId).append("svg").attr("width", 500).attr("height", 150);
  svgContainerSC = d3.select(signedCharId).append("svg").attr("width", 500).attr("height", 150);
  svgContainerUS = d3.select(unsignedShortId).append("svg").attr("width", 500).attr("height", 150);
  svgContainerSS = d3.select(signedShortId).append("svg").attr("width", 500).attr("height", 150);
  svgContainerUI = d3.select(unsignedIntegerId).append("svg").attr("width", 650).attr("height", 150);
  svgContainerSI = d3.select(signedIntegerId).append("svg").attr("width", 650).attr("height", 150);

  drawText(svgContainer, 'Float (IEEE754 Single precision 32-bit)', 0, 20, '30px');
  drawText(svgContainer, 'Double (IEEE754 Double precision 64-bit)', 0, 150, '30px');
  drawText(svgContainerUC, 'Unsigned Char (8-bit)', 0, 20, '30px');
  drawText(svgContainerSC, 'Signed Char (8-bit)', 0, 20, '30px');
  drawText(svgContainerUS, 'Unsigned Short (16-bit)', 0, 20, '30px');
  drawText(svgContainerSS, 'Signed Short (16-bit)', 0, 20, '30px');
  drawText(svgContainerUI, 'Unsigned Integer (32-bit)', 0, 20, '30px');
  drawText(svgContainerSI, 'Signed Integer (32-bit)', 0, 20, '30px');

  var norm = encoderIEEE754(value);
  draw(svgContainer, norm.sign, "#BDD4B3", "#159957", 0, 50);
  draw(svgContainer, norm.exponent, "#DADEE2", "#DE407D", 30, 50);
  draw(svgContainer, norm.mantis, "#DADEE2", "#4679BD", 250, 50);
  drawText(svgContainer, '0x' + norm.hex, 0, 110, '15px');

  var normDouble = encoderIEEE754(value, true);
  draw(svgContainer, normDouble.sign, "#BDD4B3", "#159957", 0, 200);
  draw(svgContainer, normDouble.exponent, "#DADEE2", "#DE407D", 30, 200);
  draw(svgContainer, normDouble.mantis, "#DADEE2", "#4679BD", 300, 200);
  drawText(svgContainer, '0x' + normDouble.hex, 0, 260, '15px');

  var charUnsigned = charEncoding(int, false, TYPES_BOUND.char);
  draw(svgContainerUC, charUnsigned.value, "#DADEE2", "#DE407D", 0, 50);
  drawText(svgContainerUC, '0x' + charUnsigned.hex, 0, 110, '15px');

  var charSigned = charEncoding(int, true, TYPES_BOUND.char);
  draw(svgContainerSC, charSigned.value, "#DADEE2", "#DE407D", 0, 50);
  drawText(svgContainerSC, '0x' + charSigned.hex, 0, 110, '15px');

  var shortUnsigned = charEncoding(int, false, TYPES_BOUND.short);
  draw(svgContainerUS, shortUnsigned.value, "#DADEE2", "#DE407D", 0, 50);
  drawText(svgContainerUS, '0x' + shortUnsigned.hex, 0, 110, '15px');

  var shortSigned = charEncoding(int, true, TYPES_BOUND.short);
  draw(svgContainerSS, shortSigned.value, "#DADEE2", "#DE407D", 0, 50);
  drawText(svgContainerSS, '0x' + shortSigned.hex, 0, 110, '15px');

  var intUnsigned = charEncoding(int, false, TYPES_BOUND.integer);
  draw(svgContainerUI, intUnsigned.value, "#DADEE2", "#DE407D", 0, 50);
  drawText(svgContainerUI, '0x' + intUnsigned.hex, 0, 110, '15px');

  var intSigned = charEncoding(int, true, TYPES_BOUND.integer);
  draw(svgContainerSI, intSigned.value, "#DADEE2", "#DE407D", 0, 50);
  drawText(svgContainerSI, '0x' + intSigned.hex, 0, 110, '15px');

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

/**
 * Encodes integer number's part into binary.
 .
 * @param {string} number - string representation of number.
 * @param {string} double - precision, single or double (float/double).
 *
 * @return {string} binary string.
 */
function binaryInteger(num) {
  return (num).toString(2);
  //return (num >>> 0).toString(2);
}

function binarySignInteger(num) {
  return (num >>> 0).toString(2);
}


/**
 * Encodes decimal number's part into binary.
 .
 * @param {string} number - string representation of number.
 * @param {string} double - precision, single or double (float/double).
 *
 * @return {string} binary string.
 */
function binaryDecimal(number, precision) {
  var int = floor(Math.abs(number));
  var bInt = binaryInteger(int);
  var numberStr = ''+number,

  fraction = numberStr.substring(numberStr.indexOf('.')).trim(),
  bDec = '',
  i = 0,
  space = precision - bInt.length; // mantissa free space

  if (numberStr.indexOf('.') >= 0 && fraction > 0) {
    while (i++ <= space) {
      var value = fraction * 2;
      bDec += '' + floor(value);

      if (value === 1) break;

      var valueStr = ''+value;
      fraction = valueStr.substring(valueStr.indexOf('.')).trim();
    }
  }

  return bDec;
}

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

function binStringToHex(s) {

  var pattern = /([0|1]{4})/g;

  return s.replace(pattern, function(match, i) {
    return parseInt(match, 2).toString(16);
  });
}

// max : Math.pow(2, 23) - 1
