var { expressjwt: jwt } = require("express-jwt");
const secret = process.env.SECRET;
const api = process.env.API_URL;

function authJwt(){
    return jwt({
        secret: `${secret}`,
        algorithms: ["HS256"],
        isRevoked: isRevoked
    }).unless({
        path: [
                {url: /\/public\/uploads(.*)/, methods:['GET', 'OPTIONS']},
                {url: /\/api\/v1\/products(.*)/, methods: ['GET','OPTIONS']},
                {url: /\/api\/v1\/categories(.*)/, methods: ['GET','OPTIONS']},
                {url: /\/api\/v1\/sizes(.*)/, methods: ['GET','OPTIONS']},
                `${api}/users/login`,
                `${api}/users/register`,
                `${api}/users/count`,
                `${api}/products/count`,
                `${api}/products/list`,
                `${api}/products/register`,
                `${api}/products/`,
                `${api}/users/checksecret/`,
                `${api}/sizes/register`,
                `${api}/categories/register`,
                `${api}/categories/register`,
                `${api}/sizes`
            ]
    })
}

async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true)
    }

    done();
}

module.exports = authJwt;