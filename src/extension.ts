import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("tiny8bit.start", () => {
            const panel = vscode.window.createWebviewPanel(
                'tiny8bit',
                'Tiny8Bit',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
                }
            );
            const onDiskPath = vscode.Uri.file(
                path.join(context.extensionPath, 'media', 'cpc-ui.js')
            );
            const url = panel.webview.asWebviewUri(onDiskPath).toString();
            panel.webview.html = getWebViewContent(url);
        })
    );
}

function getWebViewContent(url: string) {
    return `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/>
<title>Tiny Emulators</title>
<link rel="icon" type="image/png" href="favicon.png"/>
<style type="text/css">
body {
    margin: 0;
    background-color: black;
}
.game {
    position: absolute;
    top: 0px;
    left: 0px;
    margin: 0px;
    border: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: block;
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -o-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    -ms-interpolation-mode: nearest-neighbor; 
}
</style>
</head>
<body>
  <canvas class="game" id="canvas" oncontextmenu="event.preventDefault()"></canvas>
  <script type="text/javascript">
    var Module = {
        preRun: [],
        postRun: [
            function() {
                init_drag_and_drop();
            },
        ],
        print: (function() {
            return function(text) {
                text = Array.prototype.slice.call(arguments).join(' ');
                console.log(text);
            };
        })(),
        printErr: function(text) {
            text = Array.prototype.slice.call(arguments).join(' ');
            console.error(text);
        },
        canvas: (function() {
            var canvas = document.getElementById('canvas');
            canvas.addEventListener("webglcontextlost", function(e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);
            return canvas;
        })(),
        setStatus: function(text) { },
        monitorRunDependencies: function(left) { },
    };
    window.onerror = function(event) {
        console.log("onerror: " + event);
    };
    function id(id) {
        return document.getElementById(id);
    }
    function init_drag_and_drop() {
        id('canvas').addEventListener('dragenter', load_dragenter, false);
        id('canvas').addEventListener('dragleave', load_dragleave, false);
        id('canvas').addEventListener('dragover', load_dragover, false);
        id('canvas').addEventListener('drop', load_drop, false);
    }
    function load_dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    function load_dragleave(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    function load_dragover(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    function load_drop(e) {
        e.stopPropagation();
        e.preventDefault();
        load_file(e.dataTransfer.files);
    }
    function load_file(files) {
        if (files.length > 0) {
            let file = files[0];
            if (file.size < (1024*1024)) {
                let reader = new FileReader();
                reader.onload = function(loadEvent) {
                    console.log('file loaded!')
                    let content = loadEvent.target.result;
                    if (content) {
                        console.log('content length: ' + content.byteLength);
                        let uint8Array = new Uint8Array(content);
                        let res = Module['ccall']('emsc_load_data',
                            'int',
                            ['string', 'array', 'number'],  // name, data, size
                            [file.name, uint8Array, uint8Array.length]);
                        if (res == 0) {
                            console.warn('emsc_loadfile() failed!');
                        } 
                    }
                    else {
                        console.warn('load result empty!');
                    }
                };
                reader.readAsArrayBuffer(file);
            }
            else {
                console.warn('ignoring dropped file because it is too big')
            }
        }
    }
  </script>
  <script async type="text/javascript" src="${url}"></script>
</body>
</html>`
}

export function deactivate() {}
