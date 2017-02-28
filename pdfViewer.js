/**
 * ngPdf.js -- a simple pdf viewer for angularjs1.x
 * 
 * 注意：此模块依赖于 pdf.js, 你可以在以下网址找到 pdf.js 的代码和文档
 * http://mozilla.github.io/pdf.js/
 * 
 * 在使用本模块前，请确保你已经设置好了 PDFJS:
 * PDFJS.workerSrc = 'path/to/pdf.worker.js';
 * PDFJS.cMapUrl = 'path/to/directory of cmapfile';
 * PDFJS.cMapPacked = true;
 */
angular.module('pdfViewer', [])
.run(['$templateCache', function($templateCache){
	$templateCache.put('pdf-viewer.html', 
		'<div class="pdfviewer-toolbar">' +
			'<button ng-click="load()">重新加载</button>' +
			'<button ng-click="zoomIn()"> + </button>' +
			'<span>{{ scale | percentage }}</span>' +
			'<button ng-click="zoomOut()"> - </button>' +
			'<button ng-click="previousPage()">上一页</button>' +
			'<button ng-click="nextPage()">下一页</button>' +
			'<input type="number" ng-model="currentPage"> / {{ pages }}' +
			'<button ng-click="gotoPage()">前往</button>' +
		'</div>' +
		'<div class="pdfviewer-container">' +
			'<canvas></canvas>' +
			'<div ng-show="failure" class="pdfviewer-error">' +
				'<p>文档加载失败</p>' +
				'<button ng-click="load()">重新加载</button>' +
			'</div>' +
		'</div>');
}])
.filter('percentage', function(){
	return function(input){
		"use strict";

		try {
			input = parseFloat(input);
			return Math.round(input * 100) + '%';
		} catch(err) {
			return input;
		}
	};
})
.directive('pdfViewer', [function(){
	"use strict";

	return {
		restrict: 'E',
		scope: {
			pdfUrl: '@'
		},
		templateUrl: 'pdf-viewer.html',
		link: function($scope, iElm, iAttrs, controller) {
			var canvas = iElm.find('canvas')[0];	// canvas元素
			var context = canvas.getContext('2d');
			var container = iElm[0].getElementsByClassName('pdfviewer-container')[0];	// canvas容器
			var pdfProxy = null;		// PDFDocumentProxy对象

			$scope.currentPage = 0;	// 当前页
			$scope.pages = 0;		// 总页数
			$scope.scale = 1.5;		// 缩放比例
			$scope.failure = false; // 文档加载失败标记

			// 加载文档
			$scope.load = function load(){
				$scope.failure = false;
				PDFJS.getDocument($scope.pdfUrl).then(function(pdf){
					pdfProxy = pdf;
					$scope.pages = pdf.numPages;
					$scope.currentPage = 1;

					render(1);	// 渲染第一页
					$scope.$apply();	// 触发 $digest 循环， 刷新显示
				}, function(reason){
					$scope.failure = true;
					$scope.$apply();	// 触发 $digest 循环， 刷新显示
				});
			};

			// 渲染页面
			var render = function render(pageNum){
				if(!pageNum) {		// 如果pageNum不存在（未指定页码），默认渲染第一页
					pageNum = 1;
				}

				if(typeof pageNum === 'string'){		// 如果页码为字符串格式，转换为数字
					try{
						pageNum = parseInt(pageNum);
					} catch(err) {
						pageNum = 1;		// 如果转换失败，默认渲染第一页
					}
				}

				pdfProxy.getPage(pageNum).then(function(page){
					var viewport = page.getViewport($scope.scale);

					canvas.height = viewport.height;
					canvas.width = viewport.width;

					page.render({
						canvasContext: context,
						viewport: viewport
					});
				}, function(reason){
					console.log(reason);
				});
			};

			$scope.previousPage = function previousPage(){
				if(--$scope.currentPage < 1){
					$scope.currentPage = 1;
				}
				
				render($scope.currentPage);
				container.scrollTop = 0;	// 翻页完成后，滚动到容器（当前pdf页面）顶部
			};

			$scope.nextPage = function nextPage(){
				if(++$scope.currentPage > $scope.pages){
					$scope.currentPage = $scope.pages;
				}

				render($scope.currentPage);
				container.scrollTop = 0;
			};

			// 转到指定页码
			$scope.gotoPage = function gotoPage(){
				if($scope.currentPage < 1){
					$scope.currentPage = 1;
				} else if($scope.currentPage > $scope.pages){
					$scope.currentPage = $scope.pages;
				}

				render($scope.currentPage);
				container.scrollTop = 0;
			};

			$scope.zoomIn = function zoomIn(){
				$scope.scale = ($scope.scale + 0.1) > 2.0 ? 2.0 : $scope.scale + 0.1;
				render($scope.currentPage);
			};

			$scope.zoomOut = function zoomOut(){
				$scope.scale = ($scope.scale - 0.1) < 0.1 ? 0.1 : $scope.scale - 0.1;
				render($scope.currentPage);
			};

			$scope.load();
		}
	};
}]);