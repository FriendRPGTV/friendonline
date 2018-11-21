'use strict';
const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ngrok = require('ngrok');
const jimp = require('jimp');
const request = require('request');
const requests = require('requests');
const Canvas = require('canvas');
const google = require('google');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");
const ytdl = require('ytdl-core');
const gif = require("gif-search");
const http = require('http');
const https = require('https');
const {URL, URLSearchParams} = require('url');
const LunaClient = require('./luna');
const luna = new LunaClient();
const manager = LunaClient.manager;
const config = {
  channelAccessToken: process.env.TOKEN,
  channelSecret: process.env.SECRET,
};
let baseURL = process.env.URL;
let webhook_url = process.env.WEBHOOK;
const client = new line.Client(config);
let prefix = '.';
let botname = 'เฟรน';
let chaID = 'U772d4e83d42a35a37b69b11ae3649e5b';
let botID = '0000000';
let botPing = 0;
let botUser = 0;
let botGroup = 0;
let botEngine = 'Node ภาษา javascript';
let botDatabase = 'ยังไม่มี';
let botCreatedAt = 'วันเสาร์ 17 พ.ย. 2018';
let botSite = 'https://discord.gg/Mxu3enn';
let botInvite = 'https://line.me/R/ti/g/DChRRzN0Wt';
let dangerMessage = ["cleanse","group cleansed.","mulai",".winebot",".kickall","mayhem","kick on","Kick","!kickall","nuke","บิน","Kick","กระเด็น","หวด","เซลกากจัง","เตะ","ปลิว"];
let fuckerMessage = ["ควย","หี","แตด","เย็ดแม่","เย็ด","ค.วย","สัส","เหี้ย","ไอ้เหี้ย","มึงตาย","ไอ้เลว","ระยำ","ชาติหมา","หน้าหี","กาก","พ่องตาย","ส้นตีน","แม่มึงอ่ะ","แม่มึงดิ","พ่อมึงดิ"];
let friendAvatar = 'https://cdn.discordapp.com/avatars/481876657527848960/dff6e806a8b6479c3c0ef9e4aae6bf9f.png?size=2048';
const app = express();
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));
app.get('/', (req, res) => {
  fs.readFile('index.html', function(err, data) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.send(data);
    res.end();
  });
});
app.get('/callback', (req, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.send('<h1>This is bot webhook.</h1>');
  res.end()
});
app.post('/callback', line.middleware(config), (req, res) => {
  if (req.body.destination) {
    console.log("Destination User ID: " + req.body.destination);
  }
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const webhooks = (embed) => {
  request.post({
    method: 'post',
    json: true,
    url: webhook_url,
    body: embed,
    headers: { 'Content-Type': 'application/json' }
  }, (err, res, body) => {
    if (err) return console.log('Error :', err)
    console.log('Webhooks :', body)
  });
};

webhooks(
  { 
    "content": "💬 LINE Application",
    "embeds": [ {
      "color": 4886754,
      "description": "LINE Bot Message Api is Online !", 
      "author": {
        "name": `Friend Chan`,
        "icon_url": `${friendAvatar}`
      }
    } ]
  }
);

const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

const replyImage = (token, urls) => {
  return client.replyMessage(
    token,
    {
      type: 'image',
      originalContentUrl: urls[0],
      previewImageUrl: urls[1],
    }
  );
};

function handleEvent(event) {
  if (event.replyToken.match(/^(.)\1*$/)) {
    return console.log("Test hook recieved: " + JSON.stringify(event.message));
  }

  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'ขอบคุณที่เป็นเพื่อนกับเฟรนจังนะคะ ❤');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);
    
    case 'memberJoined':
      return handleJoin(event.joined, event.replyToken, event.source);
      
    case 'memberLeft':
      return handleLeave(event.left, event.source);
      
    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `ตอบกลับ: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleMessage(author, message, replyToken) {
  let msg = message.text;
  if (msg.startsWith(prefix)) {
    onCommand(author, message, replyToken);
  } else {
    onChat(author, message, replyToken);
  }
}

function sendAvatar(author, message, replyToken) {
  let ImageUrl = author.avatarURL;
  return replyImage(replyToken, [ImageUrl, ImageUrl])
}

async function sendYoutube(author, message, replyToken) {
  const args = message.text.split(' ');
  var searchString = args.slice(1).join(' ');
  var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
  var video;
  var result = [];
  var imgcaroucel = {};
  if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    const playlist = await youtube.getPlaylist(url);
    const videos = await playlist.getVideos();
    for (const video of Object.values(videos)) {
      result = [`ช่อง ${video.channel.title} | ${video.title} (${(video.duration.hours > 0 ? video.duration.hours+':' : '')}${(video.duration.minutes > 0 ? (video.duration.minutes > 9 ? video.duration.minutes+':' : '0'+video.duration.minutes+':') : '')}${(video.duration.seconds > 9 ? video.duration.seconds : '0'+video.duration.seconds)})`];
      imgcaroucel = {
        type: 'template',
        altText: 'Youtube '+serachString,
        template: {
          type: 'image_carousel',
          columns: [
            {
              imageUrl: video.thumbnails.maxres.url,
              action: { label: video.title, type: 'uri', uri: 'https://www.youtube.com/watch?v='+video.id },
            },
          ],
        },
      };
    }
  } else {
    try {
      video = await youtube.getVideo(url);
    } catch (error) {
      try {
        var videos = await youtube.searchVideos(searchString, 5);
        let index = 0;
        result = [`🔎 ผลการค้นหาจาก YouTube`];
        imgcaroucel = {
          type: 'template',
          altText: 'Youtube '+searchString,
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: videos[0].thumbnails.maxres.url,
                action: { label: videos[0].title, type: 'uri', uri: 'https://www.youtube.com/watch?v='+videos[0].id }
              },
              {
                imageUrl: videos[1].thumbnails.maxres.url,
                action: { label: videos[1].title, type: 'uri', uri: 'https://www.youtube.com/watch?v='+videos[1].id }
              },
              {
                imageUrl: videos[2].thumbnails.maxres.url,
                action: { label: videos[2].title, type: 'uri', uri: 'https://www.youtube.com/watch?v='+videos[2].id }
              },
              {
                imageUrl: videos[3].thumbnails.maxres.url,
                action: { label: videos[3].title, type: 'uri', uri: 'https://www.youtube.com/watch?v='+videos[3].id }
              },
              {
                imageUrl: videos[4].thumbnails.maxres.url,
                action: { label: videos[4].title, type: 'uri', uri: 'https://www.youtube.com/watch?v='+videos[4].id }
              },
            ],
          },
        };
      } catch (err) {
        console.error(err);
      }
    }
  }
  return replyText(replyToken, result)
  .then(client.pushMessage((author.gid == '' ? author.id : author.gid), imgcarousel));
}

function sendSearch(author, message, replyToken) {
  google.resultsPerPage = 5
  var index;
  var caroucel = {
    type: 'template',
    altText: 'ค้นหาข้อมูลจาก Google',
    template: {
      type: 'carousel',
      columns: [
        {
          thumbnailImageUrl: '',
          title: 'เว็บไซต์',
          text: 'เนื้อหา',
          actions: [
            { label: 'เปิด', type: 'uri', uri: '' }
          ],
        },
        {
          thumbnailImageUrl: '',
          title: 'เว็บไซต์',
          text: 'เนื้อหา',
          actions: [
            { label: 'เปิด', type: 'uri', uri: '' }
          ],
        },
        {
          thumbnailImageUrl: '',
          title: 'เว็บไซต์',
          text: 'เนื้อหา',
          actions: [
            { label: 'เปิด', type: 'uri', uri: '' }
          ],
        },
        {
          thumbnailImageUrl: '',
          title: 'เว็บไซต์',
          text: 'เนื้อหา',
          actions: [
            { label: 'เปิด', type: 'uri', uri: '' }
          ],
        },
        {
          thumbnailImageUrl: '',
          title: 'เว็บไซต์',
          text: 'เนื้อหา',
          actions: [
            { label: 'เปิด', type: 'uri', uri: '' }
          ],
        },
      ],
    },
  };
  var result = ['🔎 ค้นหาข้อมูลจาก Google'];
  let str = message.text.split(' ').slice(1).join(' ');
  if (!str) return;
  google(str, (err, res) => {
    if (err) return console.error('[Google Error]\n'+err)
    index = res.links;
    if (!index) return;
    for (var i = 0; i < index.length; ++i) {
      const link = index[i];
      caroucel.template.columns[i].thumbnalImageUrl = link.href;
      caroucel.template.columns[i].title = link.title;
      caroucel.template.columns[i].text = link.description;
      caroucel.template.columns[i].actions[0].uri = link.href;
    }
    console.log('[Google]\n'+ res.body);
  })
  return replyText(replyToken, result)
  .then(client.pushMessage((author.gid == '' ? author.id : author.gid), caroucel));
}

async function sendNeko(message, replyToken, endpoint) {
  let end = endpoint;
  if (end === 'face') end = 'avatar';
  let url = `https://nekos.life/api/v2/img/${end}`;
  const Image = new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const {statusCode} = res;
      if(statusCode !== 200) {
        res.resume();
        reject(`Request failed. Status code: ${statusCode}`);
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {rawData += chunk});
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch(e) {
          reject(`Error: ${e.message}`);
        }
      });
    }).on('error', (err) => {
      reject(`Error: ${err.message}`);
    })
  });
  let link = await Image;
  console.log(link);
  return replyImage(replyToken, [link.url, link.url]);
}

