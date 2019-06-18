var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//몽구수 내부의 있는 방식
var User = new Schema({
   id:String,
   pw:String
});


var bcrypt = require('bcryptjs');
// 비밀번호를 암호화 시키는 방법 npm install 에서 설치해야 된다.
User.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, 8);
};
//비밀번호를 암호화 하는 함수, 방식은 암호들을 간격을 떨어트려 놓고 그 사이에 
//의미없는 문자들을 넣는다.
User.methods.validateHash = function(password) {
  return bcrypt.compareSync(password, this.pw);
};
//저장된 비밀번호랑 사용자가 암호를 쳤을 때 빅하는 함수
//this 는 속해있는 객체를 의미 비교해서 같으면 true리턴 다르면 false 리턴
module.exports = mongoose.model('user', User);