// nodejs module导出
if (typeof module != 'undefined') {
    module.exports = {
        nextMove: nextMoveNew,
        nextMoveOld: nextMoveOld,
    }
}

var debug = false;

//
// 构建赢法数组
//
var wins = [];
var winsIndex = [];
for (var i = 0; i < 15; i++) {
    wins[i] = [];
    winsIndex[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = [];
        winsIndex[i][j] = [];
    }
}

var count = 0;

function hasElem(arr, e){
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        if (e==arr[i]) return true;
    }
    return false;
}

// 竖向所有赢法, 五颗棋子竖着摆
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            // wins[距(0,0)点向右的偏移量][距(0,0)点向下的偏移量][某个赢法]
            wins[i][j + k][count] = true;
            if (!hasElem(winsIndex[i][j + k], count)) {
                winsIndex[i][j + k].push(count);
            }

        }
        count++;
    }
}

// 横向所有赢法, 五颗棋子横着摆
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            // wins[距(0,0)点向右的偏移量][距(0,0)点向下的偏移量][某个赢法]
            wins[j + k][i][count] = true;
            if (!hasElem(winsIndex[j + k][i], count)) {
                winsIndex[j + k][i].push(count);
            }
        }
        count++;
    }
}

// left-top to right-bottom line
for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
            if (!hasElem(winsIndex[i + k][j + k], count)) {
                winsIndex[i + k][j + k].push(count);
            }
        }
        count++;
    }
}

// right-top to left-bottom line
for (var i = 0; i < 11; i++) {
    for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
            if (!hasElem(winsIndex[i + k][j - k], count)) {
                winsIndex[i + k][j - k].push(count);
            }
        }
        count++;
    }
}
console.log(count);

var WIN_SCORE = 1000000000;
var WIDE = 10;
var DEEP = 5;

// 下一步要尝试的所有位置。输入棋盘状态chessBoard[][]，输出坐标arrX[],arrY[]，返回位置的数量  (迭代版)
function getNextPositions(blackWin, whiteWin, chessBoard, arrX, arrY, stepColor, myColor) {

    var next = [];

    for(var i=0;i<15;i++) {
        for(var j=0;j<15;j++) {
            if(chessBoard[i][j]==0 && isRound(chessBoard, i, j)) {
                var point = new Object();
                point.x = i;
                point.y = j;
                point.v = dfsScore(chessBoard, blackWin, whiteWin, i, j, stepColor, myColor, 1);
                next.push(point);
            }
        }
    }

    next = next.sort(function (a, b) {
        if(stepColor == myColor) {
            return b.v-a.v // 自己下棋分数越高越好
        } else {
            return a.v - b.v; // 别人下棋分数越低越好
        }
    });

    //console.log("stepcolor:", stepColor, "mycolor:", myColor, "length:", next.length);
    var top = 0;
    for(;top<WIDE && top<next.length;top++) {
        arrX[top]=next[top].x;
        arrY[top]=next[top].y;
        //console.log("top ",top, next[top]);
    }

    return top;
}

// 这么下棋是否禁手。输入棋盘状态chessBoard[][]，尝试下棋的坐标x,y，被判断的是黑(1)还是白(2)
function isForbidden(chessBoard, x, y, color) {
    if(color==WHITE)
        return false; // 白棋无禁手
    return (NO_FORBIDDEN!=ForbiddenCheck(chessBoard,x,y));
}

function isChainForbidden(chessBoard, x, y, color) {
    if(color==WHITE)
        return false; // 白棋无禁手
    var d = fourDirect;

    // 遍历4条线,每条线有2个方向累加
    for(var k=0;k<4;k++) {
        var count = 1;
        for(var j=0;j<2;j++) {
            var dx = d[k][j][0]; // 这个方向的step
            var dy = d[k][j][1];
            var newx = x+dx;    // 先移动一个初始位置
            var newy = y+dy;
            for (;(newx>=0 && newx<15 && newy>=0 && newy<15) && chessBoard[newx][newy]==color;newx+=dx,newy+=dy) {
                count++;
                if(debug) {
                    console.log("color:k", k, " (", x, ",", y, ") count = ", count);
                }
                if (count>=6)
                    return true;
            }
        }
    }

    return false;
}

