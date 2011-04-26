/*
 * jsAscii 0.1
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * MIT License [http://www.nihilogic.dk/licenses/mit-license.txt]
 */

var jsAscii = (function() {

	var aDefaultCharList = (" .,:;i1tfLCG08@").split("");
	var aDefaultColorCharList = (" CGO08@").split("");
	var strFont = "courier new";


	// convert img element to ascii
	function asciifyImage(oImg, oCanvasImg, opt)  {
		var oCanvas = document.createElement("canvas");
		if (!oCanvas.getContext) {
			return;
		}
		var oCtx = oCanvas.getContext("2d");
		if (!oCtx.getImageData) {
			return;
		}
		opt = opt || {}
		var iScale = parseInt(opt.scale) || 1;
		var bColor = opt.color == true;
		var bAlpha = opt.alpha == true;
		var bBlock = opt.block == true;
		var bInvert = opt.invert == true;
		var strResolution = opt.res || "medium";
		var aCharList = opt.chars || 
			(bColor ? aDefaultColorCharList : aDefaultCharList);

		var fResolution = 0.5;
		if( strResolution < 1.0 && strResolution > 0.1 ) {
			fResolution = strResolution;
			strResolution = "low";
			
		} else {
			switch (strResolution) {
				case "low" : 	fResolution = 0.25; break;
				case "medium" : fResolution = 0.5; break;
				case "high" : 	fResolution = 1; break;
			}
		}
		

		var iWidth = Math.round(parseInt(oImg.offsetWidth) * fResolution);
		var iHeight = Math.round(parseInt(oImg.offsetHeight) * fResolution);

		oCanvas.width = iWidth;
		oCanvas.height = iHeight;
		oCanvas.style.display = "none";
		oCanvas.style.width = iWidth;
		oCanvas.style.height = iHeight;

		oCtx.drawImage(oCanvasImg, 0, 0, iWidth, iHeight);
		try {
			var oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data;
		} catch (err) {
			//console.log(err, oCanvasImg);
			return;
		}
		
	
		var strChars = "",y,x;
		
		for (y=0;y<iHeight;y+=2) {
			for (x=0;x<iWidth;x++) {
				var iOffset = (y*iWidth + x) * 4;
	
				var iRed = oImgData[iOffset];
				var iGreen = oImgData[iOffset + 1];
				var iBlue = oImgData[iOffset + 2];
				var iAlpha = oImgData[iOffset + 3];
	
				if (iAlpha == 0) {
					var iBrightIdx = 0;
				} else {
					var fBrightness = (0.3*iRed + 0.59*iGreen + 0.11*iBlue) / 255;
					var iCharIdx = (aCharList.length-1) - Math.round(fBrightness * (aCharList.length-1));
				}

				if (bInvert) {
					iCharIdx = (aCharList.length-1) - iCharIdx;
				}
				var strThisChar = aCharList[iCharIdx];

				if (strThisChar == " ") 
					strThisChar = "&nbsp;";

				if (bColor) {
					strChars += "<span style='"
						+ "color:rgb("+iRed+","+iGreen+","+iBlue+");"
						+ (bBlock ? "background-color:rgb("+iRed+","+iGreen+","+iBlue+");" : "")
						+ (bAlpha ? "opacity:" + (iAlpha/255) + ";" : "")
						+ "'>" + strThisChar + "</span>";
				} else {
					strChars += strThisChar;
				}
			}
			strChars += "<br/>";
		}
	
	
		var fFontSize = (2/fResolution)*iScale;
		var fLineHeight = (2/fResolution)*iScale;

		// adjust letter-spacing for all combinations of scale and resolution to get it to fit the image width.
		var fLetterSpacing = 0;
		if (strResolution == "low") {
			switch (iScale) {
				case 1 : fLetterSpacing = -1; break;
				case 2 : 
				case 3 : fLetterSpacing = -2.1; break;
				case 4 : fLetterSpacing = -3.1; break;
				case 5 : fLetterSpacing = -4.15; break;
			}
		} else if (strResolution == "medium") {
			switch (iScale) {
				case 1 : fLetterSpacing = 0; break;
				case 2 : fLetterSpacing = -1; break;
				case 3 : fLetterSpacing = -1.04; break;
				case 4 : 
				case 5 : fLetterSpacing = -2.1; break;
			}
		} else if (strResolution == "high") {
			switch (iScale) {
				case 1 : 
				case 2 : fLetterSpacing = 0; break;
				case 3 : 
				case 4 : 
				case 5 : fLetterSpacing = -1; break;
			}
		}


		// can't get a span or div to flow like an img element, but a table works?
		var oAscii = document.createElement("table");
		oAscii.innerHTML = "<tr><td>" + strChars + "</td></tr>";

		if (oImg.style.backgroundColor) {
			oAscii.rows[0].cells[0].style.backgroundColor = oImg.style.backgroundColor;
			oAscii.rows[0].cells[0].style.color = oImg.style.color;
		}

		oAscii.cellSpacing = 0;
		oAscii.cellPadding = 0;

		var oStyle = oAscii.style;
		oStyle.display = "inline";
		oStyle.width = Math.round(iWidth/fResolution*iScale) + "px";
		oStyle.height = Math.round(iHeight/fResolution*iScale) + "px";
		oStyle.whiteSpace = "pre";
		oStyle.margin = "0px";
		oStyle.padding = "0px";
		oStyle.letterSpacing = fLetterSpacing + "px";
		oStyle.fontFamily = strFont;
		oStyle.fontSize = fFontSize + "px";
		oStyle.lineHeight = fLineHeight + "px";
		oStyle.textAlign = "left";
		oStyle.textDecoration = "none";

		oImg.parentNode.replaceChild(oAscii, oImg);

	}

	// load the image file
	function asciifyImageLoad(oImg, opt) {
		var oCanvasImg = new Image();
		oCanvasImg.src = oImg.src;
		if (oCanvasImg.complete) {
			asciifyImage(oImg, oCanvasImg);
		} else {
			oCanvasImg.onload = function() {
				asciifyImage(oImg, oCanvasImg, opt)
			}
		}
	}

	return asciifyImageLoad;
})();