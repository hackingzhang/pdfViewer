# pdfViewer
一个使用AngularJS1.x编写的简单的pdf文档阅读器指令封装  

### Notice:
此模块依赖于pdf.js,详细信息请访问 <https://github.com/mozilla/pdf.js>

### Usage:
1. 引入依赖的JS和CSS
>`<link rel="stylesheet" type="text/css" href="pdfViewer.css">`  
`<script type="text/javascript" src="angular.min.js"></script>`  
`<script type="text/javascript" src="pdf.min.js"></script>`  
2. 引入pdfViewer.js  
>`<script type="text/javascript" src=""></script>`  
3. 在angular种申明依赖  
>`var app = angular.module('myApp', ['pdfViewer']);`  
4. 使用指令
>`<pdf-viewer pdf-url="path/to/file.pdf"></pdf-viewer>`
