var uuid = require('uuid/v1'),
  db = require('../db/');

// GET /msg
exports.getList = function (req, res) {
  var authors = req.query.authors,
    offset = ~~req.query.offset || 0,
    limit = ~~req.query.limit || 5;

  var msgs_ = db.get('msgs');
  if (authors) {
    authors = authors.split(',');
    msgs_ = msgs_.filter(function (msg) {
      return authors.indexOf(msg.author) !== -1;
    });
  }

  res.ajaxReturn({
    total: msgs_.size().value(),
    rows: msgs_.orderBy('ctime', 'desc').slice(offset, offset + limit).value()
  });
};

// POST /msg
exports.add = function (req, res) {
  if (!req.body.title || !req.body.content) {
    return res.ajaxReturn(false, { errMsg: 'title 或 content 字段为空' });
  }

  req.body.id = uuid().substr(0, 8);
  req.body.author = db.get('session.username').value();
  req.body.ctime = Date.now();
  req.body.likeCount = 0;
  req.body.likedBy = [];
  
  res.ajaxReturn(
    db.get('msgs').push(req.body).last().value()
  );
};

// GET /msg/authors
exports.authors = function (req, res) {
  res.ajaxReturn(db.get('msgs').map('author').uniq().value());
};

// GET /msg/:msgId
exports.getById = function (req, res) {
  var target = db.get('msgs').find({ id: req.params.msgId }).value();
  if (target) return res.ajaxReturn(target);
  res.ajaxReturn(false, { errMsg: '不存在该留言信息' });
};

// PUT /msg/:msgId
exports.update = function (req, res) {
  delete req.body.id;     // 防止篡改 ID
  delete req.body.author; // 防止篡改作者

  req.body.ctime = Date.now();

  var target_ = db.get('msgs').find({
    id: req.params.msgId,
    author: db.get('session.username').value()
  });

  if (target_.isEmpty().value()) {
    return res.ajaxReturn(false, { errMsg: '修改失败' });
  }

  res.ajaxReturn(target_.assign(req.body).value());
};

// DELETE /msg/:msgId
exports.remove = function (req, res) {
  var target = db.get('msgs').remove({
    id: req.params.msgId,
    author: db.get('session.username').value()
  }).value()[0]; // 删除返回的是一个集合

  if (target) return res.ajaxReturn(target);
  res.ajaxReturn(false, { errMsg: '删除失败' });
};

// POST /msg/:msgId/like
exports.like = function (req, res) {
  var username = db.get('session.username').value();
  if (!username) {
    return res.ajaxReturn(false, { errMsg: '请先登录后再点赞' });
  }

  var target_ = db.get('msgs').find({ id: req.params.msgId });
  var target = target_.value();

  if (!target) {
    return res.ajaxReturn(false, { errMsg: '留言不存在' });
  }

  var likedBy = target.likedBy || [];
  var likeCount = target.likeCount || 0;
  var isLiked = likedBy.indexOf(username) !== -1;

  if (isLiked) {
    likedBy = likedBy.filter(function (user) {
      return user !== username;
    });
    likeCount--;
  } else {
    likedBy.push(username);
    likeCount++;
  }

  target_.assign({
    likeCount: likeCount,
    likedBy: likedBy
  }).write();

  res.ajaxReturn(target_.value());
};
