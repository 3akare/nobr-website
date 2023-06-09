exports.homeRoute = (req, res) => {
  res.render('index');
};

exports.textRoute = (req, res) => {
  res.render('text-chat');
};

exports.videoRoute = (req, res) => {
  res.render('video-chat');
};

exports.legalRoute = (req, res) => {
  res.render('legal');
};
