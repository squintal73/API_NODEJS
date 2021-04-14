const fs = require('fs')
const contentFilePath = './files/BalanceteContabilGeral.json'

function save(content){
  fs.writeFile(contentFilePath, content , function(err){
    if(err){
  		return console.log('erro')
  	}
  	console.log('Arquivo Criado');
  })
//
//  return fs.writeFileSync(contentFilePath, contentString)
}
module.exports = {
 save
}
