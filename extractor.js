function extractVideo(videoId) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.youtube.com/watch?v=" + videoId, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                var html = xhr.responseText;
                var marker = "ytInitialPlayerResponse = ";
                var start = html.indexOf(marker);
                if (start !== -1) {
                    start += marker.length;
                    var end = html.indexOf("};", start) + 1;
                    var jsonStr = html.substring(start, end);
                    var data = JSON.parse(jsonStr);

                    if (window.AndroidBridge) {
                        window.AndroidBridge.onResult(JSON.stringify(data.streamingData || {}));
                    }
                    return;
                }
                if (window.AndroidBridge) {
                    window.AndroidBridge.onError("Data streamingData tidak ditemukan di HTML.");
                }
            } else {
                if (window.AndroidBridge) {
                    window.AndroidBridge.onError("Gagal muat web YouTube, HTTP status: " + xhr.status);
                }
            }
        };
        xhr.onerror = function() {
            if (window.AndroidBridge) {
                window.AndroidBridge.onError("Koneksi jaringan WebView putus.");
            }
        };
        xhr.send();
    } catch (e) {
        if (window.AndroidBridge) {
            window.AndroidBridge.onError("Pengecualian JavaScript: " + e.message);
        }
    }
}
