const redis = require('redis');

var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', function(err) {
    console.log(err);
});


function checkCache(){
    client.get('user', function(err, data) {
        if (err) {
            console.log(err)
        }else if(data){
            console.log('The value of the "user" key is ' + data);
            return true;
        }else if (!data){
            return false;
        }
    })
}

function setCache(userObj){
    client.set('user',userObj, function(err, data) {
        if (err) {
            return console.log(err);
        }else {
            console.log("this is cached", data);

        }

    });
}


function deleteCache(){
    client.del('user', function(err, data) {
        if (err) {
            return console.log(err);
        }else {
            console.log("the cache is deleted");

        }

    });
}


module.exports.checkCache = checkCache;
module.exports.setCache = setCache;
module.exports.deleteCache = deleteCache;