function sendGame(author, message, replyToken, game) {
  switch (game) {
    case 'ox':
      return gameOX(author, message, replyToken);
    case 'rps':
      return gameRPC(author, message, replyToken);
    default:
      throw new Error(`ไม่มีเกมส์ ${game} ในระบบค่ะ: ${JSON.stringify(message)}`);
  }
}

function sendCanvas(player, canvas, replyToken, board = []) {
    var out, stream, img, title, part = '/downloaded/'+`ttt_${player.id}.png`;
    out = fs.createWriteStream(__dirname+part);
    stream = canvas.createPNGStream()
    stream.on('data', (chunk) => out.write(chunk));
    stream.on('end', () => {
      console.log('The PNG file was created.');
      img = 'https://friendbotline.herokuapp.com'+part;
      var Spots = emptyIndexies(board);
      if (winning(board, huPlayer)) {
        title = `เกมส์ OX | Friend VS ${player.username}`+
        `\n🎉 ผู้ชนะคือ ${player.username} ยินดีด้วยค่ะ!`+
        `\nคุณได้รับ 50 คะแนน`;
        luna.newUser(user.id);
        luna.setLove(user.id, 50);
      } else if (winning(board, aiPlayer)) {
        title = `เกมส์ OX | Friend VS ${player.username}`+
        `\n🎉 ผู้ชนะคือ Friend คุณไม่มีทางชนะเฟรนได้แน่นอนค่า~`+
        `\nคุณไม่ได้รับคะแนน`;
      } else if (Spots.length == 0) {
        title = `เกมส์ OX | Friend VS ${player.username}`+
        `\n🎉 เสมอกัน! เล่นกับเฟรนอีกรอบมั้ยค่ะ?`;
      } else {
        title = `เกมส์ OX | Friend VS ${player.username}`+
        `\nพิมพ์ ตัวเลข เพื่อวาด ⭕ ลงในช่องว่าง`+
        `\nรอบของคุณ${player.username}`;
      }
      return client.replyMessage(
          replyToken,
          { type: 'text', text: title }
      ).then(
        client.pushMessage((player.gid == '' ? player.id : player.gid), { type: 'image', originalContentUrl: img, previewImageUrl: img})
        .then(() => {
          console.log("Friend has sent image "+img);
        })
        .catch((err) => {
          console.log(err)
        })
      ).catch((err) => console.log(err));
    });
}

