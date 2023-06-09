# 微信小程序 · 校园社区类 · 微校Smile

## 小程序体验二维码

使用微信扫一扫，使用小程序

![输入图片说明](smile.jpg)

## 相关链接
- 作品文档文件夹：[网盘链接](https://pan.baidu.com/s/1tCPx6B-FpacvmUxN-OqFLw?pwd=0417)

- 作品演示文件夹：[网盘链接](https://pan.baidu.com/s/1G60rxF8CP4jDF7U0IAxEFA?pwd=0417)

## 部分设计文档
### 一、需求分析
“微校Smile”小程序是面向在校大学生的微型校园社区。用户主要通过“发帖-回应”的方式，分享、交流校园生活，提出、回答校园问题。

目前市面上开放程度高、受众范围广的社区应用软件大多面向全年龄段用户，缺乏针对性，对于在校大学生来说存在着的无效信息过载的问题。对此，本小程序做了“减法”：
1.	选用微信小程序，它作为“微型软件”，体量远小于普通软件，而且具有跨Android、iOS、PC等多平台的优势；
2.	精简界面，突出有效信息；
3.	缩小范围，专注于高校大学生，提高校园中学习生活问题的解决效率，真正服务于在校生存在的个性化、私人化问题。

而目前大部分学校采用“由学生或老师管理一个微信号/公众号”的方式去解决校园问题，其缺点显而易见：消耗人力资源、信息相对闭塞、用户可操作性低。对此，本小程序做了“加法”：
1.	提供“实时、分类、消息、帖子详情、生成式AI模块”等多个功能模块，方便用户使用和管理；
2.	提高自由度和自主性，让用户自主发帖、回应以及收到回应，让整个过程更加便捷高效。

综上所述，相较于竞品，本小程序专注于服务于高校大学生，解决他们在校园中遇到的个性化、私人化问题，具有更高的 **针对性**。此外，还具有体积小、跨平台，使用便捷等优势，用户能够更快速地提出问题、得到解答，同时也能够更加自由地表达和交流，具有更高的 **实用性**。

### 二、概要设计
本小程序主要从登录、实时、分类、消息、帖子详情、生成式AI模块六大功能及模块进行设计。具体设计介绍如下：
#### 2.1 登录模块
用户在该模块下进行注册登录。

用户设置昵称和头像以注册登录本小程序。未登录用户处于“游客模式”。
#### 2.2 实时模块
用户在该模块下浏览按“最新发帖”优先展示的帖子列表，也可切换成按“最新回应”优先展示。

“实时”模块下有4个子模块：
1. 个人菜单模块：用户可查看头像和昵称；管理“我的发帖”、“我的收藏”、“我的回应”；查看使用帮助，快速了解使用方法；联系客服，反馈功能异常或产品建议；处理举报（管理员模式），用于处理被举报的发帖和评论。
2. 顶部轮播条：展示“热门”、“置顶”等信息。其中“热门”模块是根据算法计算帖子热度并进行排序，展示热度最高的前20条帖子；
3. 搜索模块：点击搜索框搜索帖子的标签、标题或者正文的关键字词。
4. 发帖模块：点击右下角黑色悬浮按钮进入发帖模块，根据页面提示分别填写帖子标题、补充（文字或图片），选择合适的标签以及是否匿名，并支持富文本编辑。**图文内容通过微信官方审核接口后即可发布在小程序中**。
#### 2.3 分类模块
在此模块中，帖子按照标签分类展示，用户可以根据需求，浏览不同标签下的帖子。

有：自定义标签、AI、音乐、学习、生活、美食、恋爱、游戏、组队、读书、闲置、摄影、失物招领、寻物启事等多种分类标签。
#### 2.4 消息模块
该模块能够查看“帖子回应”、“评论回应”以及“收到的赞”，点击该模块下的消息均可以进入相关帖子查看详情。

“帖子回应”下可以查看到其他用户对自己发帖的回应，“评论回应”下可以查看其他用户对自己评论的回应，“收到的赞”可以查看其他用户为自己评论的点赞。
#### 2.5 帖子详情模块
该模块分为与帖子相关的功能和与评论相关的用户功能：

与帖子相关的功能有：查看帖子的详细信息，查看/调整帖子的状态（未解决/已解决），删除/举报帖子（删除自己发布的帖子/举报他人发布的帖子），点赞、收藏、回复帖子。

与评论相关的功能有：按最新/最早/赞数浏览评论，删除/举报评论（删除自己发布的评论/举报他人发布的评论），点赞、回复评论。
#### 2.6 生成式AI问答模块
用户在该模块下与生成式AI进行问答。**提问和回答通过多重审核后即可发布显示**。

点击“实时”模块右上方ChatGLM（我国清华大学的语言模型）图标进入独立的生成式AI板块，在输入框中输入问题，点击发送按钮提出问题即可得到生成式AI的解答。

在帖子详情页面中，在发送评论前点亮ChatGLM图标，可让该评论被生成式AI的解答，且支持记忆上下文的连续问答。