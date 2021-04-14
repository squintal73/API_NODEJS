//const app = require('./config');
const state = require('./state');
const xml = require("xml2js");
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('./public'));

//let fs = require('fs');

//app.use(express.static('./public'));

// fs.writeFile("./files/example.xml",'Um breve texto aqui!', function(err){
// 	//Caro ocorra algum erro
//   if(err){
// 		return console.log('erro')
// 	}
//   //Caso não tenha erro, retornaremos a mensagem de sucesso
// 	console.log('Arquivo Criado');
// })


const Sequelize = require('sequelize');
const sequelize = new Sequelize('back_homolog_07042020', 'postgres', 'postgres', {
  host: 'localhost',
  port: '25432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

const builder = new xml.Builder({
  renderOpts: { 'pretty': false }
});

const bustHeaders = (request, response, next) => {
  request.app.isXml = false;

  if (request.headers['content-type'] === 'application/xml'
    || request.headers['accept'] === 'application/xml'
  ) {
    request.app.isXml = true;
  }

  next();
};

const buildResponse = (response, statusCode, data, preTag) => {
  response.format({
    'application/json': () => {
      response.status(statusCode).json(data);
    },
    'application/xml': () => {
      response.status(statusCode).send(builder.buildObject({[preTag]: data }));
    },
    'default': () => {
      response.status(406).send('Not Acceptable');
    }
  });
};

// app.use(function (req, res, next) {
//     console.log("/" + req.method);
//     next();
//   });

app.get('/BalanceteContabilGeral', bustHeaders, (req, res) => {

const sql = ` select
            replace(cod_estrutural, '.', '') as ContaContabil,
            '1' as EntidadeCtb,
            vl_saldo_anterior as SaldoInicial,
            vl_saldo_creditos as MovimentoCredito,
            vl_saldo_debitos as MovimentoDebito,
            vl_saldo_atual as SaldoFinal
            from
            contabilidade.fn_rl_balancete_verificacao( '2020',
            'cod_entidade IN  (1 ) ' ,
            '01/01/2020',
            '31/12/2020',
            'A'::char ) as retorno( cod_estrutural varchar,
            nivel integer,
            nom_conta varchar,
            cod_sistema integer,
            indicador_superavit varchar,
            vl_saldo_anterior numeric,
            vl_saldo_debitos numeric,
            vl_saldo_creditos numeric,
            vl_saldo_atual numeric )`;

const dados = 'BalanceteContabilGeral';

sequelize.query(sql,
{type: sequelize.QueryTypes.SELECT })
            .then(function(result) {
                  if (req.app.isXml) {
                       res.setHeader('Content-Type', 'application/xml');
                       }
                  if (result && result[0]) {

                      const conta = buildResponse(res, 200, { MovimentoMensal : result }, dados);
                    //  conta = JSON.string(conta)
                      state.save(result)
                     return result;

                      }
                  return buildResponse(res, 200, { message: 'NO DATA FOUND' });
                 })
            .catch((error) => buildResponse(res, 500, { message: 'INTERNAL SERVER ERROR' }));

           });

app.listen(port, () => {
    console.log(`Port : ${port}`)});
