create database if not exists pandingbao;
use pandingbao;
drop table if exists rater;
CREATE TABLE if not exists rater (
  `id` int not null auto_increment,
  `kase_id` int(11) comment '评审对应的案件',
  `kase_name` varchar(100),
  `plaintiff_id` int(11) comment '对应案件的原告',
  `defendant_id` int(11) comment '对应案件的被告',
  `user_id` int(11) comment '当评审的用户，如果为空就表示该评审还没有用户来充当',
  `username` varchar(100) comment '评审的用户名',
  `ispaid` bool not null comment '该位置是否已经用积分购买了',
  `isexpired` bool not null default 0 comment '是否过期作废，当一个案例已经凑足了足够的判定就会宣判，剩余的评审位置都将作废',
  `selected_at` int(10) comment '评审用户被选中当这个位置的评审的时间，如果过了一定时间后（比如24小时）还未完成评判，这个位置将腾空换人',
  `rated_at` int(10) comment '空表示尚未评判',
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 comment='评审';

drop table if exists invitation;
CREATE TABLE if not exists invitation (
  `id` int not null auto_increment,
  `creator_id` int(11) comment '',
  `creator_username` varchar(100),
  `inviteecount` int(3) not null default 1 comment '允许邀请的人数',
  `invitedcount` int(3) not null default 0 comment '已经邀请的人数',
  `duration` int(4) default 1 comment '有效时间，1表示1小时', 
  `isexpired` bool not null default 0 comment '是否已经过期，每个小时定时运行cron程序处理过期的邀请',
  `cost` int(3) not null default 0 comment '邀请成本，生成邀请也是要花积分的，不然这个邀请就会泛滥和不被珍惜',
  `typename` varchar(100),
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 comment='邀请,邀请码就用创建时间+id';


drop table if exists opt;
CREATE TABLE if not exists opt (
  `id` int not null auto_increment,
  `creator_id` int(11) comment '',
  `creator_username` varchar(100),
  `kase_id` int(11) not null comment '案件id',
  `val` decimal(10,2) not null comment '该选项的惩罚值',
  `manyi` decimal(4,2) not null default 0 comment '满意度',
  `manyicount` int(5) not null default 0 comment '满意度评分的数量',
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 comment='选项';


drop table if exists rate;
CREATE TABLE if not exists rate (
  `id` int not null auto_increment,
  `creator_id` int(11) comment '评分的用户',
  `creator_username` varchar(100),
  `ratetype` varchar(20) comment '评分种类,比如事实的可信度,事实的重要性,问题的重要性, 答案的重要性',
  `object_id` int(11) comment '被评分对象的编号',
  `reason` varchar(25) comment '评分的原因',
  `walue` float not null default 0 comment '分数',
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 comment='评分';

drop table if exists fact;
CREATE TABLE if not exists fact (
  `id` int not null auto_increment,
  `creator_id` int(11) comment '添加该事实的用户',
  `creator_username` varchar(100),
  `kase_id` int(11) comment '该事实所属的案件',
  `kase_name` varchar(100) comment '',
  `content` varchar(140) comment '对事实的陈述',
  `refutation` varchar(140) comment '对方对该事实的反驳',
  `has_image` bool not null default false comment '有没有图片',
  `has_refute_image` bool not null default false comment '有没有反驳图片',
  `reliability` float not null default 0 comment '可信度',
  `reliabilitycount` int(5) not null default 0 comment '可信度评分的数量',
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 comment='事实, 对案件中的一个事实的陈述';

drop table if exists message;
CREATE TABLE if not exists message (
  `id` int not null auto_increment,
  `creator_id` int(11) comment '该信息的作者,如果为空,则表示是系统信息',
  `creator_username` varchar(100) comment '创建者的用户名',
  `receiver_id` int(11) comment '接收者,如果为空,则表示是群发信息',
  `receiver_username` varchar(100) comment '接收者的用户名',
  `content` text not null comment '对不同的typename的消息会有不同的数据结构, 是json',
  `subject_id` int(11) comment '一串消息中的第一个消息的编号',
  `parent_id` int(11) comment '有的消息是对某个消息的回复',
  `typename` varchar(100),
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 comment='消息.用来通知用户的一些消息. 比如新的案件搞抽样裁决,就可以通过这个来通知被抽中的用户.也可用于用户间的私信';


drop table if exists user;
CREATE TABLE if not exists user (
  `id` int not null auto_increment,
  `email` varchar(128) unique,
  `provider` varchar(30) comment 'oauth提供者,比如weibo,taobao',
  `openid` int comment 'oauth帐号的uid',
  `username` VARCHAR(30) NOT NULL unique,
  `password` VARCHAR(128),
  `agent_id` int(11) comment '表示代理人的user id,如果是本人亲自上网,该项为空. scenter注册的代理人则能够代理ssys所有的动作, 在一些app中也可以实现代理人逻辑, 这些代理人只能代理该app内部的动作, 不过也许没这个必要, 最终的努力还是要加强用户易用性,使得没有人需要代理.被代理的用户称作委托人, 并非所有正常人能够执行的动作委托人能够执行, 即不是所有动作都能够代理的.',
  `agent_username` varchar(128),
  `agent_type` varchar(30),
  `registerip` varchar(45) comment '注册ip',
  `role` varchar(128) comment '比如管理员,普通成员,禁裁决成员',
  `checked_at` int(10) comment '用户查看信息通知的时间',
  `login_at` int(10) comment '最后登录时间',
  `logout_at` int(10) comment '最后登出时间',
  `has_photo` bool not null default 0 comment '是否上传了头像',
  `points` int(10) not null default 0 comment '积分',
  `weight` float not null default 1 comment '权重',
  `verdict_count` int(10) not null default 0 comment '参与裁决的次数',
  `sample_count` int(10) not null default 0 comment '被抽中的次数',
  `fa_count` int(10) not null default 0 comment '赔偿的次数',
  `shang_count` int(10) not null default 0 comment '被赔偿的次数',
  `fa_amount` int(10) not null default 0 comment '赔偿的金额总数',
  `shang_amount` int(10) not null default 0 comment '被赔偿的金额总数',
  `plaintiff_count` int(10) not null default 0 comment '做原告的次数',
  `defendant_count` int(10) not null default 0 comment '做被告的次数',
  `reconciled_count` int(10) not null default 0 comment '和解的次数',
  `fulfilled_count` int(10) not null default 0 comment '执行赔偿的次数',
  `created_at` int(10) NOT NULL COMMENT '注册时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;

drop table if exists kase;
CREATE TABLE IF NOT EXISTS `kase` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '案件ID',
  `name` varchar(100) not null comment '', 
  `defendant_username` varchar(100) not NULL COMMENT '被告名称',
  `defendant_id` int(11) not null,
  `defendant_url` varchar(2000) NOT NULL COMMENT '被告店家网址',
  `item_name` varchar(100) comment '购买的商品名称',
  `item_url` varchar(2000) comment '商品链接',
  `bought_at` int(10) comment '购买商品时间',
  `price` decimal(10,2) comment '总共支付了多少钱(含运费),以元为单位,精确到分',
  `shipping_fee` decimal(10,2) default 0 comment '买时支付的运费',
  `delivered_at` int(10) comment '收到商品时间',
  `problem` text comment '发现的问题',
  `defendant_response` varchar(140) comment '被告的回应',
  `found_at` int(10) comment '发现问题时间',
  `returned_at` int(10) comment '退货时间',
  `returned_fee` decimal(10,2) comment '退货运费',
  `claimed` decimal(10,2) comment '原告要求的退还金额',
  `agreed` decimal(10,2) comment '被告答应退还的金额, 可以为负, 即反诉',
  `fine` decimal(10,2) comment '原告要求的罚款',
  `verdicted_at` int(10) COMMENT '开始裁决时间',
  `verdict_count` int(5) not null default 0 comment '裁决数量',
  `truth` float not null default 0 comment '表示该案件的真相被了解程度',
  `truthcount` int(5) not null default 0 comment '真相度评分的数量',
  `optcount` int(5) not null default 0 comment '选项数量',
  `pan_returned` decimal(10,2) comment '判定退款',
  `pan_fine` decimal(10,2) comment '判定罚款',
  `status` varchar(20) not null default 'addingFacts' comment '案件状态, 包括:addingFacts,plaintiffReady,defendantReady,reconciled,withdrew',
  `convicted_at` int(10) comment '宣判日期',
  `convicted` decimal(10,2) comment '宣判退款结果',
  `convicted_fine` varchar(1000) comment '宣判处罚结果, 是一段文字, 也有可能是规范化的惩罚组合的json',
  `creator_id` int(11) not null comment '立案人',
  `creator_username` varchar(100) not null comment '创建者的用户名',
  `created_at` int(10) NOT NULL COMMENT '立案时间',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='案件' AUTO_INCREMENT=1 ;

drop table if exists verdict;
CREATE TABLE IF NOT EXISTS `verdict` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '裁决ID',
  `kase_id` int(11) not null,
  `kase_name` varchar(100) not null,
  `truth` float not null default 0 comment '表示该案件的真相在本次裁决时被了解程度',
  `reason` varchar(140) comment '评判理由',
  `bestX` decimal(10,2) not null comment '最满意的退款',
  `points_code` text COMMENT 'points的json编码',
  `weight` float not null default 1 comment '配权后的权重',
  `weight0` float not null default 1 comment '配权前的权重',
  `creator_id` int(11) NOT NULL COMMENT '用户ID,表示裁决赋值的用户, 它可以是个体用户也可以是群体用户',
  `creator_username` varchar(100) not null comment '创建者的用户名',
  `updated_at` int(10) NOT NULL COMMENT '更新时间',
  `created_at` int(10) NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='裁决,将个体投票和群体裁决都合并成一个概念了' AUTO_INCREMENT=1 ;

