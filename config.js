const express = require('express')

function app (){
    const app = express();
    app.set('port', 3000);
    app.use(express.static('./public'));
  return app;
}

module.exports = {
  app
}
