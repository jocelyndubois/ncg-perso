function colorToRgba(color, forcedAlpha = null)
{
	let alpha = color._a;
	if (forcedAlpha) {
		alpha = forcedAlpha;
	}
	return 'rgba(' + parseInt(color._r) + ', ' + parseInt(color._g) + ', ' + parseInt(color._b) + ', ' + alpha + ')';
}
