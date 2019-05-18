var express = require('express')
var app = express()
var ejs = require('ejs')
var bodyParser = require('body-parser');
/*사진*/
var multer = require('multer'); // multer모듈 적용 (for 파일업로드)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
var upload = multer({ storage: storage })

var upload = multer({ storage: storage })
/******/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*데이터 베이스 연결 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://computer0:computer0@ds115263.mlab.com:15263/mtree', { useNewUrlParser: true });


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("DB와 연결 양호");
});

var free = require('./models/boardSchema');

/*사진*/
app.get('/board2', function(req, res){
  res.render('board2.ejs');
});

app.get('/uploads', function(req, res){
  res.render('uploads.ejs');
});

app.post('/uploads', upload.single('userfile'), function(req, res){
  //alert('Uploaded! : '+req.file); // object를 리턴함
  console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
  res.redirect('/board2');
});

/******/

//board1-1
app.get('/', function (req, res) {
  free.find({}, function (err, results) {
    if (err) throw err;
    res.render('board1-1.ejs', {boards: results});
  });
})
app.post('/', function (req, res) {
  var board = new free({
    title: req.body.title,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);
  });
  res.redirect('/');
});

//board1-2
app.get('/board1-2/:id', function (req, res) {
  free.findOne({ _id: req.params.id }, function (err, boards) {
    boards.hits++
    boards.save(function (err) {
      res.render('board1-2.ejs', { result: boards });
    })
  })
})


//board4
app.get('/board4', function (req, res) {
  free.find({}, function (err, results) {
    if (err) throw err;
    res.render('board4.ejs', {boards: results});
  });
})


//destroy
app.post("/destroy/:id", function(req,res){
  free.deleteOne({_id: req.params.id}, function(err){
    res.redirect('/');
  })
})

//write
app.get('/write', function (req, res) {
  res.render("write.ejs");
})
app.post('/write', function (req, res) {
  var board = new free({
    title: req.body.title,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/');
});

//rewrite
app.get('/rewrite/:id', function (req, res) {
  free.findOne({_id: req.params.id}, function (err, boards) {
    res.render('rewrite.ejs', {result: boards});
  })
});
app.post('/rewrite/:id', function (req, res) {
  free.findOne({ _id: req.params.id }, function (err, board) {
    board.title = req.body.inputTitle;
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/board1-2/' + board._id);
    });
  });
});
app.listen(2500);