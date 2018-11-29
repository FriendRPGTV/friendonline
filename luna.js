//============================================
//    Discord [https://discord.gg/Mxu3enn]
//    Class LunaClient V 1.2
//        Developers
//            Chakung#0785
//            YuugenP#0419
//            Armacg#6517
//            ...
// © Copyrights Luna Project
//============================================
const fs = require('fs');
const manager = require('./static/manager.json');
const dbconfig = { part: '/static/', file: 'manager.json' };
const log = (text) => { console.log(text) };
function isPoint(str, ID) {
    let result = '';
    result = str;
    let userTarget = {};
    let addPoint = true;
    manager.love.forEach(user => {
        if (user.id === ID) {
            if (!user.currentPoint)
                user.currentPoint = [{"word":"คำเพิ่มคะแนน"}];
            userTarget = user;
        }
    })
    userTarget.currentPoint.forEach(cur => { 
        if (cur.word == str) 
            addPoint = false; 
    })
    if (addPoint) userTarget.currentPoint.push({word:str});
    return Boolean(addPoint);
}
function saveLove(user,point) {
        user.point += point;
        let curLevel = Math.floor(0.3 * Math.sqrt(user.point));
        if (curLevel > user.level && user.level < 11)
            user.level = curLevel;
        for (let i = 0; i < 10; i++)
        if (user.level > 1)
            user.message = 'ร่าเริง';
        if (user.level > 2)
            user.message = 'สนิทกับคุณมากขึ้น';
        if (user.level > 3)
            user.message = 'ชอบคุณเข้าแล้วละ';
        if (user.level > 4)
            user.message = 'หลงรัก';
        if (user.level > 5)
            user.message = 'รัก ❤';
        if (user.level > 6)
            user.message = 'รักมาก ❤';
        if (user.level > 7)
            user.message = 'รักมากๆ ❤❤';
        if (user.level > 8)
            user.message = 'รักที่สุดเลย ❤❤❤';
        if (user.level > 9)
            user.message = '💍 ที่รัก';
}
var no = { _l: 0, _s: 0 };
function lunaDB(event, config) {
  let e = event.name;
  let part = config.part;
  let db = config.file;
  var out;
  return new Promise((res, rej) => {
    if (e === 'load') {
      if (no._l == 0) {
        no._l = 1;
        return fs.readFile('.'+part+db, (err, data) => {
          if (err) return console.log(err);
          log('DB: Importing data...');
          res(JSON.parse(data));
          log('DB: Data was loaded.');
          no._l = 0;
          //return JSON.parse(data);
        });
      } else { rej('DB: Error load database is using now.'); 
      }
    } else if (e === 'save') {
      out = fs.createWriteStream(__dirname+part+db);
      if (no._s == 0) {
        no._s = 1;
        out.write(JSON.stringify(event.data), () => { no._s = 0; log('DB: New data has saved at '+(new Date)); });
        res({msg: 'done'});
      } else { rej('DB: Error save database is using now.'); 
      }
    } else {
      log('DB: No event ' + e);
      rej('DB: Error cant connect to database.');
    }
  }).catch((err) => log(err));
}
class LunaClient {
  constructor() {
    let self = this;
    self.database = (event) => {
      return lunaDB(event, dbconfig);
    };
    self.newUser = (ID, noU = true) => {
        manager.love.forEach(user => { if (user.id == ID) noU = false; });
        if (noU) manager.love.push({ id: ID, point: 1, level: 1, heart: ":heart:", message: "สนุก" });
    };
    self.isPoint = (str, ID) => {
        return isPoint(str, ID);
    };
    self.setLove = (ID, point = 0) => {
        manager.love.forEach(user => {
            if (user.id === ID) saveLove(user,point);
        });
    };
    self.getLove = (ID, obj = {}) => {
        manager.love.forEach(user => {
            if (user.id === ID) {
                let loves = '';
                for (let i = 1; i < 11; i++) {
                    if (user.level >= i)
                        loves += '❤';
                    else
                        loves += '';
                }
                user.heart = loves;
                obj = user;
            }
        });
        return obj;
    };
    self.learn = (askmsg, ansmsg) => {
        manager.chat[0].learn.push({"ask":askmsg,"ans":ansmsg,"feel":"เรียนรู้"});
    };
    self.searchFor = (input, r = {}) => {
        manager.chat[0].learn.forEach(item => {
            if (input.includes(item.ask))
                r = item;
        })
        return r;
    };
    self.replyTo = (input) => {
        let r = self.searchFor(input);
        return r;
    };
  }
}
module.exports = LunaClient;
module.exports.manager = manager;