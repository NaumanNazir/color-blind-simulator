var loadingIndicator = document.getElementById('loadingIndicator');
function filterOrImageChanged() {
    var type = document.querySelector('input[name = "colorblindType"]:checked').value;
    var usehcirn = document.getElementById("usehcirn").checked;
    var filterName = (usehcirn ? "hcirn" : "simpl") + type;
    console.log("filterOrImageChanged: " + filterName);

    document.getElementById('imageLink').style.display = type === "Normal" ? "none" : "inline";

    if (currentImage) {
        loadingIndicator.style.display="inline";
        NProgress.set(0.2);
        setTimeout(function () {
            getFilteredImage(currentImage, filterName, function (filteredImage, url) {
                document.getElementById('imageLink').href = url;
                panZoomImage.displayImage(filteredImage);
                NProgress.done();
                loadingIndicator.style.display="none";
            });
        }, 0);
    }
}

function lensChanged() {
    var v = document.querySelector('input[name = "lens"]:checked').value;
    if (v === "No") {
        panZoomImage.lens = 0;
    } else if (v === "Normal") {
        panZoomImage.lens = 1;
    } else if (v === "Inverse") {
        panZoomImage.lens = 2;
    } else {
        throw "Illegal Lens Type";
    }
    panZoomImage.redraw();
}
(function() {
    var radios = document.querySelectorAll('input[name = "colorblindType"]');
    var i;
    for (i = 0; i < radios.length; i++) {
        radios[i].onclick = filterOrImageChanged;
    }
    radios = document.querySelectorAll('input[name = "lens"]');
    for (i = 0; i < radios.length; i++) {
        radios[i].onclick = lensChanged;
    }
    document.getElementById("usehcirn").onclick = filterOrImageChanged;
})();

//Based on http://stackoverflow.com/a/3814285/2256700
var fileInput = document.getElementById('fileInput');
var currentImage;
fileInput.onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;
    readFile(files);
};

function readFile(files) {
    document.getElementById("aboutBox").style.display = "none";
    // FileReader support
    if (FileReader && files && files.length) {
        if (files.length !== 1) {
            alert("Can only show one file at a time");
            return;
        }
        if (!files[0].type.match('image.*')) {
            alert("Was not an image file. :(");
            return;
        }
        NProgress.set(0.0);
        var fr = new FileReader();
        fr.onload = function () {
            var img = new Image();
            img.onload = function () {
                //createFilteredImage(this);
                currentImage = this;
                panZoomImage.setHiddenLensImage(currentImage);
                clearImageCache();
                filterOrImageChanged();
            };
            img.src = fr.result;
        };
        fr.readAsDataURL(files[0]);
    }
    // Not supported
    else {
        alert("Your Browser does not support the required Features.");
    }
}
var canvasDiv = document.getElementById("canvasDiv");
var dropNotification = document.getElementById("dropNotification");
// Based on http://www.html5rocks.com/en/tutorials/file/dndfiles/
canvasDiv.addEventListener('drop', function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    dropNotification.style.display = "none";
    readFile(evt.dataTransfer.files);
}, false);

canvasDiv.addEventListener('dragover', function (evt) {
    document.getElementById("aboutBox").style.display = "none";
    evt.stopPropagation();
    evt.preventDefault();
    dropNotification.style.display = "block";
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}, false);

canvasDiv.addEventListener('dragleave', function (evt) {
    dropNotification.style.display = "none";
}, false);

//Retrieve Image from Clipboard: http://stackoverflow.com/a/15369753/2256700
document.onpaste = function (event) {
    // use event.originalEvent.clipboard for newer chrome versions
    var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
    // find pasted image among pasted items
    var blob = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
        }
    }
    // load image if there is a pasted image
    if (blob !== null) {
        readFile([blob]);
    }
};