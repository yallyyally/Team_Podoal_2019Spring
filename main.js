var express = require('express');
var app = express();
var ejs = require('ejs');
const path = require('path');
/* */
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/*데이터 베이스 연결 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://computer0:computer0@ds363996.mlab.com:63996/knublog', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("DB와 연결 양호");
});

/*사진*/
var filename
var multer = require('multer'); // multer모듈 적용 (for 파일업로드)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    filename = new Date().valueOf()+ext;
    cb(null, filename);
  }
})
const upload = multer({
  storage,
  limits: {
      files: 3,
      fileSize: 1024 * 1024 * 1024,
  }
});

/*모델값들 정리(게시판)*/
var Free = require('./models/free');
var User = require('./models/user');
var Picture = require('./models/picture');

/*로그인 유지 */
var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'tired',
  resave: false,
  saveUninitialized: true,
}));
//
app.set('views', __dirname + '/public');
app.set('view engine','ejs');

/*
 메인 홈페이지 
*/
app.get('/', function (req, res) {
  res.render("welcome.ejs", { user: req.session.user })
})

//----------------------------------------------------------------------------------------
// 로그인
app.get('/login', function (req, res) {
  res.render('login.ejs')
})
app.post('/login', function (req, res) {
  User.findOne({ id: req.body.id }, function (err, user) {
    if (!user) {
      console.log('wrong id!')
      res.redirect('/login')
    }
    else {
      if (!user.validateHash(req.body.pw)) {
        console.log('wrong pw!')
        res.redirect('/login')
      } else {
        req.session.user = user.id;
        res.redirect('/')

      }
    }
  })
})
//로그아웃
app.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('/')
  })
})
// 회원가입
app.get('/signUp', function (req, res) {
  if (!req.session.user) {
    res.render('signUp.ejs')
  }
  else {
    res.redirect('/')
  }
})
app.post('/signUp', function (req, res) {
  User.find({ id: req.body.id }, function (err, user) {

    if (err) throw err;
    if (user.length > 0) {

    } else {
      var user = new User({
        id: req.body.id,
        pw: req.body.pw
      })
      user.pw = user.generateHash(user.pw);
      user.save(function (err) {
        if (err) throw err;
        res.redirect('/')
      })
    }
  })
})

//----------------------------------------------------------------------------------------
/*자유게시판 & 작성*/
app.get('/free_list', function (req, res) {
  Free.find({}, function (err, results) {
    if (err) throw err;
    res.render('free_list.ejs', { boards: results, user: req.session.user });
  });
})
app.post('/free', function (req, res) {
  var board = new Free({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/');
});
app.get('/writing_free', function (req, res) {
  res.render("writing_free.ejs", { user:req.session.user, user: req.session.user });
})
app.post('/writing_free', function (req, res) {
  var board = new Free({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/free_list');
});

// ----------------------------------------------------------------------------------------
/*사진게시판*/
var pictureFolder = './uploads';//사진 파일이 업로드될 폴더
var fs = require('fs');//파일시스템 사용


app.get('/picture', function (req, res) {
  fs.readdir(pictureFolder, function (error, filelist) {
    Picture.find({}, function (err, results) {
      if (err) throw err;
      res.render('picture.ejs', { user:req.session.user, files: filelist, boards: results});
    });    
  })
});

app.use(express.static('uploads'));

app.get('/uploads', function (req, res) {
  res.render('uploads.ejs', {user:req.session.user});
});

app.post('/uploads', upload.single('userfile'), function (req, res) {
  console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.

  var board = new Picture({
    author: req.session.user,
    content: req.body.content,
    title: filename
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/picture');
});

/*
app.get('/picture', function (req, res) {
  fs.readdir(pictureFolder, function (error, filelist) {
    res.render('picture.ejs', { user:req.session.user, files: filelist});
  })
});

app.use(express.static('uploads'));

app.get('/uploads', function (req, res) {
  res.render('uploads.ejs');
});

app.post('/uploads', upload.single('userfile'), function (req, res) {
  console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
  res.redirect('/picture');
});

*/
///// 팝업 //////
app.get('/popup_free', function (req, res) {
  res.render('popup_free.ejs');
})


//수정
app.get('/rewrite_free/:id', function (req, res) {
  Free.findOne({_id: req.params.id}, function (err, boards) {
    res.render('rewrite_free.ejs', {result: boards, user:req.session.user });
  })
});

app.post('/rewrite_free/:id', function (req, res) {
  Free.findOne({ _id: req.params.id }, function (err, board) {
    board.title = req.body.inputTitle;
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/show_free_list/' + board._id);
    });
  });
});

// ----------------------------------------------------------------------------------------
/*show*/
app.get('/show_free_list/:id', function (req, res) {
  Free.findOne({ _id: req.params.id }, function (err, boards) {
    boards.hits++
    boards.save(function (err) {
      res.render('show_free_list.ejs', { result: boards,user: req.session.user  });
    })
  })
})
//좋아요
app.post('/free_like/:id', function (req, res) {
  Free.findOne({ _id: req.params.id }, function (err, boards) {
    boards.like++
    boards.hits--;
    boards.save(function (err) {
      res.redirect('/show_free_list/' + req.params.id);
    })
  })
})

//삭제
app.post("/destroy_free/:id", function(req,res){
  Free.deleteOne({_id: req.params.id}, function(err){
    res.redirect('/free_list');
  })
})
app.post("/destroy_picture/:id", function(req,res){
  Picture.findOne({ id: req.body.id }, function (err, p){
    fs.unlink('./uploads/'+p.title, function (err) {
      if (err) throw err;
      console.log('./uploads/'+p.title+' successfully deleted');
      Picture.deleteOne({_id: req.params.id}, function(err){
        console.log('successfully deleted');
        res.redirect('/picture');
      })
      });
  })
})
// ----------------------------------------------------------------------------------------
app.listen(3000);