function gameOX(author, message, replyToken) {
  let player = author;
  let name = player.username;
  let say = message.text;
  let board = [];
  var gameTTT = true;
  manager.game[0].tictactoe.forEach(g=> {
    if (g.id == player.id) gameTTT = false;
  })
  if (gameTTT) manager.game[0].tictactoe.push({playing:'true', id:`${player.id}`,board:[0, 1, 2, 3, 4, 5, 6, 7, 8]});
  manager.game[0].tictactoe.forEach(g=> {
    if (g.id == player.id) { g.board = [0, 1, 2, 3, 4, 5, 6, 7, 8]; g.playing = 'true'; board = g.board; }
  })
  let Image = Canvas.Image,
  canvas = new Canvas(400, 400),
  ctx = canvas.getContext('2d');
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo((i == 0 ? 267 : (i == 1 ? 133 : (i == 2 ? 0 : 0))), (i == 0 ? 0 : (i == 1 ? 0 : (i == 2 ? 133 : 267))));
    ctx.lineTo((i == 0 ? 267 : (i == 1 ? 133 : (i == 2 ? 400 : 400))), (i == 0 ? 400 : (i == 1 ? 400 : (i == 2 ? 133 : 267))));
    ctx.lineWidth=5;
    ctx.stroke();
  }
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = `#fff`;
    ctx.font = `18px Arial`;
    ctx.textAlign = `center`;
    ctx.fillText(`${i+1}`, ((i == 0 || i == 3 || i == 6) ? 65 : ((i == 1 || i == 4 || i == 7) ? 200 : 335)), ((i == 0 || i == 1 || i == 2) ? 70 : ((i == 3 || i == 4 || i == 5) ? 206 : 342)));
  }
  return sendCanvas(player, canvas, replyToken, board);
}

function inputOX(msg) {
  let str = msg;
  if (str === '1') return true;
  else if (str === '2') return true;
  else if (str === '3') return true;
  else if (str === '4') return true;
  else if (str === '5') return true;
  else if (str === '6') return true;
  else if (str === '7') return true;
  else if (str === '8') return true;
  else if (str === '9') return true;
  else return false;
}

let huPlayer = 'O';
let aiPlayer = 'X';
let huColor = 'red';
let aiColor = 'blue';
let OX_Difficult = 'hard';
function drawOX(author, message, replyToken) {
  var img;
  let user = author;
  let origBoard = [];
  var ut = true;
  manager.game[0].tictactoe.forEach(g=>{
    if (g.id == user.id && g.playing == 'true') {
      ut = false;
      origBoard = g.board;
    }
  })
  if (ut) return;
  let num = message.text;
  if (origBoard[num] == huPlayer || origBoard[num] == aiPlayer) return;
      origBoard[num] = huPlayer;
      updateBoard(user.id, origBoard);
      if (!winning(origBoard, huPlayer)) {
        var bestSpot = minimax(origBoard, aiPlayer);
        if (bestSpot.index > 0) origBoard[bestSpot.index] = aiPlayer;
        updateBoard(user.id, origBoard);
      }
    
  let Image = Canvas.Image,
    canvas = new Canvas(400, 400),
    ctx = canvas.getContext('2d');
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i == 0 ? 267 : (i == 1 ? 133 : (i == 2 ? 0 : 0))), (i == 0 ? 0 : (i == 1 ? 0 : (i == 2 ? 133 : 267))));
      ctx.lineTo((i == 0 ? 267 : (i == 1 ? 133 : (i == 2 ? 400 : 400))), (i == 0 ? 400 : (i == 1 ? 400 : (i == 2 ? 133 : 267))));
      ctx.lineWidth=5;
      ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
      if (board[i] == huPlayer)
      {
        ctx.beginPath();
        ctx.arc(((i == 0 || i == 3 || i == 6) ? 65 : (i == 1 || i == 4 || i == 7) ? 200 : 335), ((i == 0 || i == 1 || i == 2) ? 65 : (i == 3 || i == 4 || i == 5) ? 200 : 335), 35, 0, 2*Math.PI);
        ctx.lineWidth=8;
        ctx.strokeStyle=huColor;
        ctx.stroke();
      }
      if (board[i] == aiPlayer) {
        ctx.beginPath();
        ctx.moveTo(((i == 0 || i == 3 || i == 6) ? 30 : (i == 1 || i == 4 || i == 7) ? 165 : 300), ((i == 0 || i == 1 || i == 2) ? 100 : (i == 3 || i == 4 || i == 5) ? 165 : 300));
        ctx.lineTo(((i == 0 || i == 3 || i == 6) ? 100 : (i == 1 || i == 4 || i == 7) ? 235 : 370), ((i == 0 || i == 1 || i == 2) ? 30 : (i == 3 || i == 4 || i == 5) ? 235 : 370));
        ctx.lineWidth=8;
        ctx.strokeStyle=aiColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(((i == 0 || i == 3 || i == 6) ? 30 : (i == 1 || i == 4 || i == 7) ? 165 : 300), ((i == 0 || i == 1 || i == 2) ?  30 : (i == 3 || i == 4 || i == 5) ? 235 : 370));
        ctx.lineTo(((i == 0 || i == 3 || i == 6) ? 100 : (i == 1 || i == 4 || i == 7) ? 235 : 370), ((i == 1 || i == 2 || i == 3) ? 100 : (i == 3 || i == 4 || i == 5) ? 165 : 300));
        ctx.lineWidth=8;
        ctx.strokeStyle=aiColor;
        ctx.stroke();
      }
      if (board[i] == i) {
        ctx.fillStyle = `#fff`;
        ctx.font = `18px Arial`;
        ctx.textAlign = `center`;
        ctx.fillText(`${i+1}`, ((i == 0 || i == 3 || i == 6) ? 65 : ((i == 1 || i == 4 || i == 7) ? 200 : 335)), ((i == 0 || i == 1 || i == 2) ? 70 : ((i == 3 || i == 4 || i == 5) ? 206 : 342)));
      }
    }
    return sendCanvas(user, canvas, replyToken, board);
}

