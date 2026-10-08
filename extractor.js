function findBraceEnd(s, start) {
    var depth = 0;
    var inQuote = false;
    var prev = '';
    for (var i = start; i < s.length; i++) {
        var c = s.charAt(i);
        if (c === '"' && prev !== '\\') {
            inQuote = !inQuote;
        } else if (!inQuote) {
            if (c === '{') depth++;
            else if (c === '}') {
                depth--;
                if (depth === 0) return i;
            }
        }
        prev = c;
    }
    return -1;
}

function extractVideo(videoId) {
    try {
        console.log("Memulai XHR untuk videoId: " + videoId);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.youtube.com/watch?v=" + videoId, true);
        
        xhr.onload = function() {
            console.log("XHR status: " + xhr.status);
            if (xhr.status === 200) {
                var html = xhr.responseText;
                var marker = "ytInitialPlayerResponse";
                var start = html.indexOf(marker);

                if (start !== -1) {
                    var braceStart = html.indexOf("{", start);
                    if (braceStart !== -1) {
                        var braceEnd = findBraceEnd(html, braceStart);
                        if (braceEnd !== -1) {
                            var jsonStr = html.substring(braceStart, braceEnd + 1);
                            var data = JSON.parse(jsonStr);
                            console.log("Data streaming berhasil diambil");

                            if (window.AndroidBridge) {
                                window.AndroidBridge.onResult(JSON.stringify(data.streamingData || {}));
                            }
                            return;
                        }
                    }
                }

                if (window.AndroidBridge) {
                    window.AndroidBridge.onError("Format streamingData nggak ketemu di halaman.");
                }
            } else {
                if (window.AndroidBridge) {
                    window.AndroidBridge.onError("Gagal memuat halaman, kode HTTP: " + xhr.status);
                }
            }
        };

        xhr.onerror = function() {
            if (window.AndroidBridge) {
                window.AndroidBridge.onError("Jaringan WebView putus.");
            }
        };

        xhr.send();
    } catch (e) {
        if (window.AndroidBridge) {
            window.AndroidBridge.onError("Galat JS: " + e.message);
        }
    }
}