// 只针对x,y为中心的所有赢法，能否赢
function isWin(chessBoard, x, y, color) {
    var d = fourDirect;

    // 遍历4条线,每条线有2个方向累加
    for(var k=0;k<4;k++) {
        var count = 1;
        for(var j=0;j<2;j++) {
            var dx = d[k][j][0]; // 这个方向的step
            var dy = d[k][j][1];
            var newx = x+dx;    // 先移动一个初始位置
            var newy = y+dy;
            for (;(newx>=0 && newx<15 && newy>=0 && newy<15) && chessBoard[newx][newy]==color;newx+=dx,newy+=dy) {
                count++;
                if(debug) {
                    console.log("color:k", k, " (", x, ",", y, ") count = ", count);
                }
                if (count==5)
                    return true;
            }
        }
    }

    return false;
}

// 判定x,y周围是否有棋子
function isRound(chessBoard, x, y) {
    var d = orderDirect;

    for(var i=0;i<8;i++) {
        var newx = x+d[i][0];
        var newy = y+d[i][1];
        if((newx>=0 && newx<15 && newy>=0 && newy<15) && chessBoard[newx][newy]!=0)
            return true;
        newx = newx+d[i][0];
        newy = newy+d[i][1];
        if((newx>=0 && newx<15 && newy>=0 && newy<15) && chessBoard[newx][newy]!=0)
            return true;
    }
    return false;
}

// addOrSub为1或者-1，表示下棋还是回退
function addWin(blackWin, whiteWin, x, y, color, addOrSub) {
    var len = winsIndex[x][y].length;
    for (var t = 0; t < len; t++) {
        var k = winsIndex[x][y][t];
        if (color == 1) { // black
            blackWin[k] += addOrSub;
            whiteWin[k] += 10 * addOrSub;
        } else if (color == 2) { // white
            whiteWin[k] += addOrSub;
            blackWin[k] += 10 * addOrSub;
        }
    }
}

// 基于blackWin和whiteWin计算当前状态的得分
// stepColor表示该状态的上一步
function getScore(blackWin, whiteWin, stepColor, myColor) {
    var attackScoreTable = [0, 100, 2330, 6000, 30000];
    var defenseScoreTable = [0, 120, 2800, 8000, 1000000];
    var blackScore = 0, whiteScore = 0;
    for (var k = 0; k < count; k++) {
        if (blackWin[k] && blackWin[k] < 5) {
            if (stepColor == 1) blackScore += attackScoreTable[blackWin[k]];
            else blackScore += defenseScoreTable[blackWin[k]]; // 如果上一步是白棋，那意味着下一步是黑棋，那黑色的活3价值就更大了，所以要用大的分数表
        }
        if (whiteWin[k] && whiteWin[k] < 5) {
            if (stepColor == 1) whiteScore += defenseScoreTable[whiteWin[k]];
            else whiteScore += attackScoreTable[whiteWin[k]];
        }
    }
    if (myColor == 1) return blackScore - whiteScore; // 分数为双方优势之差，为正表示对自己有利，为负表示不利
    return whiteScore - blackScore;
}

var g_step_stat = 0;