function minimax(newBoard, player){
  var availSpots = emptyIndexies(newBoard);
  if (winning(newBoard, huPlayer)){
     return {score:-10};
  }
  else if (winning(newBoard, aiPlayer)){
     return {score:10};
  }
  else if (availSpots.length === 0){
  	 return {score:0};
  }
  var moves = [];
  for (var i = 0; i < availSpots.length; i++){
    var move = {};
  	move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;
    if (player == aiPlayer){
      var result = minimax(newBoard, huPlayer);
      move.score = result.score;
    }
    else{
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }
    newBoard[availSpots[i]] = move.index;
    moves.push(move);
  }
  var bestMove;
  if (player === aiPlayer){
    var bestScore = -100;
    for (var i = 0; i < moves.length; i++){
      if (moves[i].score > bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }else{
    var bestScore = 100;
    for (var i = 0; i < moves.length; i++){
      if (moves[i].score < bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

function emptyIndexies(board) {
  return  board.filter(s => s != "O" && s != "X");
}

function winning(board, player) {
 if (board == []) return false;
 if (
        (board[0] == player && board[1] == player && board[2] == player) ||
        (board[3] == player && board[4] == player && board[5] == player) ||
        (board[6] == player && board[7] == player && board[8] == player) ||
        (board[0] == player && board[3] == player && board[6] == player) ||
        (board[1] == player && board[4] == player && board[7] == player) ||
        (board[2] == player && board[5] == player && board[8] == player) ||
        (board[0] == player && board[4] == player && board[8] == player) ||
        (board[2] == player && board[4] == player && board[6] == player)
    ) {
        return true;
    } else {
        return false;
    }
}

function winBoard(id, winner) {
  manager.game[0].tictactoe.forEach(g=> {
    if (g.id == id) { 
      g.winner = winner;
      g.playing = 'false';
    }
  })
}

function updateBoard(id, board) {
  manager.game[0].tictactoe.forEach(g=> {
    if (g.id == id) g.board = board;
  })
}

function gameRPC(author, message, replyToken) {
  let use = message.text.split(' ').slice(1).join(' ');
  if (!use) return;
  var input;
  if (use === 'rock' || use === 'ค้อน') input = 1;
  else if (use === 'paper' || use === 'กระดาษ') input = 2;
  else if (use === 'scissors' || use === 'กรรไกร') input = 3;
  else return;
  let img = loadImage(`/images/${input}-${Math.floor(Math.random() * 3)+1}.png`);
  return replyImage(replyToken, [img, img]);
}

function loadImage(url) {
  console.log('LoadImage:',url);
  let link = baseURL+url;
  return link;
}

function loadImages(canvas, downloadPath) {
  return new Promise((resolve, reject) => {
    const writable = fs.createWriteStream(downloadPath),
    stream = canvas.pngStream();
    stream.on('data', (chunk) => writable.write(chunk));
    stream.on('end', () => resolve(downloadPath));
    stream.on('error', reject);
  });
}

function checkType(type) {
  if (type === 'group' || type === 'room') {
    return true;
  }
  else if (type === 'user') {
    return false
  }
}

function rude(say, author, message) {
  var rudes = false;
  for (let i = 0; i < dangerMessage.length; i++) {
    if (say.includes(dangerMessage[i])) {
      console.log('[Warn]');
      console.log(message);
      rudes = true;
      replyText(replyToken, `[Warn]\nUser: ${author.username}\nReason: ตรวจพบข้อความอันตราย เฟรนได้แจ้งให้แอดมินทราบแล้วค่ะ หยุดทำผิดเพื่อความปลอดภัยของคุณค่ะ (-3-)\n`);
      break;
    }
  }
  for (let i = 0; i < fuckerMessage.length; i++) {
    if (say.includes(fuckerMessage[i])) {
      console.log('[Warn]');
      console.log(message);
      rudes = true;
      replyText(replyToken, `[Warn]\nUser: ${author.username}\nReason: ตรวจพบคำพูดหยาบคายไม่สุภาพ เฟรนได้แจ้งให้แอดมินทราบแล้วค่ะ กรุณางดใช้คำพูดหยาบคายเพื่อความสงบสุขของทุกคนค่ะ (^-^)\n`);
      break;
    }
  }
  return Boolean(rudes);
}

async function isMention(author, message) {
var userId = author.id;
var groupId = author.gid;
var mention = author.mention;
return new Promise((res, rej) => {
  client.getGroupMemberIds(groupId)
  .then((ids) => {
    ids.forEach((id) => mention.push({id:id}));
  })
  .catch((err) => {
    console.log(err)
  });
  mention.forEach((id) => {
    client.getGroupMemberProfile(groupId, userId)
    .then((profile) => {
      if (id == profile.userId) {
        mention.push({username:profile.displayName});
        mention.push({avatarURL:profile.pictureUrl});
        mention.push({status:profile.statusMessage});
      }
    })
    .catch((err) => {
    console.log(err)
    });
  });
  res(mention);
});
}

function onChat(author, message, replyToken) {
  let msg = message.text;
  if (checkType(author.type)) {
    if (!msg.includes(botname)) return;
    lunaChat(author, message, replyToken);
  } else {
    if (inputOX(msg)) return drawOX(author, message, replyToken);
    lunaChat(author, message, replyToken);
  }
}

function lunaChat(author, message, replyToken) {
  let sender = author;
  let name = sender.username;
  let say = message.text;
  if (rude(say, author, message)) return;
  luna.newUser(sender.id);
  let reply = luna.replyTo(say);
  if (reply && say.includes(reply.ask)) {
    return replyText(replyToken, reply.ans);
  } else if (say.includes('สวัสดี')) {
    let object = manager.chat[0].greeting;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes('น่ารัก') || say.includes('สวย')) {
    let cute = '';
    if (luna.isPoint('น่ารัก', sender.id)) {
      cute = `\n\`คุณได้รับแต้มจาก${botname} +2 แต้ม\``;
      luna.setLove(sender.id,2);
    }
    let object = manager.chat[0].thanks;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply+cute);
  } else if (say.includes('ใจดี')) {
    let cute = '';
    if (luna.isPoint('ใจดี', sender.id)) {
      cute = `\n\`คุณได้รับแต้มจาก${botname} +2 แต้ม\``;
      luna.setLove(sender.id,2);
    }
    let object = manager.chat[0].thanks;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply+cute);
  } else if (say.includes('ฝันดี') || say.includes('ง่วง') || say.includes('นอน') || say.includes('ราตรีสวัสดิ์')) {
    let object = manager.chat[0].goodnight;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes('55') || say.includes('lol') || say.includes('อิอิ') || say.includes('eiei') || say.includes('haha')|| say.includes('ฮ่า')) {
    let object = manager.chat[0].laugh;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes("...")) {
    let object = manager.chat[0].dot;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes('ตลก')||say.includes('ชำ')||say.includes('มุก')||say.includes('ตับ')) {
    let object = manager.chat[0].joke;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes(`รัก${botname}`) || say.includes(`ชอบ${botname}`) || say.includes('ปลื้ม') || say.includes('หลงรัก')) {
    let object = manager.chat[0].love;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes('omae')) {
    return replyText(replyToken, `NANI!!!`)
  } else if (say.includes('โง่') || say.includes('บ้า') || say.includes('เวร') || say.includes('เลว')) {
    let object = manager.chat[0].damn;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else if (say.includes('ความสัมพันธ์')) {
    const love = luna.getLove(sender.id);
    const em = 
      `ข้อมูลความสัมพันธ์ของคุณ ${name}` +
      `\nระดับความรัก : ${love.heart}` +
      `\nความรู้สึก : ${love.message}` +
      `\nแต้มปัจจุบัน : ${love.point}`
    ;
    return replyText(replyToken, em);
  } else if (say.includes('น้อง') || say.startsWith(botname)) {
    if (say.includes('สาว')) {
      let object = manager.chat[0].sister;
      return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
    }
    let object = manager.chat[0].anscall;
    return replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply);
  } else {
    let teachme = `\n${name} สามารถสอน${botname}พูดด้วยคำสั่ง \`${prefix}สอน (คำถาม) (คำตอบ)\` ได้นะคะ`; 
    let object = manager.chat[0].notknow;
    replyText(replyToken, object[Math.floor(Math.random() * Object.keys(object).length)].reply+teachme);
    console.log(`from: ${author.username} say: ${message.text}`);
    webhooks(
      { 
        "embeds": [ {
          "title": `ID: ${author.id}`,
          "description": `${message.text}`,
          "thumbnail": {
            "url": `${author.avatarURL}`
          },
          "author": {
            "name": `${author.username}`,
            "icon_url": `${author.avatarURL}`
          },
          "color": 4886754,
          "footer": {
            "text": `Event Text |`,
            "icon_url": `${friendAvatar}`
          }
        } ]
      }
    );
  }
}

let command = {
  user: [
    { text: 'me' },
    { text: 'ฉัน' }
  ],
  group: [
    { text: 'group' },
    { text: 'กลุ่ม' }
  ],
  help: [
    { text: 'help' },
    { text: 'h' }
  ],
  bot: [
    { text: 'info' },
    { text: 'ข้อมูล' }
  ],
  creator: [
    { text: 'creator' },
    { text: 'ผู้สร้าง' }
  ],
  love: [
    { text: 'love' },
    { text: 'ความสัมพันธ์' }
  ],
  avatar: [
    { text: 'avatar' },
    { text: 'รูป' }
  ],
  teach: [
    { text: 'teach' },
    { text: 'สอน' }
  ],
  youtube: [
    { text: 'youtube' },
    { text: 'ยูทูป' }
  ],
  search: [
    { text: 'search' },
    { text: 'ค้นหา' }
  ],
  neko: [
    { text: 'neko' },
    { text: 'เนโกะ' }
  ],
  meow: [
    { text: 'meow' },
    { text: 'แมว' }
  ],
  face: [
    { text: 'face' },
    { text: 'เฟส' }
  ],
  kiss: [
    { text: 'kiss' },
    { text: 'จูบ' }
  ],
  hug: [
    { text: 'hug' },
    { text: 'กอด' }
  ],
  pat: [
    { text: 'pat' },
    { text: 'ลูบ' }
  ],
  slap: [
    { text: 'slap' },
    { text: 'ตบ' }
  ],
  fox: [
    { text: 'fox_girl' },
    { text: 'จิ้งจอกสาว' }
  ],
  baka: [
    { text: 'baka' },
    { text: 'บ้า' }
  ],
  ox: [
    { text: 'ox' },
    { text: 'xo' }
  ],
  rps: [
    { text: 'rps' },
    { text: 'เปายิ่งฉุบ' }
  ]
};
function onCommand(author, message, replyToken) {
  let sender = author;
  let name = sender.username; 
  let cmd = message.text.split(' ')[0];
  cmd = cmd.slice(prefix.length);
  var args = message.text.split(' ').slice(1);
  if (cmd === command.user[0].text || cmd === command.user[1].text) {
    return replyText(replyToken, `เข้ากลุ่มแชทหลักของบอทเฟรนได้ที่นี่ค่ะ \n${botInvite}`);
  }
  if (cmd === command.user[0].text || cmd === command.user[1].text) {
    let text = '';
    return replyText(replyToken, text);
  }
  if (cmd === command.group[0].text || cmd === command.group[1].text) {
    let text = '';
    return replyText(replyToken, text);
  }
  if (cmd === command.bot[0].text || cmd === command.bot[1].text) {
    let text = 
      `ข้อมูลของบอท`+
      `\nชื่อ: Friend Chan (เฟรนจัง)`+
      `\nไอดี: ${botID}`+
      `\nกลุ่ม: ${botGroup}`+
      `\nเพื่อน: ${botUser}`+
      `\nดูคำสั่ง: ${prefix}help`+
      `\nฐานข้อมูล: ${botDatabase}`+
      `\nพัฒนาด้วย: ${botEngine}`+
      `\nเริ่มทำงานเมื่อ: ${botCreatedAt}`+
      `\nความไวในการตอบกลับ: ${botPing} ms`+
      `\nเว็บไซต์ ${botSite}`
    ;
    return replyText(replyToken, text);
  }
  if (cmd === command.creator[0].text || cmd === command.creator[1].text) {
    let text = 
      `ข้อมูลผู้สร้างบอท`+
      `\nชื่อ: Chakung`+
      `\nเฟส: Polite Cha`+
      `\nดิสคอร์ด: Chakung#0785`+
      `\nอีเมลล์: friendrpgth@gmail.com`
    ;
    return replyText(replyToken, text);
  }
  if (cmd === command.love[0].text || cmd === command.love[1].text) {
    luna.newUser(sender.id);
    const love = luna.getLove(sender.id);
    const em = 
      `ข้อมูลความสัมพันธ์ของคุณ ${name}`+
      `\nระดับความรัก : ${love.heart}`+
      `\nความรู้สึก : ${love.message}`+
      `\nแต้มปัจจุบัน : ${love.point}`
    ;
    return replyText(replyToken, em);
  }
  if (cmd === command.ox[0].text || cmd === command.ox[1].text) {
    return sendGame(author, message, replyToken, command.ox[0].text);
  }
  if (cmd === command.rps[0].text || cmd === command.rps[1].text) {
    return sendGame(author, message, replyToken, command.rps[0].text);
  }
  if (cmd === command.avatar[0].text || cmd === command.avatar[1].text || (cmd.startsWith(command.avatar[0].text) && message.text.includes('@'+m.username))) {
    const uauthor = author;
    if (author.gid != "") {
      isMention(author, (mention) => {
        if (mention) {
          mention.forEach((m) => {
            if (m.id == author.id && message.text.includes('@'+m.username)) uauthor = m;
          });
        }
      });
    }
    return sendAvatar(uauthor, message, replyToken);
  }
  if (cmd === command.search[0].text || cmd === command.search[1].text) {
    return sendSearch(author, message, replyToken);
  }
  if (cmd === command.youtube[0].text || cmd === command.youtube[1].text) {
    return sendYoutube(author, message, replyToken);
  }
  if (cmd === command.neko[0].text || cmd === command.neko[1].text) {
    return sendNeko(message, replyToken, command.neko[0].text);
  }
  if (cmd === command.face[0].text || cmd === command.face[1].text) {
    return sendNeko(message, replyToken, command.face[0].text);
  }
  if (cmd === command.kiss[0].text || cmd === command.kiss[1].text) {
    return sendNeko(message, replyToken, command.kiss[0].text);
  }
  if (cmd === command.hug[0].text || cmd === command.hug[1].text) {
    return sendNeko(message, replyToken, command.hug[0].text);
  }
  if (cmd === command.pat[0].text || cmd === command.pat[1].text) {
    return sendNeko(message, replyToken, command.pat[0].text);
  }
  if (cmd === command.slap[0].text || cmd === command.slap[1].text) {
    return sendNeko(message, replyToken, command.slap[0].text);
  }
  if (cmd === command.baka[0].text || cmd === command.baka[1].text) {
    return sendNeko(message, replyToken, command.baka[0].text);
  }
  if (cmd === command.fox[0].text || cmd === command.fox[1].text) {
    return sendNeko(message, replyToken, command.fox[0].text);
  }
  if (cmd === command.meow[0].text || cmd === command.meow[1].text) {
    return sendNeko(message, replyToken, command.meow[0].text);
  }
  if (cmd === command.help[0].text || cmd === command.help[1].text) {
    let text = [
      `[รายการคำสั่งทั่วไป]`+
      `\n- คำสั่งลิ้งกลุ่ม (invite)`+
      `\n- คำสั่งดูโปรไฟล์ (profile)`+
      `\n- คำสั่งส่งรูปโปรไฟล์ (${prefix}${command.avatar[0].text})`+
      `\n- คำสั่งดูข้อมูลบอท (${prefix}${command.bot[0].text} หรือ ${prefix}${command.bot[1].text})`+
      `\n- คำสั่งดูข้อมูลความสัมพันธ์ (${prefix}${command.love[0].text} หรือ ${prefix}${command.love[1].text})`+
      `\n- คำสั่งดูข้อมูลผู้สร้างบอท (${prefix}${command.creator[0].text} หรือ ${prefix}${command.creator[1].text})`+
      `\n- คำสั่งค้นหาวิดีโอจากยูทูป (${prefix}${command.youtube[0].text} <ชื่อวิดีโอ> หรือ ${prefix}${command.youtube[1].text} <ชื่อวิดีโอ>)`+
      `\n- คำสั่งค้นหาข้อมูลจากกูเกิ้ล (${prefix}${command.search[0].text} <คำค้น> หรือ ${prefix}${command.search[1].text} <คำค้น>)`+
      `\n- คำสั่งส่งรูปอนิเมะโปรไฟล์ (${prefix}${command.face[0].text} หรือ ${prefix}${command.face[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะผู้หญิงหูแมว (${prefix}${command.neko[0].text} หรือ ${prefix}${command.neko[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะจิ้งจอกสาว (${prefix}${command.fox[0].text} หรือ ${prefix}${command.fox[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะกอด (${prefix}${command.hug[0].text} หรือ ${prefix}${command.hug[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะจูบ (${prefix}${command.kiss[0].text} หรือ ${prefix}${command.kiss[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะลูบ (${prefix}${command.pat[0].text} หรือ ${prefix}${command.pat[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะตบ (${prefix}${command.slap[0].text} หรือ ${prefix}${command.slap[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะบ้า (${prefix}${command.baka[0].text} หรือ ${prefix}${command.baka[1].text})`+
      `\n- คำสั่งส่งรูปอนิเมะแมว (${prefix}${command.meow[0].text} หรือ ${prefix}${command.meow[1].text})`+
      `\n- คำสั่งสอนบอทพูดตอบประโยคของคุณ (${prefix}${command.teach[1].text} <คำถาม> <คำตอบ>)`+
      `\n- คำสั่งเล่นเกมส์ OX กับบอท (${prefix}${command.ox[0].text} หรือ ${prefix}${command.ox[1].text})`,
      //`- คำสั่งเล่นเกมส์เปายิ่งฉุบกับบอท (${prefix}${command.rps[0].text} <rock/paper/scissors> หรือ ${prefix}${command.rps[1].text} <ค้อน/กระดาษ/กรรไกร>)`,
    //`- คำสั่งเล่นเกมส์ปริศนาคำทายกับบอท (${prefix}อะไรเอ๋ย)`,
    //`- คำสั่งเล่นเกมส์คิดเลขเร็วกับบอท (${prefix}คิดเลขเร็ว)`,
      `[รายการคำสั่งสำหรับกลุ่ม]`+
    //`- คำสั่งดูข้อมูลกลุ่ม (${prefix}group หรือ ${prefix}กลุ่ม)`,
    //'\n- คำสั่งดูรายชื่อสมาชิกกลุ่ม ('+prefix+'member หรือ '+prefix+'สมาชิก)' +
    //'\n- คำสั่งเปิดใช้ข้อความต้อนรับ ('+prefix+'joinmsg on หรือ '+prefix+'ข้อความเข้า เปิด)' +
    //'\n- คำสั่งปิดใช้ข้อความต้อนรับ ('+prefix+'joinmsg off หรือ '+prefix+'ข้อความเข้า ปิด)' +
    //'\n- คำสั่งแก้ไขข้อความต้อนรับ ('+prefix+'joinmsg <ข้อความ> หรือ '+prefix+'ข้อความเข้า <ข้อความ>)' +
    //'\n- คำสั่งดูตัวอย่างข้อความต้อนรับ ('+prefix+'welcome หรือ '+prefix+'ยินดีต้อนรับ)' +
    //'\n- คำสั่งเปิดใช้รูปภาพต้อนรับ ('+prefix+'joinimg on หรือ '+prefix+'รูปเข้า เปิด)' +
    //'\n- คำสั่งปิดใช้รูปภาพต้อนรับ ('+prefix+'joinimg off หรือ '+prefix+'รูปเข้า ปิด)' +
    //'\n- คำสั่งแก้ไขพื้นหลังของรูปภาพต้อนรับ ('+prefix+'joinimg <URL นามสกุล .png/.jpg/.jpeg> หรือ '+prefix+'รูปเข้า <URL นามสกุล .png/.jpg/.jpeg>)' +
    //'\n- คำสั่งเปิดใช้ข้อความบอกลา ('+prefix+'leftmsg on หรือ '+prefix+'ข้อความออก เปิด)' +
    //'\n- คำสั่งปิดใช้ข้อความบอกลา ('+prefix+'leftmsg off หรือ '+prefix+'ข้อความออก ปิด)' +
    //'\n- คำสั่งแก้ไขข้อความบอกลา ('+prefix+'leftmsg <ข้อความ> หรือ '+prefix+'ข้อความออก <ข้อความ>)' +
    //'\n- คำสั่งดูตัวอย่างข้อความบอกลา ('+prefix+'goodbye หรือ '+prefix+'ลาก่อน)' +
    //'\n- คำสั่งเปิดใช้รูปภาพบอกลา ('+prefix+'leftimg on หรือ '+prefix+'รูปออก เปิด)' +
    //'\n- คำสั่งปิดใช้รูปภาพบอก ('+prefix+'leftimg off หรือ '+prefix+'รูปออก ปิด)' +
    //'\n- คำสั่งแก้ไขพื้นหลังของรูปภาพบอกลา ('+prefix+'leftimg <URL นามสกุล .png/.jpg/.jpeg> หรือ '+prefix+'รูปออก <URL นามสกุล .png/.jpg/.jpeg>)' +
      `\n- คำสั่งเชิญบอทออกจากกลุ่ม/ห้องแชท (bye)`+
      ``,`ปล.ไม่ควรใช้ <> หรือ () ในคำสั่งและเว้นวรรคให้ถูกต้องค่ะ`
    ];
    return replyText(replyToken, text);
  }
  if (cmd === command.teach[1].text) {
    luna.newUser(sender.id);
    let ask = message.text.split(' ')[1];
    let ans = args.slice(1).join(' ');
    if ((!ask || !ans) && (ask.length < 1 || ans.length < 1)) return replyText(replyToken, 'ป้อนคำสั่งไม่ถูกต้อง กรุณาลองใหม่อีกครั้งค่ะ `.สอน (คำถาม) (คำตอบ)`');
    luna.learn(ask,ans,'สีหน้า');
    let teach = '';
    if(luna.isPoint(ask,sender.id))
    {
      teach = `\n\`คุณได้รับแต้มจาก${botname} +10 แต้ม\``;
      luna.setLove(sender.id,10);
    }
    replyText(replyToken, `ขอบคุณที่สอน${botname}พูดนะคะ ${teach}`);
    webhooks(
      { 
        "embeds": [ {
          "title": `ID: ${author.id}`,
          "description": `${message.text}`,
          "thumbnail": {
            "url": `${author.avatarURL}`
          },
          "author": {
            "name": `${author.username}`,
            "icon_url": `${author.avatarURL}`
          },
          "color": 4886754,
          "footer": {
            "text": `Event Text |`,
            "icon_url": `${friendAvatar}`
          }
        },
        {
          "color": 0xffffff,
          "author": {
            "name": `${author.username} สอนเฟรนพูด`,
            "icon_url": `${author.avatarURL}`
          },
          "fields": [
            {
              "name": `คำถาม`,
              "value": `${ask}`,
              "inline": true
            },
            {
              "name": `คำตอบ`,
              "value": `${ans}`,
              "inline": true
            }
          ]
        } ]
      }
    );
    return;
  }
  if (cmd === 'eval') {
    if (author.id !== chaID) return;
    eval(args.join(' '));
  }
  return;
}

function handleJoin(message, replyToken, source) {
  console.log('[Joined]\n'+message);
  if (source.type !== 'group') return;
  client.getGroupMemberProfile(source.groupId, source.userId)
  .then((profile) => {
  let author = {
    id: profile.userId,
    username: profile.displayName,
    avatarURL: profile.pictureUrl,
    type: source.type
  };
  webhooks(
    { 
      "embeds": [ {
        "title": `ID: ${author.id}`,
        "description": `Joined the ${author.type}`,
        "image": {
          "url": `${author.avatarURL}`
        },
        "author": {
          "name": `${author.username}`,
          "icon_url": `${author.avatarURL}`
        },
        "color": 4886754,
        "footer": {
          "text": `Event Member Joined |`,
          "icon_url": `${friendAvatar}`
        }
      } ]
    }
  );
  return;
  });
}

function handleLeave(message, replyToken, source) {
  console.log('[Left]\n'+message);
  if (source.type !== 'group') return;
  client.getGroupMemberProfile(source.groupId, source.userId)
  .then((profile) => {
  if (!profile) return;
  let author = {
    id: profile.userId,
    username: profile.displayName,
    avatarURL: profile.pictureUrl,
    type: source.type
  };
  webhooks(
    { 
      "embeds": [ {
        "title": `ID: ${author.id}`,
        "description": `Left the ${author.type}`,
        "image": {
          "url": `${author.avatarURL}`
        },
        "author": {
          "name": `${author.username}`,
          "icon_url": `${author.avatarURL}`
        },
        "color": 4886754,
        "footer": {
          "text": `Event Text |`,
          "icon_url": `${friendAvatar}`
        }
      } ]
    }
  );
  return;
  });
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  switch (message.text) {
    case 'invite':
      return replyText(replyToken, `เข้ากลุ่มแชทบอท\n${botInvite}`);
    case 'profile':
      if (source.userId) {
        var profile;
        try {
          client.getProfile(source.userId)
          .then((p) => {
            profile = p;
          });
        } catch(err) {
          console.error(err);
        }
        return replyText(replyToken, `ชื่อ: ${profile.displayName}\nสถานะ: ${profile.statusMessage}`);
        //sendAvatar(message, replyToken);
      } else {
        return replyText(replyToken, 'คุณไม่สามารถใช้คำสั่งนี้ได้ค่ะ');
      }
    case '!buttons':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
              { label: 'Say message', type: 'message', text: 'Rice=米' },
            ],
          },
        }
      );
    case '!confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    case '!carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                  { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                  { label: 'Say message', type: 'message', text: 'Rice=米' },
                ],
              },
            ],
          },
        }
      );
    case '!image carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Image carousel alt text',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say message', type: 'message', text: 'Rice=米' },
              },
              {
                imageUrl: buttonsImageURL,
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      );
    case '!datetime':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      );
    case '!imagemap':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
          video: {
            originalContentUrl: `${baseURL}/static/imagemap/video.mp4`,
            previewImageUrl: `${baseURL}/static/imagemap/preview.jpg`,
            area: {
              x: 280,
              y: 385,
              width: 480,
              height: 270,
            },
            externalLink: {
              linkUri: 'https://line.me',
              label: 'LINE'
            }
          },
        }
      );
    case 'bye':
      switch (source.type) {
        case 'user':
          return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
        case 'group':
          return replyText(replyToken, '✅ | เฟรนกำลังออกจากกลุ่มค่ะ')
            .then(() => client.leaveGroup(source.groupId));
        case 'room':
          return replyText(replyToken, '✅ | เฟรนกำลังออกจากห้องค่ะ')
            .then(() => client.leaveRoom(source.roomId));
      }
    default:
      console.log(`Message: ${message.text} to ${replyToken}`);var author;// = { type:'', id:'' ,username:'', status:'', avatarURL:'' };
      client.getProfile(source.userId)
      .then((profile) => {
        console.log('[Profile]');
        console.log(profile);
        let author = { 
          type: source.type,
          gid: '',
          mention: [],
          id: profile.userId,
          username: profile.displayName,
          status: profile.statusMessage,
          avatarURL: profile.pictureUrl
        };
        if (source.type == 'group') author.gid = source.groupId;
        return handleMessage(author, message, replyToken);
      });
  }
}

