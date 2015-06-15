create database if not exists testssys;
use testssys;
drop table if exists user;
CREATE TABLE if not exists user (
  `id` int not null auto_increment,
  `email` varchar(128) unique,
  `provider` varchar(30) comment 'oauth提供者,比如weibo,taobao',
  `openid` int comment 'oauth帐号的uid',
  `username` VARCHAR(30) NOT NULL unique,
  `password` VARCHAR(128),
  `registerip` varchar(45) comment '注册ip',
  `role` varchar(128) comment '比如管理员,普通成员,禁裁决成员',
  `login_at` int(10) comment '最后登录时间',
  `logout_at` int(10) comment '最后登出时间',
  `has_photo` bool not null default 0 comment '是否上传了头像',
  `created_at` int(10) NOT NULL COMMENT '注册时间',
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;