// 通过递归搜索来判断当前状态的得分
function dfsScore(chessBoard, blackWin, whiteWin, x, y, stepColor, myColor, step, timeout) {
    // 先判断能确定输赢的场景
	g_step_stat++;
    var WIN_SCORE = 1000000000;
    if (stepColor == myColor) { // 当前这一步是自己走的
        if (isChainForbidden(chessBoard, x, y, stepColor)) return -WIN_SCORE
        else if (isWin(chessBoard, x, y, stepColor)) return WIN_SCORE;
        else if (isForbidden(chessBoard, x, y, stepColor)) return -WIN_SCORE;
    } else { // 当前这一步是对手走的
        if (isChainForbidden(chessBoard, x, y, stepColor)) return WIN_SCORE;
        else if (isWin(chessBoard, x, y, stepColor)) return -WIN_SCORE;
        else if (isForbidden(chessBoard, x, y, stepColor)) return WIN_SCORE;
    }

    // 模拟下棋，函数返回前需要回退
    chessBoard[x][y] = stepColor;
    addWin(blackWin, whiteWin, x, y, stepColor, 1);
    // 计算分数
    var score = getScore(blackWin, whiteWin, stepColor, myColor);
    if (!step || step <= 1 || score <= -WIN_SCORE || score >= WIN_SCORE) {
        ;// do nothing
    } else if (timeout && new Date().getTime() > timeout) {
		;// timeout
	} else {
        // 递归判断获取下一步的分数
        var arrX = [], arrY = [];
        var n = getNextPositions(blackWin, whiteWin, chessBoard, arrX, arrY, 3- stepColor, myColor);
        var max = -WIN_SCORE, min = WIN_SCORE;
        for (var i = 0; i < n; i++) {
            var score = dfsScore(chessBoard, blackWin, whiteWin, arrX[i], arrY[i], 3 - stepColor, myColor, step - 1, timeout);
            if (score > max) max = score;
            if (score < min) min = score;
            if (stepColor != myColor && score >= WIN_SCORE || stepColor == myColor && score <= -WIN_SCORE) break; // 剪枝
        }
        if (stepColor == myColor) score = min;
        else score = max;
        score *= 0.95 // 时间成本
    }

    // 回退下棋
    chessBoard[x][y] = 0;
    addWin(blackWin, whiteWin, x, y, stepColor, -1);
    return score;
}

// 获取下一步下棋的位置
function getBestNext(chessBoard, myColor, timeout) {
    // 为设计成无状态接口，需要重算whiteWin和blackWin
    var whiteWin = [], blackWin = [];
    for (var k = 0; k < count; k++) {
        whiteWin[k] = blackWin[k] = 0;
    }
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (chessBoard[i][j] > 0) {
                addWin(blackWin, whiteWin, i, j, chessBoard[i][j], 1);
            }
        }
    }

    var arrX = [], arrY = [];
    var n = getNextPositions(blackWin, whiteWin, chessBoard, arrX, arrY, myColor, myColor);
    var max = -2000000000;
    var u = 0, v = 0; // 存储下一步下棋的位置坐标

    // 首步天元
    if (n == 0) {
        n = 1;
        arrX[0] = arrY[0] = 7;
    }
    for (var i = 0; i < n; i++) {
        var score = dfsScore(chessBoard, blackWin, whiteWin, arrX[i], arrY[i], myColor, myColor, DEEP, new Date().getTime() + timeout); // 只搜DEEP层
        if (score > max) {
            max = score;
            u = arrX[i];
            v = arrY[i];
        }
    }
    return {u: u, v: v};
}

// computer落子的判断
var computerAI = function () {
	g_step_stat = 0;
	WIDE = 10;
	DEEP = 5;
	console.time("timeout");
    var r = getBestNext(chessBoard, isBlack ? 1 : 2, 500);
	console.timeEnd("timeout");
	console.log('g_step_stat = ' + g_step_stat);
    var u = r.u,
        v = r.v;
    oneStep(u, v, isBlack);
    chessBoard[u][v] = isBlack ? 1 : 2;
    if (debug) {
        console.log(' ai: ' + '(' + u + ',' + v + ')');
    }

    // 更新computer各赢法落子进度
    for (var k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            // 验证该赢法落子进度是否有效
            if (isBlack) {
                blackWin[k]++;
                whiteWin[k] = 6;
                if (blackWin[k] === 5) {
                    window.alert("black Win!");
                    over = true;
                    break;
                }
            } else {
                whiteWin[k]++;
                blackWin[k] = 6;
                if (whiteWin[k] === 5) {
                    window.alert("white Win!");
                    over = true;
                    break;
                }
            }
        }
    }
    if (!over) {
        isBlack = !isBlack;
    }
};

var computerAI7 = function () {
	g_step_stat = 0;
	WIDE = 8;
	DEEP = 7;
	console.time("timeout2");
    var r = getBestNext(chessBoard, isBlack ? 1 : 2, 500);
	console.timeEnd("timeout2");
	console.log('g_step_stat2 = ' + g_step_stat);
    var u = r.u,
        v = r.v;
    oneStep(u, v, isBlack);
    chessBoard[u][v] = isBlack ? 1 : 2;
    if (debug) {
        console.log(' ai: ' + '(' + u + ',' + v + ')');
    }

    // 更新computer各赢法落子进度
    for (var k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            // 验证该赢法落子进度是否有效
            if (isBlack) {
                blackWin[k]++;
                whiteWin[k] = 6;
                if (blackWin[k] === 5) {
                    window.alert("black Win!");
                    over = true;
                    break;
                }
            } else {
                whiteWin[k]++;
                blackWin[k] = 6;
                if (whiteWin[k] === 5) {
                    window.alert("white Win!");
                    over = true;
                    break;
                }
            }
        }
    }
    if (!over) {
        isBlack = !isBlack;
    }
};

