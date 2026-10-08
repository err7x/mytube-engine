function extractVideo(videoId) {
    try {
        console.log("Memulai XHR untuk videoId: " + videoId);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.youtube.com/watch?v=" + videoId, true);
        
        xhr.onload = function() {
            console.log("XHR selesai dengan HTTP status: " + xhr.status);
            if (xhr.status === 200) {
                var html = xhr.responseText;
                var marker = "ytInitialPlayerResponse = ";
                var start = html.indexOf(marker);

                if (start === -1) {
                    marker = "var ytInitialPlayerResponse = ";
                    start = html.indexOf(marker);
                }

                if (start !== -1) {
                    start += marker.length;
                    var end = html.indexOf("};", start);
                    if (end === -1) end = html.indexOf(";</script>", start);
                    
                    if (end !== -1) {
                        var jsonStr = html.substring(start, end + 1);
                        var data = JSON.parse(jsonStr);

                        if (window.AndroidBridge) {
                            window.AndroidBridge.onResult(JSON.stringify(data.streamingData || {}));
                        }
                        return;
                    }
                }

                console.log("Marker ytInitialPlayerResponse nggak ketemu di HTML");
                if (window.AndroidBridge) {
                    window.AndroidBridge.onError("Data streaming video nggak ditemukan di HTML.");
                }
            } else {
                if (window.AndroidBridge) {
                    window.AndroidBridge.onError("Gagal memuat YouTube, kode status: " + xhr.status);
                }
            }
        };

        xhr.onerror = function() {
            console.log("XHR onerror terpanggil");
            if (window.AndroidBridge) {
                window.AndroidBridge.onError("Koneksi jaringan WebView terputus.");
            }
        };

        xhr.send();
    } catch (e) {
        console.log("Pengecualian: " + e.message);
        if (window.AndroidBridge) {
            window.AndroidBridge.onError("Pengecualian JS: " + e.message);
        }
    }
}
