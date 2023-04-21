## 需求分析
“微校Smile”小程序是面向在校大学生的微型校园社区。用户主要通过“发帖-提问”的方式，分享、交流校园生活，提出、回答校园问题。

本微信小程序主要有“实时”、“分类”、“消息”“生成式AI”四大模块。

相较于竞品，本小程序专注于服务于高校大学生，解决他们在校园中遇到的个性化、私人化问题，具有更高的针对性。此外，还具有体积小、跨平台，使用便捷等优势，用户能够更快速地提出问题、得到解答，同时也能够更加自由地表达和交流，具有更高的实用性。

## 概要设计
本小程序主要从登录、实时、分类、消息、帖子详情、生成式AI模块六大功能及模块进行设计。具体设计介绍如下：
### 2.1登录模块：
用户进入微信小程序后，点击左上角的菜单图标进入个人菜单页面，点击顶部“未登录”进入登录界面，输入昵称并设置头像以注册并登录本小程序。此后进入小程序无需再次登录验证。
### 2.2实时模块：
- （1）个人菜单模块：用户能够设置并查看头像和昵称；管理“我的发帖”、“我的收藏”、“我的回应”三个小版块，能够进行查看和删除操作；查看使用帮助，每次版本更新后让用户能够快速了解使用方法；反馈意见和建议，对小程序的不足和可以改进的地方提出建议。管理员模式下有“处理举报”板块，用于处理被举报的发帖和评论。

- （2）查看顶部轮播展示“热门”、“置顶”等信息，其中“热门”小模块是根据算法将帖子的热度进行排序，展示热度高的帖子；浏览按最新发帖优先展示的帖子列表(可切换成按“最新回应”优先展示)。

- （3）搜索模块：点击搜索框可以搜索帖子的标签、标题或者正文内容。

- （4）发帖模块：根据页面提示分别填写帖子标题、正文（文字和图片），选择合适的标签以及是否匿名，并支持富文本编辑器，所有内容通过审核后即可发布在小程序中。
### 2.3分类模块：
点击下方中央的分类图标，切换到该模块下。在此模块中，帖子根据标签被分类，用户可以根据需求，浏览不同标签下的帖子。各标签下的帖子以最新发帖时间为依据，按照从新到旧的顺序排列。
### 2.4消息模块：
点击下方最右的消息图标切换到消息模块。该模块被分为三部分，能够查看“帖子回应”、“评论回应”以及“收到的赞”，该模块下的每一条消息均可以点击，以进入相关帖子查看全部详情。点击“帖子回应”，可以查看到自己发出的帖子收到的评论；点击“评论回应”，可以看到自己发出的评论下方其他用户的二级评论；点击“收到的赞”可以查看有哪些其他用户为自己发出评论的点赞。
### 2.5帖子详情模块：
分为与帖子相关的功能和与评论相关的功能。与帖子相关的功能有查看/调整帖子的状态（未解决/已解决），删除/举报帖子（删除自己发布的帖子/举报他人发布的帖子），查看帖子的详细信息，关注帖子（跟进后续帖子发展），回复帖子。与评论相关的功能有按最新/最早/赞数浏览评论，删除/举报评论（删除自己发布的评论/举报他人发布的评论），点赞、回复帖子。
### 2.6 生成式AI问答模块：
我们将生成式AI引入到小程序中：点击“实时”模块右上方ChatGLM Logo进入生成式AI问答模块。在输入框中输入问题，点击发送按钮提出问题，等待生成式AI的解答。此外，在帖子详情页面中，在发送评论前选中ChatGLM Logo，可让该评论被生成式AI的解答，且支持联系上下文进行回答。

该模块使用了清华大学团队开发的开源的、支持中英双语的对话语言模型ChatGLM-130B进行回答，信息均被微信官方的审核算法和本小程序的审核算法双重检验，解决了问答的安全性和敏感词屏蔽的问题。