// AI落子判断
var ai_compute = function (chessboard, isblack) {
    if (chessboard == undefined) {
        chessboard = chessBoard;
    }
    if (isblack == undefined) {
        isblack = isBlack;
    }
    var myScore = [];
    var otherScore = [];
    var max = 0;
    var u = 0,
        v = 0;
    for (var i = 0; i < 15; i++) {
        myScore[i] = [];
        otherScore[i] = [];
        for (var j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            otherScore[i][j] = 0;
        }
    }

    var blackWin = [];
    var whiteWin = [];

    for (var i = 0; i < count; i++) {
        blackWin[i] = 0;
        whiteWin[i] = 0;
    }
    var over = false;
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            var len = winsIndex[i][j].length;
            if (chessboard[i][j] == 1) {
                for (var t = 0; t < len; t++) {
                    var k = winsIndex[i][j][t];
                    blackWin[k]++;
                    whiteWin[k] = 6;
                    if (blackWin[k] === 5) {
                        over = true;
                        break;
                    }
                }
            }
            if (chessboard[i][j] == 2) {
                for (var t = 0; t < len; t++) {
                    var k = winsIndex[i][j][t];
                    whiteWin[k]++;
                    blackWin[k] = 6;
                    if (whiteWin[k] === 5) {
                        over = true;
                        break;
                    }
                }
            }
        }
    }

    var myWin, otherWin;
    if (isblack) {
        myWin = blackWin;
        otherWin = whiteWin;
    } else {
        myWin = whiteWin;
        otherWin = blackWin;
    }

    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            // 检验是否落子,空的位置才能落子
            var len = winsIndex[i][j].length;
            if (chessboard[i][j] === 0) {
                for (var t = 0; t < len; t++) {
                    var k = winsIndex[i][j][t];
                    // 去我方赢法数组查询落子进度, 并赋予分值
                    if (myWin[k] == 1) {
                        myScore[i][j] += 100;
                    } else if (myWin[k] == 2) {
                        myScore[i][j] += 2330;
                    } else if (myWin[k] == 3) {
                        myScore[i][j] += 6000;
                    } else if (myWin[k] == 4) {
                        myScore[i][j] += 30000;
                    }
                    // 去computer的赢法数组查询落子进度, 并赋予分值
                    if (otherWin[k] == 1) {
                        otherScore[i][j] += 120;
                    } else if (otherWin[k] == 2) {
                        otherScore[i][j] += 2800;
                    } else if (otherWin[k] == 3) {
                        otherScore[i][j] += 8000;
                    } else if (otherWin[k] == 4) {
                        otherScore[i][j] += 1000000;
                    }
                }
                // max是局部变量,所有点共享
                if (myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if (myScore[i][j] == max) {
                    if (otherScore[i][j] > otherScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
                if (otherScore[i][j] > max) {
                    max = otherScore[i][j];
                    u = i;
                    v = j;
                } else if (otherScore[i][j] == max) {
                    if (myScore[i][j] > myScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }
            }
        }
    }

    if (typeof oneStep != 'undefined') {
        oneStep(u, v, isBlack);
    }
    chessboard[u][v] = isblack?1:2;

    // 更新computer各赢法落子进度
    var len = winsIndex[u][v].length;
    for (var t = 0; t < len; t++) {
        var k = winsIndex[u][v][t];
            // 验证该赢法落子进度是否有效
            // 若为whiteWin[k]设置0到4的范围会导致赢法数组落子进度的更新错误
            // if (whiteWin[k] >= 0 && whiteWin[k] < 5) {
        myWin[k]++;
        otherWin[k] = 6;
        if (myWin[k] === 5) {
            over = true;
            break;
        }
        // }
    }
    if (!over) {
        isblack = !isblack;
    }
    var next = {'u':u, 'v':v};
    return next;
};

function steps2chessboard(steps) {
    var chessboard = [];
    for (var i = 0; i < 15; i++) {
        chessboard[i] = [];
        for (var j = 0; j < 15; j++) {
            chessboard[i][j] = 0;
        }
    }
    steps.forEach(function(m) {
        chessboard[m.x-1][m.y-1] = m.side=="b"? 1:2;
    });
    // console.log(chessboard);
    return chessboard;
}

function nextMoveOld(steps, isblack) {
    if (steps == null) {
        return {'u': 7, 'v': 7};
    }
    var chessboard = steps2chessboard(steps);
    return ai_compute(chessboard, isblack);
}

function nextMoveNew(steps, isblack) {
    if (steps == null) {
        return {'u': 7, 'v': 7};
    }
    var chessboard = steps2chessboard(steps);
    return getBestNext(chessboard, isblack ? 1 : 2, 5000);

}

// Honyyang 2016-10-28 (C) Tencent
// 检查禁手代码
// 定义一些常量
var NONE=0; // 空白
var BLACK=1;    // 黑子
var WHITE=2;    // 白子

var NO_FORBIDDEN=0; // 无禁手
var THREE_THREE_FORBIDDEN=1;    // 三三禁手
var FOUR_FOUR_FORBIDDEN=2;  // 四四禁手
var LONG_FORBIDDEN=3;   // 长连禁手

// 定义盘面搜索方向（顺序八方向数组）
var orderDirect = new Array(
    new Array(0, -1), // 向上搜索
    new Array(1, -1), // 向右上搜索
    new Array(1, 0), // 向右搜索
    new Array(1, 1), // 向右下搜索
    new Array(0, 1), // 向下搜索
    new Array(-1, 1), // 向左下搜索
    new Array(-1, 0), // 向左搜索
    new Array(-1, -1) // 向左上搜索
);

// 定义盘面搜索方向（直线四方向数组）
var fourDirect = new Array(
    new Array(
        new Array(0, -1),
        new Array(0, 1)
    ), // 竖线
    new Array(
        new Array(-1, 0),
        new Array(1, 0)
    ), // 横线
    new Array(
        new Array(-1, -1),
        new Array(1, 1)
    ), // 斜线
    new Array(
        new Array(1, -1),
        new Array(-1, 1)
    ) // 反斜线
);

// 判定x,y是否构成禁手
// x为横坐标
// y为纵坐标
// 返回值见XXX_FORBIDEEN常量
function ForbiddenCheck(chessBoard, x, y) {
    if (debug) {
        console.log("ForbiddenCheck: (", x,",",y,")");
    }
    // 数组下标代表方向
    var adjsame = []; // 记录与（x,y）相邻的连续黑色棋子
    var adjempty = []; // 记录adjsame后相邻的连续空位数
    var jumpsame = []; // 记录adjempty后的连续黑色棋子数
    var jumpempty = []; // 记录jumpsame后的空位数
    var jumpjumpsame = []; // 记录jumpempty后的连续黑色棋子数

    // 初始化棋子数
    for(var i=0;i<8;i++) {
        adjsame[i] = adjempty[i] = jumpsame[i] = jumpempty[i] = jumpjumpsame[i] = 0;
    }

    var d = orderDirect;

    // 盘面搜索
    for(var i=0;i<8;i++) {
        var _x=x+d[i][0];
        var _y=y+d[i][1];
        for (; (_x >= 0 && _x < 15 && _y >= 0 && _y < 15) && chessBoard[_x][_y]==BLACK; _x+=d[i][0],_y+=d[i][1]) {
            adjsame[i]++;
        }
        for (; (_x >= 0 && _x < 15 && _y >= 0 && _y < 15) && chessBoard[_x][_y]==NONE; _x+=d[i][0],_y+=d[i][1]) {
            adjempty[i]++;
        }
        for (; (_x >= 0 && _x < 15 && _y >= 0 && _y < 15) && chessBoard[_x][_y]==BLACK; _x+=d[i][0],_y+=d[i][1]) {
            jumpsame[i]++;
        }
        for (; (_x >= 0 && _x < 15 && _y >= 0 && _y < 15) && chessBoard[_x][_y]==NONE; _x+=d[i][0],_y+=d[i][1]) {
            jumpempty[i]++;
        }
        for (; (_x >= 0 && _x < 15 && _y >= 0 && _y < 15) && chessBoard[_x][_y]==BLACK; _x+=d[i][0],_y+=d[i][1]) {
            jumpjumpsame[i]++;
        }
    }

    // DEBUG
    if (debug) {
        console.log("adjsame:", adjsame);
    }
    //console.log("adjempty:", adjempty);
    //console.log("jumpsame:", jumpsame);
    //console.log("jumpempty:", jumpempty);
    //console.log("jumpjumpsame:", jumpjumpsame);


    // 先检查是否成连五，若是黑棋获胜，不构成禁手
    for(var i=0;i<4;i++) {
        if(adjsame[i]+adjsame[i+4]==4) {
            if (debug) {
                console.log("成连五！");
            }
            return NO_FORBIDDEN;
        }
    }

    // 禁手分析
    var threecount = 0, fourcount=0; // 棋型统计

    for(var i=0;i<4;i++) {

        // 五子以上相连，为长连禁手
        if (adjsame[i]+adjsame[i+4]>=5) {
            if (debug) {
                console.log("长连禁手！");
            }
            return LONG_FORBIDDEN;
        } else if (adjsame[i]+adjsame[i+4]==3) {// 四子相连情况
            var isFour = false;
            // 活四情况： 空黑黑黑黑空
            // 冲四情况： 空黑黑黑黑黑、
            //            空黑黑黑黑界、
            //            空黑黑黑黑白、
            //            界黑黑黑黑空、
            //            白黑黑黑黑空
            if (adjempty[i]>0) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    isFour = true;
            }
            if (adjempty[i+4]>0) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    isFour = true;
            }

            if (isFour)
                fourcount++;
        } else if (adjsame[i]+adjsame[i+4]==2) {//三子相连情况
            // 冲四情况：    黑空黑黑黑、
            //               黑黑黑空黑
            if(adjempty[i]==1&&jumpsame[i]==1) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    fourcount++;
            }
            if(adjempty[i+4]==1&&jumpsame[i+4]==1) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    fourcount++;
            }

            var isThree = false;
            // 活三情况：    空空空黑黑黑空空、
            //               空空空黑黑黑空白、
            //               空空空黑黑黑空界、
            //               白空空黑黑黑空空、
            //               白空空黑黑黑空白、
            //               白空空黑黑黑空界、
            //               界空空黑黑黑空空、
            //               界空空黑黑黑空白
            if((adjempty[i]>2||(adjempty[i]==2&&jumpsame[i]==0)) &&
                (adjempty[i+4]>1||(adjempty[i+4]==1&&jumpsame[i+4]==0))) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    isThree = true;
            }
            // 活三情况：    空空黑黑黑空空空、
            //               空空黑黑黑空空白、
            //               空空黑黑黑空空界、
            //               白空黑黑黑空空空、
            //               白空黑黑黑空空白、
            //               白空黑黑黑空空界、
            //               界空黑黑黑空空空、
            //               界空黑黑黑空空白
            if((adjempty[i+4]>2||(adjempty[i+4]==2&&jumpsame[i+4]==0)) &&
                (adjempty[i]>1||(adjempty[i]==1&&jumpsame[i]==0))) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    isThree = true;
            }

            if(isThree)
                threecount++;
        } else if(adjsame[i]+adjsame[i+4]==1) {// 两子相连
            // 冲四情况：    黑黑空黑黑、
            //               黑黑空黑黑
            if(adjempty[i]==1&&jumpsame[i]==2) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    fourcount++;
            }
            if(adjempty[i+4]==1&&jumpsame[i+4]==2) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    fourcount++;
            }

            // 活三情况：        空空黑空黑黑空空、
            //                   空空黑空黑黑空白、
            //                   空空黑空黑黑空界、
            //                   白空黑空黑黑空空、
            //                   白空黑空黑黑空白、
            //                   白空黑空黑黑空界、
            //                   界空黑空黑黑空空、
            //                   界空黑空黑黑空白、
            if(adjempty[i]==1&&jumpsame[i]==1&&
                (jumpempty[i]>1||(jumpempty[i]==1&&jumpjumpsame[i]==0))&&
                (adjempty[i+4]>1||(adjempty[i+4]==1&&jumpsame[i+4]==0))) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    threecount++;
            }
            // 活三情况：        空空黑黑空黑空空、
            //                   空空黑黑空黑空白、
            //                   空空黑黑空黑空界、
            //                   白空黑黑空黑空空、
            //                   白空黑黑空黑空白、
            //                   白空黑黑空黑空界、
            //                   界空黑黑空黑空空、
            //                   界空黑黑空黑空白、
            if(adjempty[i+4]==1&&jumpsame[i+4]==1&&
                (jumpempty[i+4]>1||(jumpempty[i+4]==1&&jumpjumpsame[i+4]==0))&&
                (adjempty[i]>1||(adjempty[i]==1&&jumpsame[i]==0))) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    threecount++;
            }
        } else if(adjsame[i]+adjsame[i+4]==0) {// 一颗棋子
            // 冲四情况：    黑黑黑空黑、
            //               黑空黑黑黑
            if(adjempty[i]==1&&jumpsame[i]==3) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    fourcount++;
            }
            if(adjempty[i+4]==1&&jumpsame[i+4]==3) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    fourcount++;
            }
            // 活三情况：        空空黑黑空黑空空、
            //                   空空黑黑空黑空白、
            //                   空空黑黑空黑空界、
            //                   白空黑黑空黑空空、
            //                   白空黑黑空黑空白、
            //                   白空黑黑空黑空界、
            //                   界空黑黑空黑空空、
            //                   界空黑黑空黑空白、
            if(adjempty[i]==1&&jumpsame[i]==2&&
                (jumpempty[i]>1||(jumpempty[i]==1&&jumpjumpsame[i]==0))&&
                (adjempty[i+4]>1||(adjempty[i+4]==1&&jumpsame[i+4]==0))) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i],i)==NO_FORBIDDEN)
                    threecount++;
            }
            // 活三情况：        空空黑空黑黑空空、
            //                   空空黑空黑黑空白、
            //                   空空黑空黑黑空界、
            //                   白空黑空黑黑空空、
            //                   白空黑空黑黑空白、
            //                   白空黑空黑黑空界、
            //                   界空黑空黑黑空空、
            //                   界空黑空黑黑空白、
            if(adjempty[i+4]==1&&jumpsame[i+4]==2&&
                (jumpempty[i+4]>1||(jumpempty[i+4]==1&&jumpjumpsame[i+4]==0))&&
                (adjempty[i]>1||(adjempty[i]==1&&jumpsame[i]==0))) {
                if(KeyPointForbiddenCheck(chessBoard,x,y,adjsame[i+4],i+4)==NO_FORBIDDEN)
                    threecount++;
            }
        }
        if (debug) {
            console.log("i:", i,"fourcount:", fourcount, "threecount:", threecount);
        }
    }

    if(fourcount>1)
        return FOUR_FOUR_FORBIDDEN;
    if (threecount>1)
        return THREE_THREE_FORBIDDEN;

    return NO_FORBIDDEN;
}

// 判定活三、活四、冲四的关键点是否构成禁手点
// （x,y）是待判定的禁手点坐标
//  adjsame 是待判定的禁手点与关键点相隔的棋子数
//  direction 是关键点相对禁手点的方向（八方向）
function KeyPointForbiddenCheck(chessBoard, x, y, adjsame, direction) {
    if (debug) {
        console.log("KeyPointForbiddenCheck: (",x,",",y,") adjsame =", adjsame, "direction=", direction);
    }

    adjsame++;
    if (direction>=4)
        adjsame = -adjsame;

    // 方向枚举
    var d = new Array(
        new Array(0, -adjsame),
        new Array(adjsame, -adjsame),
        new Array(adjsame, 0),
        new Array(adjsame,adjsame)
    );

    // 计算关键点坐标
    var k = direction%4;
    var i = x + d[k][0];
    var j = y + d[k][1];

    // 向棋盘放入棋子
    chessBoard[x][y]=BLACK;

    // 检查关键点禁手
    var result=ForbiddenCheck(chessBoard,i,j);

    // 还原棋盘
    chessBoard[x][y]=NONE;

    if (debug) {
        console.log("KeyPointForbiddenCheck: result =", result);
    }
    return result;
}