function handleImage(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    var downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
    var previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);
    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);
        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        };
      });
  } else if (message.contentProvider.type === "external") {
    getContent = Promise.resolve(message.contentProvider);
  }
  
  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl,
          previewImageUrl,
        }
      ).then(
webhooks(
  { 
    "embeds": [ 
    {
      "title": `ID: ${author.id}`,
      "image": {
        "url": `${originalContentUrl.originalContentUrl}`
      },
      "author": {
        "name": `${author.username}`,
        "icon_url": `${author.avatarURL}`
      },
      "color": 4886754,
      "footer": {
        "text": `Event Image |`,
        "icon_url": `${friendAvatar}`
      }
    } 
    ]
  }
)
     );
    });
}

function handleVideo(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
    const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);
    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      });
  } else if (message.contentProvider.type === "external") {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl,
          previewImageUrl,
        }
      );
    });
}

function handleAudio(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);
    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        return {
            originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
        };
      });
  } else {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl,
          duration: message.duration,
        }
      );
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  if (!message.packageId) return;
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (baseURL) {
    console.log('listening on '+baseURL+':'+port+'/callback');
  } else {
    console.log("It seems that BASE_URL is not set. Connecting to ngrok...");
    ngrok.connect(port, (err, url) => {
      if (err) throw err;
      baseURL = url;
      console.log('listening on '+baseURL+'/callback');
    });
  }
});