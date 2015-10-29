var request = require('request');
var ipc = require('ipc');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var baseUrl = 'http://xueqiu.com/';
var options = {
	proxy: 'http://web-proxy.atl.hp.com:8080',
	url: 'http://xueqiu.com/cubes/rebalancing/history.json?cube_symbol=ZH214777&count=20&page=1',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
		'Cookie': 's=ob3125ehb1; bid=2e223cd1864826c4b145e7288de144b7_ibxv4qe7; xq_a_token=b6ce2711b475adde05e7a86262020f688c9d9700; xqat=b6ce2711b475adde05e7a86262020f688c9d9700; xq_r_token=0875fac21da81663410db18e38ef08ecb1e9e949; xq_token_expire=Fri%20Nov%2020%202015%2009%3A10%3A00%20GMT%2B0800%20(CST); xq_is_login=1; Hm_lvt_1db88642e346389874251b5a1eded6e3=1445620577,1445822174,1445859896,1445910796; __utma=1.2110518520.1436750949.1445928603.1445947411.217; __utmc=1; __utmz=1.1441088265.130.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic',
		"Content-Type": "application/json"
	}
};
Date.prototype.Format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
function render(json) {
	var uls = [];
	var index = 0;
	for (var i of json.list) {
		if (index === 0) {
			if (firstBalanceId !== 0 && firstBalanceId != i.id) {
				ipc.send('new-balance-history', i.id);
				firstBalanceId = i.id;
			} else {
				ipc.send('no-balance-history', i.id);
			}
			index++;
		}
		var createAtDate = new Date(i.created_at).Format('yyyy-MM-dd');
		var createAtString = new Date(i.created_at).Format('hh:mm:ss');
		var firstLi = h('li.rebalance-time.fn-clear.first', {}, [
			h('span.date', {}, createAtDate),
			h('span.status', {}, i.status),
			h('span.time', {}, createAtString),
			h('span.tri', {}, i.stock_name)
		]);
		var aInFirstDivAfterFirstLi = [];
		for (var j of i.rebalancing_histories) {
			var a = h('a.no-tooltip', { href: baseUrl + 's/' + j.stock_symbol, target: '_blank' }, [
				h('li.rebalance-stock.fn-clear', {}, [
					h('span.balance-name', {}, [
						h('div.stock-name', {}, j.stock_name),
						h('div.stock-symbol', {}, j.stock_symbol + '  Price: ' + j.price)
					]),
					h('span.weight-change.fn-clear', { style: { 'line-height': '0px' } }, [
						h('div.action', {}, [
							h('span.prev-weight', {}, (j.prev_target_weight == null ? 0 : j.prev_target_weight) + '%'),
							h('span.arrow', {}, ''),
							h('span.target-weight', {}, (j.target_weight == null ? 0 : j.target_weight) + '%')
						])

					])
				]),

			]);
			aInFirstDivAfterFirstLi.push(a);
		}

		var firstDivAfterFirstLi = h('div.relance-list', {}, aInFirstDivAfterFirstLi);

		var ul = h('ul', {}, [firstLi, firstDivAfterFirstLi]);
		uls.push(ul);
	}
	var div = h('div.history-list', { style: { left: '0px' } }, uls);
	var lastCheckTime = new Date();
	var div2 = h('div', {}, [h('div', { style: { 'text-align': 'center' } }, lastCheckTime.toString()), [div]]);
	return div2;
}

var tree = h('div.cube-block fn-clear', {}, []);
var rootNode = createElement(tree);
document.body.appendChild(rootNode);

var firstBalanceId = 0;
var count = 0;
GetData();
function GetData() {
	var message = '';
	request(options, function () {
	}).on('error', function (err) {
		console.log(err);
	}).on('response', function (res) {
		res.on('data', function (chunk) {
			message += chunk;
		});
		res.on('end', function () {
			var result = JSON.parse(message);
			var newTree = render(result);
			var patches = diff(tree, newTree);
			rootNode = patch(rootNode, patches);
			tree = newTree;
		});
	});
}

setInterval(function () {
	GetData();
}, 5000);
