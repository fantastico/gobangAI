采用的算法是用启发式算法对极大极小博弈树进行Alpha-Beta搜索，并进行距离范围剪枝，超时剪枝。

###极大极小博弈树
下五子棋的决策，可以用极大极小博弈树(Minimax Game Tree,简写为MGT)来描述。博弈树的分支表示走一步棋；根部对应于开始位置，其叶表示对弈到此结束。在叶节点对应的棋局中，竞赛的结果可以是赢、输或者和局。 
 

###Alpha-Beta搜索
AI的决策过程就是搜索MGT找到能够通向结果为赢的叶节点的分支。棋局是决策权交替进行的，第一步Player 1对自己最优的决策，但是第二步Player 2会选择对自己最优的决策也就是对Player 1最差的决策。对于Player 1决策过程是最优最差交替，所以在搜索MGT是,搜索方式按深度MAX、MIN交替。

###启发式算法
博弈的结果在叶子节点，但是15*15棋盘五子棋的博弈树很大，遍历所有叶子节点在时间上不可行。所以采用启发式算法，对于非叶子节点，根据节点的状态计算启发函数，用于评价决策的好坏。启发函数H(i, j)表示在(i, j)位置下子的评分，计算方法如下。

在棋盘任意位置，有横、竖、左斜和右斜方向的多种赢法。我们用一个赢法数组wins[i][j][k]记录下所有的赢法，如果wins[i][j][k]为true则(i,j)属于第k种赢法，wins的初始化如下。

  
// 竖向所有赢法, 五颗棋子竖着摆

    for (var i = 0; i < 15; i++) {  
        for (var j = 0; j < 11; j++) {  
            for (var k = 0; k < 5; k++) {  
                // wins[距(0,0)点向右的偏移量][距(0,0)点向下的偏移量][某个赢法]  
                wins[i][j + k][count] = true;  
            }  
            count++;  
        }  
    }  
    // 横向所有赢法, 五颗棋子横着摆
    // 左斜向所有赢法, 五颗棋子左斜着摆
    // 右斜向所有赢法, 五颗棋子右斜着摆
    见源码，略。

然后，用blackWin[k]和whiteWin[k]分别记录在第k种赢法已下的黑子和白子数。每次落子后更新blackWin和whiteWin。

启发函数

        H(i,j)=0.95^depth (∑_k attack_k (i,j) - ∑_k defense_k (i,j))
进攻分数  
    
        attack_k (i,j) = 0,         if  blackWin[k]=0 或 whiteWin[k]>0
        attack_k (i,j) = 100，      if  blackWin[k]=1
        attack_k (i,j) = 2330，     if  blackWin[k]=2
        attack_k (i,j) = 6000，     if  blackWin[k]=3
        attack_k (i,j) = 30000，    if  blackWin[k]=4
防守分数

        defense_k (i,j) = 0,        if  whiteWin[k]=0 或 blackWin[k]>0
        defense_k (i,j) = 120，     if  whiteWin[k]=1
        defense_k (i,j) = 2800，    if  whiteWin[k]=2
        defense_k (i,j) = 8000，    if  whiteWin[k]=3
        defense_k (i,j) = 100000，  if  whiteWin[k]=4
其中depth为搜索深度，启发函数加入0.95^depth作为时间成本因子，因为有可能走一步的最优方案得分和走三步的最优方案得分相等，时间成本因子能控制AI选择步数最少的方案。

在blackWin和whiteWin相等情况下，防守分数defense比进攻分数attack高，因为下一步是对方走，必须先防守。例如在（i1,j1）有blackWin[k1]=4，同样在（i2,j2）有whiteWin[k2]=4，但是下一步是白走，白在k2已有4子，再在k2上下一子就形成5子胜。

计算启发函数的代码片段:

    // 基于blackWin和whiteWin计算当前状态的得分
    // stepColor表示该状态的上一步是黑走还是白走
    // myColor表示当前是决策黑走还是白走
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

####距离范围剪枝
如果在棋盘上距离已有棋子很远的地方（i，j）处下子，下的子对当前局势影响很小，评分H(i,j)也会很低，所以对（i，j）分支进行剪枝。实际上，剪枝的判断条件为，如果在以（i，j）为中心的2*2格子内没有棋子，则进行剪枝。下图为例子，棋盘红圈以外的空位都被剪枝了。
 

###超时剪枝
比赛规定AI计算10秒超时判负，超时控制很重要。我们在比赛中多次遇到对手超时获胜，而我们的AI没出现超时的状况。每次访问MGT的节点，都会判断计算时间是否超过预设的超时阈值（6秒），超过则以此节点为根的分支，返回此节点的评分。

###禁手
每次访问MGT中黑棋决策层的节点，都会判断此节点是否造成禁手。如果是，则剪去以此节点为根的分支。

###代码实现
NodeJs，使用cluster模块实现多进程服务支持多用户同时对局
运行方法 
npm install
nodejs server.js

